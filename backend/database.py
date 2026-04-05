"""SQLite database setup and operations."""

import aiosqlite
import json
from datetime import datetime, timedelta
import random
from config import settings

DB_PATH = settings.DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    strategy TEXT NOT NULL,
    direction TEXT NOT NULL,
    score INTEGER NOT NULL,
    entry_price REAL NOT NULL,
    target_price REAL NOT NULL,
    stop_loss REAL NOT NULL,
    options_play TEXT DEFAULT '',
    thesis TEXT DEFAULT '',
    confidence_factors TEXT DEFAULT '[]',
    invalidation TEXT DEFAULT '',
    risk_reward TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL,
    resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS paper_trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    signal_id INTEGER NOT NULL,
    ticker TEXT NOT NULL,
    direction TEXT NOT NULL,
    entry_price REAL NOT NULL,
    exit_price REAL,
    quantity INTEGER NOT NULL DEFAULT 10,
    pnl REAL,
    status TEXT DEFAULT 'open',
    opened_at TEXT NOT NULL,
    closed_at TEXT,
    FOREIGN KEY (signal_id) REFERENCES signals(id)
);

CREATE TABLE IF NOT EXISTS performance_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    total_signals INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    cumulative_pnl REAL DEFAULT 0.0
);
"""


async def get_db() -> aiosqlite.Connection:
    """Get a database connection."""
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db():
    """Initialize the database schema."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript(SCHEMA)
        await db.commit()


async def seed_mock_data():
    """Seed the database with realistic mock data for development."""
    async with aiosqlite.connect(DB_PATH) as db:
        # Check if data already exists
        cursor = await db.execute("SELECT COUNT(*) FROM signals")
        count = (await cursor.fetchone())[0]
        if count > 0:
            return

        now = datetime.utcnow()
        tickers = ["SPY", "QQQ", "AAPL", "TSLA", "NVDA", "AMZN"]
        strategies = ["momentum_breakout", "mean_reversion", "options_flow", "gemini_pattern"]
        directions = ["bullish", "bearish"]

        mock_signals = [
            # Active signals
            {"ticker": "SPY", "strategy": "momentum_breakout", "direction": "bullish", "score": 87,
             "entry_price": 527.50, "target_price": 535.00, "stop_loss": 524.00,
             "options_play": "SPY 530C 0DTE @ $2.15", "thesis": "SPY reclaimed VWAP with 2.3x average volume and EMA-9 crossover confirmed. Institutional buying pressure evident in the first 30 minutes of market open with strong bid-side aggression.",
             "confidence_factors": json.dumps(["VWAP reclaim with volume", "EMA-9 bullish cross", "Strong market breadth", "Positive sector rotation"]),
             "invalidation": "Break below 524 VWAP level", "risk_reward": "1:2.1", "status": "active",
             "created_at": (now - timedelta(minutes=45)).isoformat()},

            {"ticker": "TSLA", "strategy": "mean_reversion", "direction": "bullish", "score": 79,
             "entry_price": 171.20, "target_price": 178.50, "stop_loss": 168.00,
             "options_play": "TSLA 175C 1DTE @ $1.85", "thesis": "TSLA hit RSI 26 with lower Bollinger Band touch after 4 consecutive red days. Historical mean reversion probability at this RSI level is 72% within 2 days.",
             "confidence_factors": json.dumps(["RSI oversold at 26", "Lower BB touch", "4 consecutive red days", "Volume exhaustion pattern"]),
             "invalidation": "Continued selling below 168 support", "risk_reward": "1:2.3", "status": "active",
             "created_at": (now - timedelta(minutes=30)).isoformat()},

            {"ticker": "NVDA", "strategy": "gemini_pattern", "direction": "bullish", "score": 92,
             "entry_price": 875.30, "target_price": 910.00, "stop_loss": 860.00,
             "options_play": "NVDA 890C weekly @ $12.50", "thesis": "Multi-timeframe confluence detected: daily ascending triangle breakout, 1h EMA ribbon bullish alignment, 15m volume breakout pattern. AI confidence is elevated due to sector momentum and earnings catalyst proximity.",
             "confidence_factors": json.dumps(["Daily ascending triangle", "1H EMA ribbon bullish", "15M volume breakout", "Sector momentum", "Pre-earnings positioning"]),
             "invalidation": "Rejection at 880 resistance with volume", "risk_reward": "1:2.3", "status": "active",
             "created_at": (now - timedelta(minutes=15)).isoformat()},

            {"ticker": "QQQ", "strategy": "options_flow", "direction": "bullish", "score": 81,
             "entry_price": 448.75, "target_price": 455.00, "stop_loss": 445.50,
             "options_play": "QQQ 450C 1DTE @ $3.20", "thesis": "Unusual call volume detected at 450 strike — 3.2x the 30-day average. Large block orders on the ask suggest institutional accumulation ahead of tech earnings week.",
             "confidence_factors": json.dumps(["3.2x unusual call volume", "Block orders on ask", "Pre-earnings positioning", "Positive put/call ratio shift"]),
             "invalidation": "Call volume was hedge against short futures position", "risk_reward": "1:1.9", "status": "active",
             "created_at": (now - timedelta(minutes=10)).isoformat()},

            {"ticker": "AAPL", "strategy": "momentum_breakout", "direction": "bearish", "score": 73,
             "entry_price": 188.40, "target_price": 183.00, "stop_loss": 190.50,
             "options_play": "AAPL 186P 1DTE @ $1.45", "thesis": "AAPL broke below VWAP with increasing volume and EMA-9 death cross on the 15-minute chart. Supply zone overhead at 190 likely to act as resistance on any bounce attempt.",
             "confidence_factors": json.dumps(["VWAP breakdown", "EMA-9 bearish cross", "Increasing sell volume", "Overhead supply zone"]),
             "invalidation": "Reclaim of 190 level with volume", "risk_reward": "1:2.6", "status": "active",
             "created_at": (now - timedelta(minutes=5)).isoformat()},

            # Historical signals (resolved)
            {"ticker": "SPY", "strategy": "momentum_breakout", "direction": "bullish", "score": 85,
             "entry_price": 522.00, "target_price": 528.00, "stop_loss": 519.50,
             "options_play": "SPY 524C 0DTE @ $1.90", "thesis": "Morning VWAP reclaim with strong volume confirmation.",
             "confidence_factors": json.dumps(["VWAP reclaim", "2x volume", "Positive breadth"]),
             "invalidation": "Below 519.50", "risk_reward": "1:2.4", "status": "hit_target",
             "created_at": (now - timedelta(days=1)).isoformat(), "resolved_at": (now - timedelta(hours=20)).isoformat()},

            {"ticker": "TSLA", "strategy": "gemini_pattern", "direction": "bullish", "score": 88,
             "entry_price": 165.00, "target_price": 175.00, "stop_loss": 161.00,
             "options_play": "TSLA 170C weekly @ $3.40", "thesis": "AI detected ascending wedge breakout with volume confirmation.",
             "confidence_factors": json.dumps(["Ascending wedge", "Volume breakout", "Sector strength"]),
             "invalidation": "Below 161", "risk_reward": "1:2.5", "status": "hit_target",
             "created_at": (now - timedelta(days=2)).isoformat(), "resolved_at": (now - timedelta(days=1, hours=18)).isoformat()},

            {"ticker": "AMZN", "strategy": "mean_reversion", "direction": "bullish", "score": 76,
             "entry_price": 185.50, "target_price": 192.00, "stop_loss": 183.00,
             "options_play": "AMZN 188C weekly @ $2.80", "thesis": "RSI oversold bounce at key support level.",
             "confidence_factors": json.dumps(["RSI at 28", "Key support", "Volume exhaustion"]),
             "invalidation": "Below 183", "risk_reward": "1:2.6", "status": "hit_target",
             "created_at": (now - timedelta(days=3)).isoformat(), "resolved_at": (now - timedelta(days=2, hours=10)).isoformat()},

            {"ticker": "QQQ", "strategy": "momentum_breakout", "direction": "bearish", "score": 71,
             "entry_price": 445.00, "target_price": 438.00, "stop_loss": 447.50,
             "options_play": "QQQ 442P 0DTE @ $1.65", "thesis": "VWAP breakdown with sector weakness.",
             "confidence_factors": json.dumps(["VWAP breakdown", "Sector weakness", "Rising VIX"]),
             "invalidation": "Reclaim 447.50", "risk_reward": "1:2.8", "status": "hit_stop",
             "created_at": (now - timedelta(days=3)).isoformat(), "resolved_at": (now - timedelta(days=2, hours=22)).isoformat()},

            {"ticker": "NVDA", "strategy": "options_flow", "direction": "bullish", "score": 83,
             "entry_price": 860.00, "target_price": 885.00, "stop_loss": 850.00,
             "options_play": "NVDA 870C weekly @ $15.00", "thesis": "Massive call buying at 870 strike, 4x average volume.",
             "confidence_factors": json.dumps(["4x call volume", "Institutional blocks", "Sector momentum"]),
             "invalidation": "Below 850", "risk_reward": "1:2.5", "status": "hit_target",
             "created_at": (now - timedelta(days=4)).isoformat(), "resolved_at": (now - timedelta(days=3, hours=8)).isoformat()},

            {"ticker": "AAPL", "strategy": "gemini_pattern", "direction": "bearish", "score": 77,
             "entry_price": 192.00, "target_price": 186.00, "stop_loss": 194.50,
             "options_play": "AAPL 190P weekly @ $2.10", "thesis": "Head and shoulders pattern confirmed on daily chart.",
             "confidence_factors": json.dumps(["H&S pattern", "Volume divergence", "Weak sector"]),
             "invalidation": "Above 194.50", "risk_reward": "1:2.4", "status": "hit_target",
             "created_at": (now - timedelta(days=5)).isoformat(), "resolved_at": (now - timedelta(days=4, hours=6)).isoformat()},

            {"ticker": "SPY", "strategy": "mean_reversion", "direction": "bullish", "score": 80,
             "entry_price": 518.00, "target_price": 524.00, "stop_loss": 515.00,
             "options_play": "SPY 520C 1DTE @ $2.30", "thesis": "RSI oversold with Bollinger Band touch.",
             "confidence_factors": json.dumps(["RSI 27", "BB lower touch", "Support zone"]),
             "invalidation": "Below 515", "risk_reward": "1:2.0", "status": "hit_stop",
             "created_at": (now - timedelta(days=5)).isoformat(), "resolved_at": (now - timedelta(days=4, hours=20)).isoformat()},

            {"ticker": "TSLA", "strategy": "options_flow", "direction": "bearish", "score": 69,
             "entry_price": 178.00, "target_price": 170.00, "stop_loss": 181.00,
             "options_play": "TSLA 175P weekly @ $2.60", "thesis": "Unusual put volume surge before earnings.",
             "confidence_factors": json.dumps(["Put volume surge", "Pre-earnings", "Weak technicals"]),
             "invalidation": "Above 181", "risk_reward": "1:2.7", "status": "hit_target",
             "created_at": (now - timedelta(days=6)).isoformat(), "resolved_at": (now - timedelta(days=5, hours=4)).isoformat()},

            {"ticker": "AMZN", "strategy": "momentum_breakout", "direction": "bullish", "score": 82,
             "entry_price": 188.00, "target_price": 195.00, "stop_loss": 185.50,
             "options_play": "AMZN 190C weekly @ $3.10", "thesis": "Breakout above consolidation range with volume.",
             "confidence_factors": json.dumps(["Range breakout", "Volume expansion", "Sector strength"]),
             "invalidation": "Below 185.50", "risk_reward": "1:2.8", "status": "hit_target",
             "created_at": (now - timedelta(days=7)).isoformat(), "resolved_at": (now - timedelta(days=6, hours=12)).isoformat()},

            {"ticker": "QQQ", "strategy": "gemini_pattern", "direction": "bullish", "score": 90,
             "entry_price": 440.00, "target_price": 452.00, "stop_loss": 436.00,
             "options_play": "QQQ 445C weekly @ $4.50", "thesis": "Cup and handle pattern with AI confluence scoring above 90.",
             "confidence_factors": json.dumps(["Cup and handle", "AI pattern match 94%", "Volume confirmation"]),
             "invalidation": "Below 436", "risk_reward": "1:3.0", "status": "hit_target",
             "created_at": (now - timedelta(days=8)).isoformat(), "resolved_at": (now - timedelta(days=7, hours=8)).isoformat()},

            {"ticker": "NVDA", "strategy": "mean_reversion", "direction": "bullish", "score": 74,
             "entry_price": 840.00, "target_price": 860.00, "stop_loss": 830.00,
             "options_play": "NVDA 850C weekly @ $10.00", "thesis": "Oversold bounce at major support.",
             "confidence_factors": json.dumps(["RSI 29", "Major support", "Sector oversold"]),
             "invalidation": "Below 830", "risk_reward": "1:2.0", "status": "hit_stop",
             "created_at": (now - timedelta(days=9)).isoformat(), "resolved_at": (now - timedelta(days=8, hours=16)).isoformat()},

            {"ticker": "SPY", "strategy": "options_flow", "direction": "bullish", "score": 86,
             "entry_price": 520.00, "target_price": 528.00, "stop_loss": 517.00,
             "options_play": "SPY 524C 1DTE @ $2.00", "thesis": "Massive institutional call buying detected.",
             "confidence_factors": json.dumps(["5x call volume", "Institutional flow", "VIX declining"]),
             "invalidation": "Below 517", "risk_reward": "1:2.7", "status": "hit_target",
             "created_at": (now - timedelta(days=10)).isoformat(), "resolved_at": (now - timedelta(days=9, hours=6)).isoformat()},

            {"ticker": "AAPL", "strategy": "momentum_breakout", "direction": "bullish", "score": 78,
             "entry_price": 186.00, "target_price": 192.00, "stop_loss": 183.50,
             "options_play": "AAPL 188C 1DTE @ $1.70", "thesis": "VWAP reclaim with morning momentum.",
             "confidence_factors": json.dumps(["VWAP reclaim", "Morning momentum", "Sector rotation"]),
             "invalidation": "Below 183.50", "risk_reward": "1:2.4", "status": "expired",
             "created_at": (now - timedelta(days=11)).isoformat(), "resolved_at": (now - timedelta(days=10)).isoformat()},
        ]

        for signal in mock_signals:
            await db.execute("""
                INSERT INTO signals (ticker, strategy, direction, score, entry_price, target_price,
                    stop_loss, options_play, thesis, confidence_factors, invalidation, risk_reward,
                    status, created_at, resolved_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                signal["ticker"], signal["strategy"], signal["direction"], signal["score"],
                signal["entry_price"], signal["target_price"], signal["stop_loss"],
                signal["options_play"], signal["thesis"], signal["confidence_factors"],
                signal["invalidation"], signal["risk_reward"], signal["status"],
                signal["created_at"], signal.get("resolved_at")
            ))

        # Seed paper trades for resolved signals
        mock_trades = [
            {"signal_id": 6, "ticker": "SPY", "direction": "bullish", "entry_price": 522.00, "exit_price": 528.00, "quantity": 10, "pnl": 60.00, "status": "closed",
             "opened_at": (now - timedelta(days=1)).isoformat(), "closed_at": (now - timedelta(hours=20)).isoformat()},
            {"signal_id": 7, "ticker": "TSLA", "direction": "bullish", "entry_price": 165.00, "exit_price": 175.00, "quantity": 10, "pnl": 100.00, "status": "closed",
             "opened_at": (now - timedelta(days=2)).isoformat(), "closed_at": (now - timedelta(days=1, hours=18)).isoformat()},
            {"signal_id": 8, "ticker": "AMZN", "direction": "bullish", "entry_price": 185.50, "exit_price": 192.00, "quantity": 10, "pnl": 65.00, "status": "closed",
             "opened_at": (now - timedelta(days=3)).isoformat(), "closed_at": (now - timedelta(days=2, hours=10)).isoformat()},
            {"signal_id": 9, "ticker": "QQQ", "direction": "bearish", "entry_price": 445.00, "exit_price": 447.50, "quantity": 10, "pnl": -25.00, "status": "closed",
             "opened_at": (now - timedelta(days=3)).isoformat(), "closed_at": (now - timedelta(days=2, hours=22)).isoformat()},
            {"signal_id": 10, "ticker": "NVDA", "direction": "bullish", "entry_price": 860.00, "exit_price": 885.00, "quantity": 5, "pnl": 125.00, "status": "closed",
             "opened_at": (now - timedelta(days=4)).isoformat(), "closed_at": (now - timedelta(days=3, hours=8)).isoformat()},
            {"signal_id": 11, "ticker": "AAPL", "direction": "bearish", "entry_price": 192.00, "exit_price": 186.00, "quantity": 10, "pnl": 60.00, "status": "closed",
             "opened_at": (now - timedelta(days=5)).isoformat(), "closed_at": (now - timedelta(days=4, hours=6)).isoformat()},
            {"signal_id": 12, "ticker": "SPY", "direction": "bullish", "entry_price": 518.00, "exit_price": 515.00, "quantity": 10, "pnl": -30.00, "status": "closed",
             "opened_at": (now - timedelta(days=5)).isoformat(), "closed_at": (now - timedelta(days=4, hours=20)).isoformat()},
            {"signal_id": 13, "ticker": "TSLA", "direction": "bearish", "entry_price": 178.00, "exit_price": 170.00, "quantity": 10, "pnl": 80.00, "status": "closed",
             "opened_at": (now - timedelta(days=6)).isoformat(), "closed_at": (now - timedelta(days=5, hours=4)).isoformat()},
            {"signal_id": 14, "ticker": "AMZN", "direction": "bullish", "entry_price": 188.00, "exit_price": 195.00, "quantity": 10, "pnl": 70.00, "status": "closed",
             "opened_at": (now - timedelta(days=7)).isoformat(), "closed_at": (now - timedelta(days=6, hours=12)).isoformat()},
            {"signal_id": 15, "ticker": "QQQ", "direction": "bullish", "entry_price": 440.00, "exit_price": 452.00, "quantity": 10, "pnl": 120.00, "status": "closed",
             "opened_at": (now - timedelta(days=8)).isoformat(), "closed_at": (now - timedelta(days=7, hours=8)).isoformat()},
        ]

        for trade in mock_trades:
            await db.execute("""
                INSERT INTO paper_trades (signal_id, ticker, direction, entry_price, exit_price,
                    quantity, pnl, status, opened_at, closed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                trade["signal_id"], trade["ticker"], trade["direction"], trade["entry_price"],
                trade["exit_price"], trade["quantity"], trade["pnl"], trade["status"],
                trade["opened_at"], trade["closed_at"]
            ))

        # Seed performance snapshots
        cumulative = 0
        for i in range(10, 0, -1):
            daily_pnl = random.uniform(-30, 80)
            cumulative += daily_pnl
            date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            wins = random.randint(1, 3)
            losses = random.randint(0, 1)
            await db.execute("""
                INSERT INTO performance_snapshots (date, total_signals, wins, losses, cumulative_pnl)
                VALUES (?, ?, ?, ?, ?)
            """, (date, wins + losses, wins, losses, round(cumulative, 2)))

        await db.commit()
        print("✅ Mock data seeded successfully")
