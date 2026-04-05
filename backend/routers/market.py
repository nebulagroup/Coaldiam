"""Market data API routes."""

from fastapi import APIRouter, Path
from services.market_data import fetch_live_prices, fetch_chart_data

router = APIRouter(prefix="/api", tags=["market"])

TRACKED_TICKERS = ["SPY", "QQQ", "AAPL", "TSLA", "NVDA", "AMZN"]


@router.get("/prices")
async def get_prices():
    """Get current prices for tracked tickers."""
    prices = await fetch_live_prices(TRACKED_TICKERS)
    return {"prices": list(prices.values())}


@router.get("/chart-data/{ticker}")
async def get_chart_data(ticker: str = Path(..., description="Stock ticker symbol")):
    """Get OHLCV chart data for TradingView Lightweight Charts."""
    data = await fetch_chart_data(ticker.upper())
    return {"ticker": ticker.upper(), "data": data}
