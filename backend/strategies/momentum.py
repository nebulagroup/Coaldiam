"""Momentum Breakout Strategy

Detects when price reclaims VWAP + EMA-9 cross with 2x+ average volume.
Best for: SPY/QQQ 0DTE or 1DTE calls in the first 90 minutes of market open.
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any


def calculate_vwap(df: pd.DataFrame) -> pd.Series:
    """Calculate Volume Weighted Average Price."""
    typical_price = (df["High"] + df["Low"] + df["Close"]) / 3
    cumulative_tp_volume = (typical_price * df["Volume"]).cumsum()
    cumulative_volume = df["Volume"].cumsum()
    return cumulative_tp_volume / cumulative_volume


def calculate_ema(series: pd.Series, period: int = 9) -> pd.Series:
    """Calculate Exponential Moving Average."""
    return series.ewm(span=period, adjust=False).mean()


def detect_momentum_breakout(df: pd.DataFrame, ticker: str) -> List[Dict[str, Any]]:
    """
    Detect momentum breakout setups.
    
    Criteria:
    - Price reclaims VWAP (close > VWAP)
    - EMA-9 crossover (EMA-9 crosses above EMA-21)  
    - Volume is 2x+ the 20-day average
    
    Returns list of detected setup dictionaries.
    """
    if len(df) < 21:
        return []

    setups = []

    # Calculate indicators
    df = df.copy()
    df["VWAP"] = calculate_vwap(df)
    df["EMA_9"] = calculate_ema(df["Close"], 9)
    df["EMA_21"] = calculate_ema(df["Close"], 21)
    df["Avg_Volume_20"] = df["Volume"].rolling(window=20).mean()

    # Check latest bar
    latest = df.iloc[-1]
    prev = df.iloc[-2] if len(df) > 1 else None

    if prev is None:
        return []

    # Conditions
    price_above_vwap = latest["Close"] > latest["VWAP"]
    ema_crossover = (latest["EMA_9"] > latest["EMA_21"]) and (prev["EMA_9"] <= prev["EMA_21"])
    ema_bullish = latest["EMA_9"] > latest["EMA_21"]
    volume_surge = latest["Volume"] > (2 * latest["Avg_Volume_20"]) if pd.notna(latest["Avg_Volume_20"]) else False

    # Bearish: Price below VWAP + EMA death cross + volume surge
    price_below_vwap = latest["Close"] < latest["VWAP"]
    ema_death_cross = (latest["EMA_9"] < latest["EMA_21"]) and (prev["EMA_9"] >= prev["EMA_21"])
    ema_bearish = latest["EMA_9"] < latest["EMA_21"]

    if price_above_vwap and (ema_crossover or ema_bullish) and volume_surge:
        volume_ratio = round(latest["Volume"] / latest["Avg_Volume_20"], 1) if pd.notna(latest["Avg_Volume_20"]) else 2.0
        setups.append({
            "ticker": ticker,
            "strategy": "momentum_breakout",
            "direction": "bullish",
            "entry_price": round(float(latest["Close"]), 2),
            "target_price": round(float(latest["Close"] * 1.015), 2),
            "stop_loss": round(float(latest["VWAP"] - (latest["Close"] - latest["VWAP"]) * 0.5), 2),
            "raw_data": {
                "vwap": round(float(latest["VWAP"]), 2),
                "ema_9": round(float(latest["EMA_9"]), 2),
                "ema_21": round(float(latest["EMA_21"]), 2),
                "volume": int(latest["Volume"]),
                "avg_volume": int(latest["Avg_Volume_20"]) if pd.notna(latest["Avg_Volume_20"]) else 0,
                "volume_ratio": volume_ratio,
            }
        })

    if price_below_vwap and (ema_death_cross or ema_bearish) and volume_surge:
        volume_ratio = round(latest["Volume"] / latest["Avg_Volume_20"], 1) if pd.notna(latest["Avg_Volume_20"]) else 2.0
        setups.append({
            "ticker": ticker,
            "strategy": "momentum_breakout",
            "direction": "bearish",
            "entry_price": round(float(latest["Close"]), 2),
            "target_price": round(float(latest["Close"] * 0.985), 2),
            "stop_loss": round(float(latest["VWAP"] + (latest["VWAP"] - latest["Close"]) * 0.5), 2),
            "raw_data": {
                "vwap": round(float(latest["VWAP"]), 2),
                "ema_9": round(float(latest["EMA_9"]), 2),
                "ema_21": round(float(latest["EMA_21"]), 2),
                "volume": int(latest["Volume"]),
                "avg_volume": int(latest["Avg_Volume_20"]) if pd.notna(latest["Avg_Volume_20"]) else 0,
                "volume_ratio": volume_ratio,
            }
        })

    return setups
