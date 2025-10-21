"""
Stocktwits client for fetching trending tickers.
Uses Stocktwits API to fetch trending stocks and crypto.
"""

import requests
from typing import List, Dict, Optional
import config
from services.cache_manager import cache

try:
    from curl_cffi import requests as curl_requests
    USE_CURL_CFFI = True
except ImportError:
    USE_CURL_CFFI = False


class StocktwitsClient:
    """Client for fetching trending data from Stocktwits API."""

    def __init__(self):
        self.api_url = "https://api.stocktwits.com/api/2/trending/symbols.json"
        self.timeout = config.STOCKTWITS_TIMEOUT

    def get_trending_tickers(self, force_refresh: bool = False) -> List[Dict[str, any]]:
        """
        Fetch top trending tickers from Stocktwits API (stocks + crypto).

        Args:
            force_refresh: If True, bypass cache and fetch fresh data

        Returns:
            List of dictionaries containing trending ticker data
        """
        cache_key = "stocktwits_trending"

        # Check cache first
        if not force_refresh:
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return cached_data

        try:
            # Fetch trending symbols from API using curl_cffi to bypass Cloudflare
            if USE_CURL_CFFI:
                response = curl_requests.get(
                    self.api_url,
                    impersonate="chrome110",
                    timeout=self.timeout
                )
            else:
                # Fallback to regular requests
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
                response = requests.get(self.api_url, headers=headers, timeout=self.timeout)

            response.raise_for_status()

            # Parse JSON response
            data = response.json()
            trending_data = self._parse_api_response(data)

            # Cache the results
            cache.set(cache_key, trending_data)

            return trending_data

        except requests.RequestException as e:
            print(f"Error fetching Stocktwits trending data: {e}")
            # Return cached data if available, even if expired
            cached_data = cache.get(cache_key)
            return cached_data if cached_data else []

        except Exception as e:
            print(f"Error parsing Stocktwits data: {e}")
            return []

    def _parse_api_response(self, data: Dict) -> List[Dict[str, any]]:
        """
        Parse the Stocktwits API JSON response.

        Args:
            data: JSON response from Stocktwits API

        Returns:
            List of trending tickers with their data
        """
        trending_tickers = []

        try:
            symbols = data.get('symbols', [])

            # Sort by trending_score (descending) and take top N
            sorted_symbols = sorted(
                symbols,
                key=lambda x: x.get('trending_score', 0),
                reverse=True
            )[:config.MAX_TRENDING_TICKERS]

            for symbol_data in sorted_symbols:
                try:
                    ticker_info = self._extract_api_ticker_data(symbol_data)
                    if ticker_info:
                        trending_tickers.append(ticker_info)
                except Exception as e:
                    print(f"Error parsing symbol data: {e}")
                    continue

        except Exception as e:
            print(f"Error parsing API response: {e}")

        return trending_tickers

    def _extract_api_ticker_data(self, symbol_data: Dict) -> Optional[Dict[str, any]]:
        """
        Extract ticker data from API symbol object.

        Args:
            symbol_data: Symbol object from Stocktwits API

        Returns:
            Dictionary with ticker data or None if parsing fails
        """
        try:
            # Extract basic info
            symbol = symbol_data.get('symbol', '')
            title = symbol_data.get('title', '')
            watchlist_count = symbol_data.get('watchlist_count', 0)
            trending_score = symbol_data.get('trending_score', 0)

            # Extract trends/hype summary
            trends = symbol_data.get('trends', {})
            hype_summary = trends.get('summary', 'No hype summary available')
            # Truncate to 180 characters
            if len(hype_summary) > 180:
                hype_summary = hype_summary[:180] + "..."

            # Extract fundamentals (price data)
            fundamentals = symbol_data.get('fundamentals', {})
            price = self._parse_float(str(fundamentals.get('LastPrice', '0')))

            # Calculate volume (may not be available for all symbols)
            volume_str = fundamentals.get('AverageDailyVolumeLast3Months', '0')
            if isinstance(volume_str, str):
                volume = self._format_volume(float(volume_str.replace(',', '')))
            else:
                volume = self._format_volume(float(volume_str))

            # Market cap (may need to be calculated or fetched elsewhere)
            market_cap = fundamentals.get('MarketCapitalization', 'N/A')

            # Percent change (not directly available, set to 0 for now)
            percent_change = 0.0

            # Determine direction (default to flat since we don't have change data)
            direction = 'flat'

            return {
                'symbol': symbol,
                'title': title,
                'price': price,
                'percent_change': percent_change,
                'volume': volume,
                'market_cap': market_cap,
                'direction': direction,
                'watchlist_count': watchlist_count,
                'trending_score': trending_score,
                'hype': hype_summary,
                'source': 'stocktwits_api'
            }

        except Exception as e:
            print(f"Error extracting API ticker data: {e}")
            return None

    @staticmethod
    def _parse_float(text: str) -> float:
        """Parse a string to float, removing $ and commas."""
        try:
            clean_text = text.replace('$', '').replace(',', '').strip()
            if clean_text in ('', 'N/A', 'None'):
                return 0.0
            return float(clean_text)
        except (ValueError, AttributeError, TypeError):
            return 0.0

    @staticmethod
    def _format_volume(volume: float) -> str:
        """Format volume number to human-readable string (e.g., 1.5M, 234.5K)."""
        try:
            if volume >= 1_000_000_000:
                return f"{volume / 1_000_000_000:.2f}B"
            elif volume >= 1_000_000:
                return f"{volume / 1_000_000:.2f}M"
            elif volume >= 1_000:
                return f"{volume / 1_000:.2f}K"
            else:
                return str(int(volume))
        except (ValueError, TypeError):
            return "0"


# Global client instance
stocktwits_client = StocktwitsClient()
