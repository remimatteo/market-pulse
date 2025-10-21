"""
OpenBB Platform client for fetching market data, indicators, and news.
Handles technical analysis, quotes, and news for stocks and crypto.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import config
from services.cache_manager import cache

try:
    from openbb import obb
    import pandas_ta as ta
    OPENBB_AVAILABLE = True
except ImportError:
    OPENBB_AVAILABLE = False
    print("Warning: OpenBB not installed. Install with: pip install openbb")


class OpenBBClient:
    """Client for interacting with OpenBB Platform API."""

    def __init__(self):
        self.available = OPENBB_AVAILABLE

    def get_quote(self, symbol: str, force_refresh: bool = False) -> Optional[Dict[str, Any]]:
        """
        Get current quote data for a symbol.

        Args:
            symbol: Stock or crypto ticker symbol
            force_refresh: If True, bypass cache

        Returns:
            Dictionary with quote data (price, volume, etc.)
        """
        if not self.available:
            return None

        cache_key = f"quote_{symbol}"

        if not force_refresh:
            cached = cache.get(cache_key)
            if cached:
                return cached

        try:
            # Fetch quote data
            result = obb.equity.price.quote(symbol=symbol, provider="yfinance")

            if result and hasattr(result, 'results') and result.results:
                data = result.results[0]
                quote_data = {
                    'symbol': symbol,
                    'price': getattr(data, 'last_price', None) or getattr(data, 'price', 0),
                    'volume': getattr(data, 'volume', 0),
                    'change': getattr(data, 'change', 0),
                    'change_percent': getattr(data, 'change_percent', 0),
                    'last_updated': datetime.now().isoformat()
                }

                cache.set(cache_key, quote_data)
                return quote_data

        except Exception as e:
            print(f"Error fetching quote for {symbol}: {e}")

        return None

    def get_technical_indicators(self, symbol: str, force_refresh: bool = False) -> Optional[Dict[str, Any]]:
        """
        Get technical indicators (RSI, MACD, SMAs) for a symbol.

        Args:
            symbol: Stock or crypto ticker symbol
            force_refresh: If True, bypass cache

        Returns:
            Dictionary with RSI, MACD, SMA_20, SMA_50, volume
        """
        if not self.available:
            return None

        cache_key = f"indicators_{symbol}"

        if not force_refresh:
            cached = cache.get(cache_key)
            if cached:
                return cached

        try:
            # Fetch historical data for calculations
            end_date = datetime.now()
            start_date = end_date - timedelta(days=100)  # Need enough data for 50-day SMA

            historical = obb.equity.price.historical(
                symbol=symbol,
                start_date=start_date.strftime('%Y-%m-%d'),
                end_date=end_date.strftime('%Y-%m-%d'),
                provider="yfinance"
            )

            if not historical or not hasattr(historical, 'results'):
                return None

            # Convert to DataFrame for technical analysis
            df = historical.to_dataframe()

            if df.empty:
                return None

            # Calculate RSI using pandas_ta
            df.ta.rsi(length=14, append=True)
            rsi_value = float(df['RSI_14'].iloc[-1]) if 'RSI_14' in df.columns else None

            # Calculate MACD using pandas_ta
            df.ta.macd(fast=12, slow=26, signal=9, append=True)
            macd_value = float(df['MACD_12_26_9'].iloc[-1]) if 'MACD_12_26_9' in df.columns else None
            macd_signal = float(df['MACDs_12_26_9'].iloc[-1]) if 'MACDs_12_26_9' in df.columns else None
            macd_histogram = float(df['MACDh_12_26_9'].iloc[-1]) if 'MACDh_12_26_9' in df.columns else None

            # Calculate SMAs using pandas_ta
            df.ta.sma(length=20, append=True)
            df.ta.sma(length=50, append=True)

            sma_20_value = float(df['SMA_20'].iloc[-1]) if 'SMA_20' in df.columns else None
            sma_50_value = float(df['SMA_50'].iloc[-1]) if 'SMA_50' in df.columns else None

            # Get latest price and volume
            latest_price = float(df['close'].iloc[-1])
            latest_volume = int(df['volume'].iloc[-1])

            indicators = {
                'symbol': symbol,
                'rsi': rsi_value,
                'macd': macd_value,
                'macd_signal': macd_signal,
                'macd_histogram': macd_histogram,
                'sma_20': sma_20_value,
                'sma_50': sma_50_value,
                'price': latest_price,
                'volume': latest_volume,
                'last_updated': datetime.now().isoformat()
            }

            cache.set(cache_key, indicators)
            return indicators

        except Exception as e:
            print(f"Error calculating indicators for {symbol}: {e}")
            return None

    def get_news(self, symbol: str, limit: int = 10, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Get recent news for a symbol.

        Args:
            symbol: Stock or crypto ticker symbol
            limit: Maximum number of articles to return
            force_refresh: If True, bypass cache

        Returns:
            List of news articles with title, source, date, url
        """
        if not self.available:
            return []

        cache_key = f"news_{symbol}"

        if not force_refresh:
            cached = cache.get(cache_key)
            if cached:
                return cached

        try:
            # Fetch company news
            result = obb.news.company(symbol=symbol, limit=limit, provider="yfinance")

            if not result or not hasattr(result, 'results'):
                return []

            news_items = []
            for article in result.results:
                news_items.append({
                    'title': getattr(article, 'title', 'No title'),
                    'source': getattr(article, 'source', 'Unknown'),
                    'published_date': str(getattr(article, 'date', datetime.now())),
                    'url': getattr(article, 'url', ''),
                    'sentiment': self._analyze_sentiment(getattr(article, 'title', ''))
                })

            cache.set(cache_key, news_items)
            return news_items

        except Exception as e:
            print(f"Error fetching news for {symbol}: {e}")
            return []

    @staticmethod
    def _analyze_sentiment(text: str) -> str:
        """
        Simple rule-based sentiment analysis.

        Args:
            text: Text to analyze (headline)

        Returns:
            'positive', 'negative', or 'neutral'
        """
        text_lower = text.lower()

        # Positive keywords
        positive_words = ['gain', 'up', 'surge', 'rally', 'buy', 'bullish', 'growth', 'profit', 'beat', 'success']
        # Negative keywords
        negative_words = ['loss', 'down', 'fall', 'drop', 'sell', 'bearish', 'decline', 'miss', 'fail', 'cut']

        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)

        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'

    def is_available(self) -> bool:
        """Check if OpenBB is available."""
        return self.available


# Global client instance
openbb_client = OpenBBClient()
