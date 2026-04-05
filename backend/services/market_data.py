"""Market data service using yfinance."""

import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
import random
from config import settings


def get_mock_prices() -> Dict[str, Dict[str, Any]]:
    """Return mock price data for development."""
    base_prices = {
        "SPY": 527.50,
        "QQQ": 448.75,
        "AAPL": 188.40,
        "TSLA": 171.20,
        "NVDA": 875.30,
        "AMZN": 186.50,
    }
    result = {}
    for symbol, base in base_prices.items():
        change = round(random.uniform(-3.0, 3.0), 2)
        price = round(base + change, 2)
        change_pct = round((change / base) * 100, 2)
        result[symbol] = {
            "symbol": symbol,
            "price": price,
            "change": change,
            "change_percent": change_pct,
            "volume": random.randint(10_000_000, 80_000_000),
        }
    return result


def get_mock_chart_data(ticker: str, period: str = "6mo") -> List[Dict]:
    """Generate realistic mock OHLCV data for charting."""
    import math
    from datetime import datetime, timedelta

    base_prices = {
        "SPY": 500.0, "QQQ": 430.0, "AAPL": 180.0,
        "TSLA": 160.0, "NVDA": 800.0, "AMZN": 175.0,
    }
    base = base_prices.get(ticker, 200.0)
    days = 130
    data = []
    price = base

    start_date = datetime.utcnow() - timedelta(days=days)
    for i in range(days):
        date = start_date + timedelta(days=i)
        if date.weekday() >= 5:
            continue

        trend = math.sin(i * 0.05) * 2
        noise = random.gauss(0, base * 0.008)
        price = price + trend + noise
        price = max(price, base * 0.85)

        open_price = price + random.gauss(0, base * 0.003)
        high = max(price, open_price) + abs(random.gauss(0, base * 0.005))
        low = min(price, open_price) - abs(random.gauss(0, base * 0.005))
        close = price
        volume = random.randint(15_000_000, 60_000_000)

        data.append({
            "time": date.strftime("%Y-%m-%d"),
            "open": round(open_price, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close, 2),
            "volume": volume,
        })

    return data


async def fetch_live_prices(tickers: List[str]) -> Dict[str, Dict[str, Any]]:
    """Fetch current prices for multiple tickers."""
    if settings.USE_MOCK_DATA:
        return get_mock_prices()

    result = {}
    for symbol in tickers:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.fast_info
            price = float(info.get("lastPrice", info.get("last_price", 0)))
            prev_close = float(info.get("previousClose", info.get("previous_close", price)))
            change = round(price - prev_close, 2)
            change_pct = round((change / prev_close) * 100, 2) if prev_close else 0

            result[symbol] = {
                "symbol": symbol,
                "price": round(price, 2),
                "change": change,
                "change_percent": change_pct,
                "volume": int(info.get("lastVolume", info.get("last_volume", 0))),
            }
        except Exception as e:
            print(f"Error fetching price for {symbol}: {e}")
            result[symbol] = {
                "symbol": symbol, "price": 0, "change": 0,
                "change_percent": 0, "volume": 0,
            }
    return result


async def fetch_ohlcv(ticker: str, period: str = "3mo", interval: str = "1d") -> pd.DataFrame:
    """Fetch OHLCV data from yfinance."""
    if settings.USE_MOCK_DATA:
        data = get_mock_chart_data(ticker, period)
        df = pd.DataFrame(data)
        df.index = pd.to_datetime(df["time"])
        df = df.rename(columns={
            "open": "Open", "high": "High", "low": "Low",
            "close": "Close", "volume": "Volume"
        })
        return df[["Open", "High", "Low", "Close", "Volume"]]

    try:
        t = yf.Ticker(ticker)
        df = t.history(period=period, interval=interval)
        return df[["Open", "High", "Low", "Close", "Volume"]]
    except Exception as e:
        print(f"Error fetching OHLCV for {ticker}: {e}")
        return pd.DataFrame()


async def fetch_chart_data(ticker: str, period: str = "6mo") -> List[Dict]:
    """Fetch chart data formatted for TradingView Lightweight Charts."""
    if settings.USE_MOCK_DATA:
        return get_mock_chart_data(ticker, period)

    try:
        t = yf.Ticker(ticker)
        df = t.history(period=period, interval="1d")
        data = []
        for idx, row in df.iterrows():
            data.append({
                "time": idx.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })
        return data
    except Exception as e:
        print(f"Error fetching chart data for {ticker}: {e}")
        return []


async def fetch_options_chain(ticker: str):
    """Fetch options chain data from yfinance."""
    if settings.USE_MOCK_DATA:
        return None, None

    try:
        t = yf.Ticker(ticker)
        expirations = t.options
        if not expirations:
            return None, None
        opt = t.option_chain(expirations[0])
        return opt.calls, opt.puts
    except Exception as e:
        print(f"Error fetching options for {ticker}: {e}")
        return None, None
