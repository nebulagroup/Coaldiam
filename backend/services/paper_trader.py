"""Paper Trading Service

Manages paper trades via Alpaca or mock simulation.
Auto-executes trades when signal score > 75.
"""

import random
from datetime import datetime
from typing import Dict, Any, Optional
import aiosqlite
from config import settings
from database import DB_PATH


async def execute_paper_trade(signal: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Execute a paper trade for a high-score signal.
    Only trades when signal score > 75.
    
    Args:
        signal: Signal dict with id, ticker, direction, entry_price, score, etc.
    
    Returns:
        Trade dict if executed, None if skipped.
    """
    score = signal.get("score", 0)
    if score <= 75:
        return None

    ticker = signal["ticker"]
    direction = signal["direction"]
    entry_price = signal["entry_price"]
    signal_id = signal["id"]
    quantity = 10  # Standard lot size for paper trading

    if settings.USE_MOCK_DATA or not settings.ALPACA_API_KEY or settings.ALPACA_API_KEY == 'your_alpaca_api_key':
        # Mock paper trade
        trade = {
            "signal_id": signal_id,
            "ticker": ticker,
            "direction": direction,
            "entry_price": entry_price,
            "quantity": quantity,
            "status": "open",
            "opened_at": datetime.utcnow().isoformat(),
        }

        async with aiosqlite.connect(DB_PATH) as db:
            cursor = await db.execute("""
                INSERT INTO paper_trades (signal_id, ticker, direction, entry_price, quantity, status, opened_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (signal_id, ticker, direction, entry_price, quantity, "open", trade["opened_at"]))
            trade["id"] = cursor.lastrowid
            await db.commit()

        return trade

    # Real Alpaca trade
    try:
        from alpaca.trading.client import TradingClient
        from alpaca.trading.requests import MarketOrderRequest
        from alpaca.trading.enums import OrderSide, TimeInForce

        client = TradingClient(
            settings.ALPACA_API_KEY,
            settings.ALPACA_SECRET_KEY,
            paper=True
        )

        side = OrderSide.BUY if direction == "bullish" else OrderSide.SELL
        order_request = MarketOrderRequest(
            symbol=ticker,
            qty=quantity,
            side=side,
            time_in_force=TimeInForce.DAY
        )

        order = client.submit_order(order_request)

        trade = {
            "signal_id": signal_id,
            "ticker": ticker,
            "direction": direction,
            "entry_price": entry_price,
            "quantity": quantity,
            "status": "open",
            "opened_at": datetime.utcnow().isoformat(),
        }

        async with aiosqlite.connect(DB_PATH) as db:
            cursor = await db.execute("""
                INSERT INTO paper_trades (signal_id, ticker, direction, entry_price, quantity, status, opened_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (signal_id, ticker, direction, entry_price, quantity, "open", trade["opened_at"]))
            trade["id"] = cursor.lastrowid
            await db.commit()

        return trade

    except Exception as e:
        print(f"Error executing paper trade: {e}")
        return None


async def check_trade_outcomes():
    """Check open paper trades against target/stop prices and close if hit."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT pt.*, s.target_price, s.stop_loss, s.direction
            FROM paper_trades pt
            JOIN signals s ON pt.signal_id = s.id
            WHERE pt.status = 'open'
        """)
        open_trades = await cursor.fetchall()

        for trade in open_trades:
            # In mock mode or if Alpaca keys are missing, simulate random outcome after some time
            if settings.USE_MOCK_DATA or not settings.ALPACA_API_KEY or settings.ALPACA_API_KEY == 'your_alpaca_api_key':
                opened = datetime.fromisoformat(trade["opened_at"])
                elapsed = (datetime.utcnow() - opened).total_seconds()

                if elapsed > 300:  # 5 minutes for mock
                    hit_target = random.random() > 0.35  # ~65% win rate
                    if hit_target:
                        exit_price = trade["target_price"]
                        status = "closed"
                        signal_status = "hit_target"
                    else:
                        exit_price = trade["stop_loss"]
                        status = "closed"
                        signal_status = "hit_stop"

                    if trade["direction"] == "bullish":
                        pnl = (exit_price - trade["entry_price"]) * trade["quantity"]
                    else:
                        pnl = (trade["entry_price"] - exit_price) * trade["quantity"]

                    now = datetime.utcnow().isoformat()
                    await db.execute("""
                        UPDATE paper_trades SET exit_price = ?, pnl = ?, status = ?, closed_at = ?
                        WHERE id = ?
                    """, (exit_price, round(pnl, 2), status, now, trade["id"]))

                    await db.execute("""
                        UPDATE signals SET status = ?, resolved_at = ? WHERE id = ?
                    """, (signal_status, now, trade["signal_id"]))

        await db.commit()
