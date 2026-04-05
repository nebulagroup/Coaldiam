"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings from .env file."""

    GEMINI_API_KEY: Optional[str] = None
    ALPACA_API_KEY: Optional[str] = None
    ALPACA_SECRET_KEY: Optional[str] = None
    ALPACA_BASE_URL: str = "https://paper-api.alpaca.markets"
    USE_MOCK_DATA: bool = False
    DATABASE_URL: str = "sqlite+aiosqlite:///./signalos.db"
    DB_PATH: str = "./signalos.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
