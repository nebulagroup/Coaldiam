"""Signal API routes."""

from fastapi import APIRouter, Query
from typing import Optional, List
import json
import aiosqlite

from database import DB_PATH
from models import GenerateSignalsRequest, SignalResponse
from services.signal_generator import generate_signals

router = APIRouter(prefix="/api", tags=["signals"])


@router.post("/generate-signals")
async def generate_signals_endpoint(request: GenerateSignalsRequest):
    """Generate trading signals for the given tickers."""
    signals = await generate_signals(request.tickers, request.timeframe)
    return {"signals": signals, "count": len(signals)}


@router.get("/signals")
async def get_signals(
    ticker: Optional[str] = Query(None),
    strategy: Optional[str] = Query(None),
    direction: Optional[str] = Query(None),
    min_score: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Get paginated signal history with filters."""
    query = "SELECT * FROM signals WHERE 1=1"
    params = []

    if ticker:
        query += " AND ticker = ?"
        params.append(ticker.upper())
    if strategy:
        query += " AND strategy = ?"
        params.append(strategy)
    if direction:
        query += " AND direction = ?"
        params.append(direction)
    if min_score is not None:
        query += " AND score >= ?"
        params.append(min_score)
    if status:
        query += " AND status = ?"
        params.append(status)

    # Get total count
    count_query = query.replace("SELECT *", "SELECT COUNT(*)")
    
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.append(limit)
    params.append(offset)

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        cursor = await db.execute(count_query, params[:-2])
        total = (await cursor.fetchone())[0]

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()

        signals = []
        for row in rows:
            signal = dict(row)
            # Parse confidence_factors from JSON string
            try:
                signal["confidence_factors"] = json.loads(signal.get("confidence_factors", "[]"))
            except (json.JSONDecodeError, TypeError):
                signal["confidence_factors"] = []
            signals.append(signal)

    return {
        "signals": signals,
        "total": total,
        "limit": limit,
        "offset": offset,
    }
