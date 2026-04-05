"""Performance API routes."""

from fastapi import APIRouter
import json
import aiosqlite

from database import DB_PATH

router = APIRouter(prefix="/api", tags=["performance"])


@router.get("/performance")
async def get_performance():
    """Get overall trading performance metrics."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Total signals
        cursor = await db.execute("SELECT COUNT(*) as total FROM signals")
        total_row = await cursor.fetchone()
        total_signals = total_row[0]

        # Wins and losses
        cursor = await db.execute("SELECT COUNT(*) FROM signals WHERE status = 'hit_target'")
        wins = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM signals WHERE status = 'hit_stop'")
        losses = (await cursor.fetchone())[0]

        resolved = wins + losses
        win_rate = round((wins / resolved * 100), 1) if resolved > 0 else 0

        # Average return from paper trades
        cursor = await db.execute("""
            SELECT AVG(pnl) as avg_pnl, SUM(pnl) as total_pnl
            FROM paper_trades WHERE status = 'closed'
        """)
        pnl_row = await cursor.fetchone()
        avg_return = round(float(pnl_row[0] or 0), 2)
        cumulative_pnl = round(float(pnl_row[1] or 0), 2)

        # Daily P&L series
        cursor = await db.execute("""
            SELECT date, cumulative_pnl FROM performance_snapshots
            ORDER BY date ASC
        """)
        snapshots = await cursor.fetchall()
        daily_pnl = [{"date": row[0], "pnl": row[1]} for row in snapshots]

        # Strategy breakdown
        cursor = await db.execute("""
            SELECT strategy,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'hit_target' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN status = 'hit_stop' THEN 1 ELSE 0 END) as losses
            FROM signals
            WHERE status IN ('hit_target', 'hit_stop')
            GROUP BY strategy
        """)
        strategy_rows = await cursor.fetchall()
        strategy_performance = []
        for row in strategy_rows:
            strat_total = row[2] + row[3]
            strategy_performance.append({
                "strategy": row[0],
                "total_signals": row[1],
                "wins": row[2],
                "losses": row[3],
                "win_rate": round((row[2] / strat_total * 100), 1) if strat_total > 0 else 0,
            })

    return {
        "total_signals": total_signals,
        "wins": wins,
        "losses": losses,
        "win_rate": win_rate,
        "avg_return": avg_return,
        "cumulative_pnl": cumulative_pnl,
        "daily_pnl": daily_pnl,
        "strategy_performance": strategy_performance,
    }
