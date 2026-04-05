"""Options Flow Anomaly Strategy

Detects unusual call/put volume vs 30-day average using yfinance options chains.
Best for: Following institutional direction, especially pre-catalyst.
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional


def detect_options_flow(
    calls: Optional[pd.DataFrame],
    puts: Optional[pd.DataFrame],
    ticker: str,
    current_price: float
) -> List[Dict[str, Any]]:
    """
    Detect options flow anomalies.
    
    Criteria:
    - Current call or put volume exceeds 2x the average open interest (proxy for normal activity)
    - Focus on near-the-money strikes (within 5% of current price)
    
    Returns list of detected setup dictionaries.
    """
    setups = []

    if calls is None or puts is None or calls.empty or puts.empty:
        return []

    try:
        # Filter near-the-money options (within 5% of current price)
        lower_bound = current_price * 0.95
        upper_bound = current_price * 1.05

        ntm_calls = calls[
            (calls["strike"] >= lower_bound) & (calls["strike"] <= upper_bound)
        ].copy()

        ntm_puts = puts[
            (puts["strike"] >= lower_bound) & (puts["strike"] <= upper_bound)
        ].copy()

        # Check for unusual CALL activity
        if not ntm_calls.empty and "volume" in ntm_calls.columns and "openInterest" in ntm_calls.columns:
            ntm_calls["volume"] = pd.to_numeric(ntm_calls["volume"], errors="coerce").fillna(0)
            ntm_calls["openInterest"] = pd.to_numeric(ntm_calls["openInterest"], errors="coerce").fillna(1)

            total_call_volume = ntm_calls["volume"].sum()
            avg_call_oi = ntm_calls["openInterest"].mean()

            if avg_call_oi > 0 and total_call_volume > (2 * avg_call_oi):
                volume_ratio = round(total_call_volume / avg_call_oi, 1)
                highest_volume_strike = ntm_calls.loc[ntm_calls["volume"].idxmax()]

                setups.append({
                    "ticker": ticker,
                    "strategy": "options_flow",
                    "direction": "bullish",
                    "entry_price": round(current_price, 2),
                    "target_price": round(current_price * 1.02, 2),
                    "stop_loss": round(current_price * 0.985, 2),
                    "raw_data": {
                        "total_call_volume": int(total_call_volume),
                        "avg_open_interest": round(float(avg_call_oi), 0),
                        "volume_ratio": volume_ratio,
                        "highest_volume_strike": float(highest_volume_strike["strike"]),
                        "highest_volume": int(highest_volume_strike["volume"]),
                    }
                })

        # Check for unusual PUT activity
        if not ntm_puts.empty and "volume" in ntm_puts.columns and "openInterest" in ntm_puts.columns:
            ntm_puts["volume"] = pd.to_numeric(ntm_puts["volume"], errors="coerce").fillna(0)
            ntm_puts["openInterest"] = pd.to_numeric(ntm_puts["openInterest"], errors="coerce").fillna(1)

            total_put_volume = ntm_puts["volume"].sum()
            avg_put_oi = ntm_puts["openInterest"].mean()

            if avg_put_oi > 0 and total_put_volume > (2 * avg_put_oi):
                volume_ratio = round(total_put_volume / avg_put_oi, 1)
                highest_volume_strike = ntm_puts.loc[ntm_puts["volume"].idxmax()]

                setups.append({
                    "ticker": ticker,
                    "strategy": "options_flow",
                    "direction": "bearish",
                    "entry_price": round(current_price, 2),
                    "target_price": round(current_price * 0.98, 2),
                    "stop_loss": round(current_price * 1.015, 2),
                    "raw_data": {
                        "total_put_volume": int(total_put_volume),
                        "avg_open_interest": round(float(avg_put_oi), 0),
                        "volume_ratio": volume_ratio,
                        "highest_volume_strike": float(highest_volume_strike["strike"]),
                        "highest_volume": int(highest_volume_strike["volume"]),
                    }
                })
    except Exception as e:
        print(f"Error detecting options flow for {ticker}: {e}")

    return setups
