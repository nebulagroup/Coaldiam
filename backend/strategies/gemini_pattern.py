"""Gemini AI Pattern Strategy

Uses Gemini to analyze multi-timeframe price structure and identify setups humans miss.
Pattern confluence scoring across 15m, 1h, and daily timeframes.
"""

from typing import List, Dict, Any
import json


def format_for_gemini(
    daily_data: list,
    hourly_data: list,
    fifteen_min_data: list,
    ticker: str,
    current_price: float
) -> Dict[str, Any]:
    """
    Format multi-timeframe data for Gemini analysis.
    Returns structured data dict to be included in the Gemini prompt.
    """
    return {
        "ticker": ticker,
        "current_price": current_price,
        "daily_bars_last_20": daily_data[-20:] if len(daily_data) >= 20 else daily_data,
        "hourly_bars_last_20": hourly_data[-20:] if len(hourly_data) >= 20 else hourly_data,
        "fifteen_min_bars_last_20": fifteen_min_data[-20:] if len(fifteen_min_data) >= 20 else fifteen_min_data,
    }


def detect_gemini_pattern(
    daily_data: list,
    hourly_data: list,
    fifteen_min_data: list,
    ticker: str,
    current_price: float
) -> List[Dict[str, Any]]:
    """
    Prepare setup for Gemini AI pattern detection.
    
    This doesn't run Gemini directly — it prepares the data payload
    that will be sent to the Gemini scorer service.
    
    Returns list of setups ready for Gemini scoring.
    """
    if not daily_data or len(daily_data) < 5:
        return []

    formatted = format_for_gemini(
        daily_data, hourly_data, fifteen_min_data, ticker, current_price
    )

    # Return a setup that will be scored by Gemini
    return [{
        "ticker": ticker,
        "strategy": "gemini_pattern",
        "direction": "pending",  # Gemini will determine direction
        "entry_price": round(current_price, 2),
        "target_price": 0,  # Gemini will set
        "stop_loss": 0,  # Gemini will set
        "raw_data": formatted,
        "requires_gemini": True,
    }]


def get_gemini_pattern_prompt(setup_data: Dict[str, Any]) -> str:
    """
    Generate the specific prompt for Gemini pattern analysis.
    """
    return f"""Analyze the following multi-timeframe price data for {setup_data['ticker']} 
and identify any tradeable chart patterns or setups.

Current Price: ${setup_data['current_price']}

DAILY BARS (last 20):
{json.dumps(setup_data.get('daily_bars_last_20', []), indent=2)}

HOURLY BARS (last 20):
{json.dumps(setup_data.get('hourly_bars_last_20', []), indent=2)}

15-MINUTE BARS (last 20):
{json.dumps(setup_data.get('fifteen_min_bars_last_20', []), indent=2)}

Look for:
1. Chart patterns (head & shoulders, triangles, flags, wedges, double tops/bottoms)
2. Multi-timeframe confluence (alignment across daily, hourly, and 15-min)
3. Key support/resistance levels
4. Volume patterns confirming or diverging from price
5. Momentum indicators alignment

Return your analysis as structured JSON with these exact fields:
- direction: "bullish" or "bearish"
- score: 0-100 (only score above 80 for very high conviction)
- thesis: 2-3 sentences in plain English
- confidence_factors: list of specific reasons
- invalidation: what would invalidate this setup
- options_play: suggested options trade
- risk_reward: ratio like "1:2.5"
- target_price: numeric target
- stop_loss: numeric stop loss level
"""
