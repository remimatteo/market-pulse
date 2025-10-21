"""
In-memory cache manager with TTL support.
Thread-safe implementation for caching API responses.
"""

import time
from threading import Lock
from typing import Any, Optional, Dict
from datetime import datetime, timedelta
import config


class CacheManager:
    """
    Simple in-memory cache with time-to-live (TTL) support.
    Thread-safe for concurrent access.
    """

    def __init__(self, ttl_seconds: int = config.CACHE_TTL_SECONDS):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = Lock()
        self.ttl_seconds = ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve a value from cache if it exists and hasn't expired.

        Args:
            key: Cache key

        Returns:
            Cached value if valid, None if expired or not found
        """
        with self._lock:
            if key not in self._cache:
                return None

            entry = self._cache[key]

            # Check if entry has expired
            if time.time() > entry['expires_at']:
                del self._cache[key]
                return None

            return entry['value']

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        """
        Store a value in cache with TTL.

        Args:
            key: Cache key
            value: Value to cache
            ttl_seconds: Optional custom TTL (uses default if not provided)
        """
        ttl = ttl_seconds if ttl_seconds is not None else self.ttl_seconds

        with self._lock:
            self._cache[key] = {
                'value': value,
                'expires_at': time.time() + ttl,
                'created_at': time.time()
            }

    def invalidate(self, key: str) -> bool:
        """
        Remove a specific key from cache.

        Args:
            key: Cache key to invalidate

        Returns:
            True if key was removed, False if it didn't exist
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    def clear(self) -> None:
        """Clear all cache entries."""
        with self._lock:
            self._cache.clear()

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dictionary with cache size and keys
        """
        with self._lock:
            return {
                'total_entries': len(self._cache),
                'keys': list(self._cache.keys()),
                'ttl_seconds': self.ttl_seconds
            }

    def cleanup_expired(self) -> int:
        """
        Remove all expired entries from cache.

        Returns:
            Number of entries removed
        """
        with self._lock:
            current_time = time.time()
            expired_keys = [
                key for key, entry in self._cache.items()
                if current_time > entry['expires_at']
            ]

            for key in expired_keys:
                del self._cache[key]

            return len(expired_keys)


# Global cache instance
cache = CacheManager()
