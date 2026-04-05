"""Paper Trade API routes."""

from fastapi import APIRouter
import json
import aiosqlite

from database import DB_PATH

router = APIRouter(prefix="/api", tags=["paper-trades"])


@router.get("/paper-trades")
async def get_paper_trades(status: str = None, limit: int = 50):
    """Get paper trade history."""
    query = "SELECT * FROM paper_trades"
    params = []

    if status:
        query += " WHERE status = ?"
        params.append(status)

    query += " ORDER BY opened_at DESC LIMIT ?"
    params.append(limit)

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        trades = [dict(row) for row in rows]

    return {"trades": trades, "count": len(trades)}


@router.post("/paper-trade/{signal_id}")
async def manual_paper_trade(signal_id: int):
    """Manually trigger a paper trade for a specific signal."""
    from services.paper_trader import execute_paper_trade

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM signals WHERE id = ?", (signal_id,))
        signal_row = await cursor.fetchone()

        if not signal_row:
            return {"error": "Signal not found"}, 404

        signal = dict(signal_row)

    trade = await execute_paper_trade(signal)
    if trade:
        return {"trade": trade, "message": "Paper trade executed"}
    else:
        return {"message": "Trade not executed (score <= 75 or error)"}
