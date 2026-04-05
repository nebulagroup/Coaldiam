"""Mean Reversion Strategy

Detects oversold bounces using RSI below 30 + Bollinger Band lower touch.
Best for: Weekly options on large-cap names after 3+ red days.
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any


def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Calculate Relative Strength Index."""
    delta = series.diff()
    gain = delta.where(delta > 0, 0.0).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0.0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))


def calculate_bollinger_bands(series: pd.Series, period: int = 20, std_dev: float = 2.0):
    """Calculate Bollinger Bands (middle, upper, lower)."""
    middle = series.rolling(window=period).mean()
    std = series.rolling(window=period).std()
    upper = middle + (std_dev * std)
    lower = middle - (std_dev * std)
    return middle, upper, lower


def count_consecutive_red_days(df: pd.DataFrame) -> int:
    """Count consecutive red (down) days ending at the latest bar."""
    count = 0
    for i in range(len(df) - 1, -1, -1):
        if df.iloc[i]["Close"] < df.iloc[i]["Open"]:
            count += 1
        else:
            break
    return count


def detect_mean_reversion(df: pd.DataFrame, ticker: str) -> List[Dict[str, Any]]:
    """
    Detect mean reversion setups.
    
    Bullish criteria:
    - RSI below 30 (oversold)
    - Price touches or pierces lower Bollinger Band
    
    Bearish criteria:
    - RSI above 70 (overbought) 
    - Price touches or pierces upper Bollinger Band
    
    Returns list of detected setup dictionaries.
    """
    if len(df) < 20:
        return []

    setups = []
    df = df.copy()

    # Calculate indicators
    df["RSI"] = calculate_rsi(df["Close"])
    df["BB_Mid"], df["BB_Upper"], df["BB_Lower"] = calculate_bollinger_bands(df["Close"])

    latest = df.iloc[-1]

    if pd.isna(latest["RSI"]) or pd.isna(latest["BB_Lower"]):
        return []

    rsi = float(latest["RSI"])
    red_days = count_consecutive_red_days(df)

    # Bullish: RSI < 30 + lower BB touch
    if rsi < 30 and latest["Low"] <= latest["BB_Lower"]:
        setups.append({
            "ticker": ticker,
            "strategy": "mean_reversion",
            "direction": "bullish",
            "entry_price": round(float(latest["Close"]), 2),
            "target_price": round(float(latest["BB_Mid"]), 2),
            "stop_loss": round(float(latest["BB_Lower"] - (latest["BB_Mid"] - latest["BB_Lower"]) * 0.3), 2),
            "raw_data": {
                "rsi": round(rsi, 1),
                "bb_lower": round(float(latest["BB_Lower"]), 2),
                "bb_mid": round(float(latest["BB_Mid"]), 2),
                "bb_upper": round(float(latest["BB_Upper"]), 2),
                "consecutive_red_days": red_days,
            }
        })

    # Bearish: RSI > 70 + upper BB touch
    if rsi > 70 and latest["High"] >= latest["BB_Upper"]:
        green_days = 0
        for i in range(len(df) - 1, -1, -1):
            if df.iloc[i]["Close"] > df.iloc[i]["Open"]:
                green_days += 1
            else:
                break

        setups.append({
            "ticker": ticker,
            "strategy": "mean_reversion",
            "direction": "bearish",
            "entry_price": round(float(latest["Close"]), 2),
            "target_price": round(float(latest["BB_Mid"]), 2),
            "stop_loss": round(float(latest["BB_Upper"] + (latest["BB_Upper"] - latest["BB_Mid"]) * 0.3), 2),
            "raw_data": {
                "rsi": round(rsi, 1),
                "bb_lower": round(float(latest["BB_Lower"]), 2),
                "bb_mid": round(float(latest["BB_Mid"]), 2),
                "bb_upper": round(float(latest["BB_Upper"]), 2),
                "consecutive_green_days": green_days,
            }
        })

    return setups
