"""
Pydantic models for API request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime


# Trending Ticker Models
class TrendingTicker(BaseModel):
    """Model for a trending ticker."""
    symbol: str = Field(..., description="Ticker symbol")
    title: Optional[str] = Field(None, description="Full name/title")
    price: float = Field(..., description="Current price")
    percent_change: float = Field(..., description="Percentage change")
    volume: str = Field(..., description="Trading volume (may be abbreviated)")
    market_cap: str = Field(..., description="Market capitalization")
    direction: str = Field(..., description="Price direction: up, down, or flat")
    watchlist_count: Optional[int] = Field(None, description="Stocktwits watchlist count")
    trending_score: Optional[float] = Field(None, description="Trending score from Stocktwits")
    hype: Optional[str] = Field(None, description="AI-generated hype summary")
    source: str = Field(default="stocktwits", description="Data source")


class TrendingResponse(BaseModel):
    """Response model for trending endpoint."""
    tickers: List[TrendingTicker]
    count: int
    last_updated: str


# Technical Indicators Models
class TechnicalIndicators(BaseModel):
    """Model for technical indicators."""
    symbol: str
    rsi: Optional[float] = Field(None, description="Relative Strength Index (14-period)")
    macd: Optional[float] = Field(None, description="MACD value")
    macd_signal: Optional[float] = Field(None, description="MACD signal line")
    macd_histogram: Optional[float] = Field(None, description="MACD histogram")
    sma_20: Optional[float] = Field(None, description="20-day Simple Moving Average")
    sma_50: Optional[float] = Field(None, description="50-day Simple Moving Average")
    price: float = Field(..., description="Current price")
    volume: int = Field(..., description="Current volume")
    last_updated: str


# News Models
class NewsArticle(BaseModel):
    """Model for a news article."""
    title: str
    source: str
    published_date: str
    url: str
    sentiment: str = Field(..., description="Sentiment: positive, negative, or neutral")


class NewsResponse(BaseModel):
    """Response model for news endpoint."""
    symbol: str
    articles: List[NewsArticle]
    count: int


# Market Summary Models
class MarketSummary(BaseModel):
    """Model for overall market summary."""
    market_sentiment: str = Field(..., description="Overall: bullish, bearish, or neutral")
    bullish_count: int = Field(..., description="Number of bullish signals")
    bearish_count: int = Field(..., description="Number of bearish signals")
    neutral_count: int = Field(..., description="Number of neutral signals")
    top_movers: List[Dict[str, Any]] = Field(..., description="Top moving tickers")
    last_updated: str


# Scan Models
class ScanSignal(BaseModel):
    """Model for individual scan signal."""
    symbol: str
    score: float = Field(..., description="Signal strength score (0-5)")
    signals: List[str] = Field(..., description="List of detected signals")
    price: float
    rsi: Optional[float]
    macd: Optional[float]
    percent_change: float


class ScanResponse(BaseModel):
    """Response model for scan endpoint."""
    bullish: List[ScanSignal] = Field(..., description="Top 5 bullish setups")
    bearish: List[ScanSignal] = Field(..., description="Top 5 bearish setups")
    total_scanned: int
    last_updated: str


# Health Check Model
class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    openbb_available: bool
    cache_stats: Dict[str, Any]
    timestamp: str


# Error Response Model
class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    detail: Optional[str] = None
    timestamp: str
