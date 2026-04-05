"""Pydantic models for request/response schemas."""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime


class Direction(str, Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"


class StrategyType(str, Enum):
    MOMENTUM = "momentum_breakout"
    MEAN_REVERSION = "mean_reversion"
    OPTIONS_FLOW = "options_flow"
    GEMINI_PATTERN = "gemini_pattern"


class SignalStatus(str, Enum):
    ACTIVE = "active"
    HIT_TARGET = "hit_target"
    HIT_STOP = "hit_stop"
    EXPIRED = "expired"


class TradeStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


# ----- Request Models -----

class GenerateSignalsRequest(BaseModel):
    tickers: List[str] = Field(default=["SPY", "QQQ", "AAPL", "TSLA", "NVDA", "AMZN"])
    timeframe: str = Field(default="1d")


class SignalFilterParams(BaseModel):
    ticker: Optional[str] = None
    strategy: Optional[StrategyType] = None
    direction: Optional[Direction] = None
    min_score: Optional[int] = None
    limit: int = 50
    offset: int = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# ----- Response Models -----

class SignalResponse(BaseModel):
    id: int
    ticker: str
    strategy: str
    direction: str
    score: int
    entry_price: float
    target_price: float
    stop_loss: float
    options_play: str
    thesis: str
    confidence_factors: List[str]
    invalidation: str
    risk_reward: str
    status: str
    created_at: str
    resolved_at: Optional[str] = None


class PriceData(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: Optional[int] = None


class PerformanceResponse(BaseModel):
    total_signals: int
    wins: int
    losses: int
    win_rate: float
    avg_return: float
    cumulative_pnl: float
    daily_pnl: List[dict]


class TradeResponse(BaseModel):
    id: int
    signal_id: int
    ticker: str
    direction: str
    entry_price: float
    exit_price: Optional[float] = None
    quantity: int
    pnl: Optional[float] = None
    status: str
    opened_at: str
    closed_at: Optional[str] = None


class ChartDataPoint(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: Optional[int] = None


class GeminiScoreResponse(BaseModel):
    score: int
    thesis: str
    confidence_factors: List[str]
    invalidation: str
    options_play: str
    risk_reward: str


class StrategyPerformance(BaseModel):
    strategy: str
    total_signals: int
    wins: int
    losses: int
    win_rate: float
