"""Gemini Signal Scorer Service

Scores trading setups using Google Gemini 1.5 Flash.
Returns structured JSON with score, thesis, confidence factors, etc.
"""

import json
import random
from typing import Dict, Any, Optional
from config import settings

# Only import if we have a real API key
genai = None
if settings.GEMINI_API_KEY and not settings.USE_MOCK_DATA:
    try:
        import google.generativeai as _genai
        _genai.configure(api_key=settings.GEMINI_API_KEY)
        genai = _genai
    except ImportError:
        print("⚠️  google-generativeai not installed. Using mock mode.")


SYSTEM_PROMPT = """You are a professional trading signal analyst. Analyze the provided 
market setup and return ONLY valid JSON with these exact fields:
- score (integer 0-100): Overall signal quality. Score above 80 only for very high conviction setups. Be conservative.
- thesis (string): 2-3 sentences plain English explanation of why this trade makes sense.
- confidence_factors (list of strings): 3-5 specific technical or fundamental reasons supporting this signal.
- invalidation (string): What would invalidate this setup.
- options_play (string): Suggested options trade (e.g., "SPY 530C 0DTE @ $2.15").
- risk_reward (string): Risk/reward ratio (e.g., "1:2.5").

Be specific, data-driven, and conservative in your scoring."""


MOCK_RESPONSES = {
    "momentum_breakout": {
        "bullish": {
            "score": 84,
            "thesis": "Strong VWAP reclaim with 2.3x average volume signals institutional buying pressure. EMA-9 crossing above EMA-21 confirms short-term momentum shift with broad market support.",
            "confidence_factors": [
                "VWAP reclaimed with above-average volume",
                "EMA-9/21 bullish crossover confirmed",
                "Volume 2.3x the 20-day average",
                "Positive market breadth",
            ],
            "invalidation": "Break below VWAP level with increasing sell volume",
            "options_play": "0DTE call ATM @ ~$2.00",
            "risk_reward": "1:2.1",
        },
        "bearish": {
            "score": 76,
            "thesis": "VWAP breakdown with increasing sell volume and EMA death cross. Overhead supply zone likely to cap any bounce attempt in the near term.",
            "confidence_factors": [
                "VWAP breakdown with volume",
                "EMA-9/21 bearish cross",
                "Increasing sell-side pressure",
                "Weak sector breadth",
            ],
            "invalidation": "Reclaim of VWAP with volume expansion",
            "options_play": "0DTE put ATM @ ~$1.80",
            "risk_reward": "1:1.9",
        },
    },
    "mean_reversion": {
        "bullish": {
            "score": 79,
            "thesis": "RSI hit extreme oversold territory with Bollinger Band lower touch after multiple red days. Historical probability of mean reversion bounce at this RSI level is above 70% within 2 sessions.",
            "confidence_factors": [
                "RSI in oversold territory below 30",
                "Lower Bollinger Band touch/pierce",
                "Multiple consecutive red days",
                "Volume exhaustion pattern visible",
            ],
            "invalidation": "Continued selling below the lower Bollinger Band with expanding volume",
            "options_play": "Weekly call slightly OTM @ ~$2.50",
            "risk_reward": "1:2.3",
        },
        "bearish": {
            "score": 72,
            "thesis": "RSI overbought above 70 with upper Bollinger Band rejection. Extended run-up creates rubber band snap-back conditions.",
            "confidence_factors": [
                "RSI overbought above 70",
                "Upper Bollinger Band rejection",
                "Extended consecutive green days",
                "Volume divergence on the move up",
            ],
            "invalidation": "Strong breakout above upper Bollinger Band with massive volume",
            "options_play": "Weekly put slightly OTM @ ~$2.20",
            "risk_reward": "1:2.0",
        },
    },
    "options_flow": {
        "bullish": {
            "score": 81,
            "thesis": "Unusual call volume detected — significantly above the 30-day average open interest. Large block orders on the ask suggest institutional accumulation, likely pre-catalyst positioning.",
            "confidence_factors": [
                "Call volume 3x+ average open interest",
                "Block orders on the ask side",
                "Institutional sizing detected",
                "Favorable put/call ratio shift",
            ],
            "invalidation": "Call volume was hedging against a short futures position",
            "options_play": "1DTE call ATM @ ~$3.00",
            "risk_reward": "1:1.9",
        },
        "bearish": {
            "score": 74,
            "thesis": "Unusual put volume surge ahead of a potential catalyst. Smart money appears to be positioning for downside with aggressive put buying above average levels.",
            "confidence_factors": [
                "Put volume surge above normal",
                "Pre-catalyst timing",
                "Weak technical setup",
                "Sector showing relative weakness",
            ],
            "invalidation": "Put volume was protective hedge against long equity",
            "options_play": "1DTE put ATM @ ~$2.50",
            "risk_reward": "1:2.1",
        },
    },
    "gemini_pattern": {
        "bullish": {
            "score": 88,
            "thesis": "Multi-timeframe confluence detected: daily ascending triangle breakout aligns with 1-hour EMA ribbon turning bullish and 15-minute volume breakout pattern. AI confidence elevated due to sector momentum and earnings catalyst proximity.",
            "confidence_factors": [
                "Daily ascending triangle pattern",
                "1H EMA ribbon bullish alignment",
                "15M volume breakout confirmed",
                "Cross-timeframe confluence score 92%",
                "Sector momentum tailwind",
            ],
            "invalidation": "Rejection at key resistance level with volume expansion",
            "options_play": "Weekly call slightly OTM @ ~$5.00",
            "risk_reward": "1:2.5",
        },
        "bearish": {
            "score": 82,
            "thesis": "Head and shoulders pattern confirmed across daily timeframe with bearish divergence on hourly RSI. 15-minute breakdown below neckline support with volume confirmation suggests continuation lower.",
            "confidence_factors": [
                "Daily head & shoulders confirmed",
                "Hourly RSI bearish divergence",
                "15M neckline breakdown with volume",
                "Cross-timeframe confluence score 87%",
                "Sector rotation out of growth",
            ],
            "invalidation": "Reclaim of neckline support with strong buying volume",
            "options_play": "Weekly put slightly OTM @ ~$4.00",
            "risk_reward": "1:2.3",
        },
    },
}


def get_mock_score(strategy: str, direction: str, ticker: str, entry_price: float = 0) -> Dict[str, Any]:
    """Return a realistic mock Gemini response."""
    base = MOCK_RESPONSES.get(strategy, MOCK_RESPONSES["momentum_breakout"])
    dir_key = direction if direction in base else "bullish"
    response = base[dir_key].copy()

    # Add some randomization
    response["score"] = max(50, min(95, response["score"] + random.randint(-8, 8)))
    response["options_play"] = f"{ticker} {response['options_play']}"

    # Generate target/stop prices if entry_price is provided
    if entry_price > 0:
        mult = random.uniform(0.02, 0.05)
        if dir_key == "bullish":
            response["target_price"] = round(entry_price * (1 + mult * 2), 2)
            response["stop_loss"] = round(entry_price * (1 - mult), 2)
        else:
            response["target_price"] = round(entry_price * (1 - mult * 2), 2)
            response["stop_loss"] = round(entry_price * (1 + mult), 2)

    return response


async def score_signal_with_gemini(setup_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Score a trading setup using Gemini 1.5 Flash.
    
    Args:
        setup_data: Dict containing ticker, strategy, direction, raw_data, entry_price, etc.
    
    Returns:
        Dict with score, thesis, confidence_factors, invalidation, options_play, risk_reward
    """
    strategy = setup_data.get("strategy", "momentum_breakout")
    direction = setup_data.get("direction", "bullish")
    ticker = setup_data.get("ticker", "SPY")

    # Mock mode
    if settings.USE_MOCK_DATA or genai is None:
        return get_mock_score(strategy, direction, ticker, setup_data.get("entry_price", 0))

    # Real Gemini call
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""Analyze this trading setup:

Ticker: {ticker}
Strategy: {strategy}
Direction: {direction}
Entry Price: ${setup_data.get('entry_price', 0)}
Target Price: ${setup_data.get('target_price', 0)}
Stop Loss: ${setup_data.get('stop_loss', 0)}

Technical Data:
{json.dumps(setup_data.get('raw_data', {}), indent=2)}
"""

        response = model.generate_content(
            [SYSTEM_PROMPT, prompt],
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.3,
            ),
        )

        result = json.loads(response.text)

        # Validate required fields
        required = ["score", "thesis", "confidence_factors", "invalidation", "options_play", "risk_reward"]
        for field in required:
            if field not in result:
                raise ValueError(f"Missing field: {field}")

        result["score"] = max(0, min(100, int(result["score"])))
        return result

    except Exception as e:
        print(f"Gemini scoring error: {e}. Falling back to mock.")
        return get_mock_score(strategy, direction, ticker, setup_data.get("entry_price", 0))
