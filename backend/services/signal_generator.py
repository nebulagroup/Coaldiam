"""Signal Generator Service

Orchestrates the full signal generation pipeline:
tickers → market data → strategies → Gemini scoring → DB storage → WebSocket broadcast
"""

import json
from typing import List, Dict, Any
from datetime import datetime
import aiosqlite

from config import settings
from database import DB_PATH
from services.market_data import fetch_ohlcv, fetch_options_chain, fetch_live_prices
from services.gemini_scorer import score_signal_with_gemini
from services.paper_trader import execute_paper_trade
from strategies.momentum import detect_momentum_breakout
from strategies.mean_reversion import detect_mean_reversion
from strategies.options_flow import detect_options_flow
from strategies.gemini_pattern import detect_gemini_pattern


# WebSocket manager reference (set by main.py)
ws_manager = None


def set_ws_manager(manager):
    """Set the WebSocket connection manager reference."""
    global ws_manager
    ws_manager = manager


async def generate_signals(tickers: List[str], timeframe: str = "1d") -> List[Dict[str, Any]]:
    """
    Full signal generation pipeline.
    
    1. Fetch market data for each ticker
    2. Run all 4 strategy detectors
    3. Score qualifying setups with Gemini
    4. Store in database
    5. Auto paper-trade if score > 75
    6. Broadcast via WebSocket
    
    Returns list of generated signal objects.
    """
    all_signals = []

    for ticker in tickers:
        try:
            # Fetch data
            ohlcv_daily = await fetch_ohlcv(ticker, period="3mo", interval="1d")

            if ohlcv_daily.empty:
                continue

            current_price = float(ohlcv_daily.iloc[-1]["Close"])
            setups = []

            # Strategy 1: Momentum Breakout
            try:
                momentum_setups = detect_momentum_breakout(ohlcv_daily, ticker)
                setups.extend(momentum_setups)
            except Exception as e:
                print(f"Momentum strategy error for {ticker}: {e}")

            # Strategy 2: Mean Reversion
            try:
                mean_rev_setups = detect_mean_reversion(ohlcv_daily, ticker)
                setups.extend(mean_rev_setups)
            except Exception as e:
                print(f"Mean reversion strategy error for {ticker}: {e}")

            # Strategy 3: Options Flow
            try:
                calls, puts = await fetch_options_chain(ticker)
                flow_setups = detect_options_flow(calls, puts, ticker, current_price)
                setups.extend(flow_setups)
            except Exception as e:
                print(f"Options flow strategy error for {ticker}: {e}")

            # Strategy 4: Gemini Pattern
            try:
                daily_data = ohlcv_daily.tail(20).reset_index().to_dict("records")
                # Format for JSON serialization
                formatted_daily = []
                for row in daily_data:
                    formatted_daily.append({
                        "date": str(row.get("Date", row.get("index", ""))),
                        "open": round(float(row["Open"]), 2),
                        "high": round(float(row["High"]), 2),
                        "low": round(float(row["Low"]), 2),
                        "close": round(float(row["Close"]), 2),
                        "volume": int(row["Volume"]),
                    })

                gemini_setups = detect_gemini_pattern(
                    formatted_daily, formatted_daily, formatted_daily,
                    ticker, current_price
                )
                setups.extend(gemini_setups)
            except Exception as e:
                print(f"Gemini pattern strategy error for {ticker}: {e}")

            # Score each setup with Gemini
            for setup in setups:
                try:
                    scored = await score_signal_with_gemini(setup)

                    direction = scored.get("direction", setup.get("direction", "bullish"))
                    if direction == "pending":
                        direction = "bullish"

                    signal = {
                        "ticker": ticker,
                        "strategy": setup["strategy"],
                        "direction": direction,
                        "score": scored["score"],
                        "entry_price": setup["entry_price"],
                        "target_price": scored.get("target_price", setup.get("target_price", setup["entry_price"] * 1.02)),
                        "stop_loss": scored.get("stop_loss", setup.get("stop_loss", setup["entry_price"] * 0.98)),
                        "options_play": scored.get("options_play", ""),
                        "thesis": scored.get("thesis", ""),
                        "confidence_factors": scored.get("confidence_factors", []),
                        "invalidation": scored.get("invalidation", ""),
                        "risk_reward": scored.get("risk_reward", "1:2"),
                    }

                    # Store in database
                    async with aiosqlite.connect(DB_PATH) as db:
                        cursor = await db.execute("""
                            INSERT INTO signals (ticker, strategy, direction, score, entry_price,
                                target_price, stop_loss, options_play, thesis, confidence_factors,
                                invalidation, risk_reward, status, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
                        """, (
                            signal["ticker"], signal["strategy"], signal["direction"],
                            signal["score"], signal["entry_price"], signal["target_price"],
                            signal["stop_loss"], signal["options_play"], signal["thesis"],
                            json.dumps(signal["confidence_factors"]), signal["invalidation"],
                            signal["risk_reward"], datetime.utcnow().isoformat()
                        ))
                        signal["id"] = cursor.lastrowid
                        signal["status"] = "active"
                        signal["created_at"] = datetime.utcnow().isoformat()
                        await db.commit()

                    # Auto paper-trade if score > 75
                    if signal["score"] > 75:
                        trade = await execute_paper_trade(signal)
                        if trade:
                            print(f"📈 Paper trade executed: {signal['ticker']} {signal['direction']} @ ${signal['entry_price']}")

                    # Broadcast via WebSocket
                    if ws_manager:
                        await ws_manager.broadcast(json.dumps({
                            "type": "new_signal",
                            "data": signal
                        }))

                    all_signals.append(signal)

                except Exception as e:
                    print(f"Error scoring/storing signal for {ticker}: {e}")

        except Exception as e:
            print(f"Error generating signals for {ticker}: {e}")

    return all_signals
