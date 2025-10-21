"""
Configuration settings for MarketPulse backend.
"""

# Cache settings
CACHE_TTL_SECONDS = 300  # 5 minutes

# API limits
MAX_TRENDING_TICKERS = 10
MAX_NEWS_ARTICLES = 10
MAX_SCAN_RESULTS = 5  # Top 5 bullish and top 5 bearish

# Technical analysis thresholds
RSI_OVERSOLD = 30
RSI_OVERBOUGHT = 70
RSI_BULLISH_MIN = 30
RSI_BULLISH_MAX = 50
RSI_BEARISH_MIN = 50
RSI_BEARISH_MAX = 70

# Stocktwits settings
STOCKTWITS_TRENDING_URL = "https://stocktwits.com/rankings/trending"
STOCKTWITS_TIMEOUT = 10  # seconds

# OpenBB settings
OPENBB_DEFAULT_PROVIDER = "yfinance"  # Fallback provider
OPENBB_TIMEOUT = 15  # seconds

# Server settings
HOST = "0.0.0.0"
PORT = 8000
RELOAD = True  # Set to False in production
