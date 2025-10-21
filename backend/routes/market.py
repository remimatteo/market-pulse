"""
Market API routes for trending tickers, indicators, news, summary, and scan.
"""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import List, Optional
import config

from models.schemas import (
    TrendingResponse, TrendingTicker,
    TechnicalIndicators,
    NewsResponse, NewsArticle,
    MarketSummary,
    ScanResponse, ScanSignal,
    HealthResponse,
    ErrorResponse
)
from services.stocktwits_client import stocktwits_client
from services.openbb_client import openbb_client
from services.cache_manager import cache


router = APIRouter(prefix="/api", tags=["market"])


@router.get("/trending", response_model=TrendingResponse)
async def get_trending(force_refresh: bool = Query(False, description="Force refresh cache")):
    """
    Get top trending tickers from Stocktwits (stocks + crypto).

    Returns top 10 trending symbols with price, volume, and change data.
    Data is cached for 5 minutes by default.
    """
    try:
        tickers_data = stocktwits_client.get_trending_tickers(force_refresh=force_refresh)

        tickers = [
            TrendingTicker(**ticker) for ticker in tickers_data
        ]

        return TrendingResponse(
            tickers=tickers,
            count=len(tickers),
            last_updated=datetime.now().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trending data: {str(e)}")


@router.get("/indicators/{symbol}", response_model=TechnicalIndicators)
async def get_indicators(
    symbol: str,
    force_refresh: bool = Query(False, description="Force refresh cache")
):
    """
    Get technical indicators for a specific symbol.

    Returns RSI, MACD, SMA_20, SMA_50, and volume data.
    Uses OpenBB Platform for calculations.
    """
    try:
        indicators = openbb_client.get_technical_indicators(symbol.upper(), force_refresh=force_refresh)

        if not indicators:
            raise HTTPException(
                status_code=404,
                detail=f"Unable to fetch indicators for {symbol}. Symbol may not exist or data unavailable."
            )

        return TechnicalIndicators(**indicators)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating indicators: {str(e)}")


@router.get("/news/{symbol}", response_model=NewsResponse)
async def get_news(
    symbol: str,
    limit: int = Query(10, ge=1, le=50, description="Number of articles to return"),
    force_refresh: bool = Query(False, description="Force refresh cache")
):
    """
    Get recent news headlines for a specific symbol.

    Returns news articles with sentiment analysis.
    Uses OpenBB Platform for news data.
    """
    try:
        articles_data = openbb_client.get_news(symbol.upper(), limit=limit, force_refresh=force_refresh)

        articles = [
            NewsArticle(**article) for article in articles_data
        ]

        return NewsResponse(
            symbol=symbol.upper(),
            articles=articles,
            count=len(articles)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")


@router.get("/summary", response_model=MarketSummary)
async def get_market_summary(force_refresh: bool = Query(False, description="Force refresh cache")):
    """
    Get overall market summary based on trending tickers.

    Analyzes technical indicators across trending symbols to determine
    market sentiment (bullish, bearish, neutral).
    Uses rule-based logic: RSI, MACD, SMA crossovers.
    """
    try:
        # Get trending tickers
        trending_data = stocktwits_client.get_trending_tickers(force_refresh=force_refresh)

        if not trending_data:
            raise HTTPException(status_code=503, detail="Unable to fetch trending data")

        bullish_count = 0
        bearish_count = 0
        neutral_count = 0
        top_movers = []

        # Analyze each trending ticker
        for ticker in trending_data[:10]:  # Analyze top 10
            symbol = ticker['symbol']

            # Get indicators
            indicators = openbb_client.get_technical_indicators(symbol)

            if not indicators or indicators.get('rsi') is None:
                neutral_count += 1
                continue

            # Apply rule-based logic
            sentiment = _analyze_ticker_sentiment(indicators)

            if sentiment == 'bullish':
                bullish_count += 1
            elif sentiment == 'bearish':
                bearish_count += 1
            else:
                neutral_count += 1

            # Track top movers
            top_movers.append({
                'symbol': symbol,
                'sentiment': sentiment,
                'price': ticker.get('price', 0),
                'change': ticker.get('percent_change', 0),
                'rsi': indicators.get('rsi')
            })

        # Determine overall market sentiment
        if bullish_count > bearish_count:
            market_sentiment = 'bullish'
        elif bearish_count > bullish_count:
            market_sentiment = 'bearish'
        else:
            market_sentiment = 'neutral'

        return MarketSummary(
            market_sentiment=market_sentiment,
            bullish_count=bullish_count,
            bearish_count=bearish_count,
            neutral_count=neutral_count,
            top_movers=sorted(top_movers, key=lambda x: abs(x['change']), reverse=True)[:5],
            last_updated=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating market summary: {str(e)}")


@router.get("/scan", response_model=ScanResponse)
async def scan_market(force_refresh: bool = Query(False, description="Force refresh cache")):
    """
    Scan trending tickers and return top bullish/bearish setups.

    Analyzes all trending tickers using technical indicators and
    ranks them by signal strength. Returns top 5 bullish and top 5 bearish.
    """
    try:
        # Get trending tickers
        trending_data = stocktwits_client.get_trending_tickers(force_refresh=force_refresh)

        if not trending_data:
            raise HTTPException(status_code=503, detail="Unable to fetch trending data")

        bullish_setups = []
        bearish_setups = []

        # Scan each ticker
        for ticker in trending_data:
            symbol = ticker['symbol']

            # Get indicators
            indicators = openbb_client.get_technical_indicators(symbol)

            if not indicators or indicators.get('rsi') is None:
                continue

            # Calculate setup score and signals
            score, signals, sentiment = _calculate_setup_score(indicators, ticker)

            scan_signal = ScanSignal(
                symbol=symbol,
                score=score,
                signals=signals,
                price=ticker.get('price', 0),
                rsi=indicators.get('rsi'),
                macd=indicators.get('macd'),
                percent_change=ticker.get('percent_change', 0)
            )

            if sentiment == 'bullish':
                bullish_setups.append(scan_signal)
            elif sentiment == 'bearish':
                bearish_setups.append(scan_signal)

        # Sort by score and take top 5
        bullish_setups.sort(key=lambda x: x.score, reverse=True)
        bearish_setups.sort(key=lambda x: x.score, reverse=True)

        return ScanResponse(
            bullish=bullish_setups[:config.MAX_SCAN_RESULTS],
            bearish=bearish_setups[:config.MAX_SCAN_RESULTS],
            total_scanned=len(trending_data),
            last_updated=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scanning market: {str(e)}")


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.

    Returns service status and availability of dependencies.
    """
    return HealthResponse(
        status="healthy",
        openbb_available=openbb_client.is_available(),
        cache_stats=cache.get_stats(),
        timestamp=datetime.now().isoformat()
    )


# Helper functions for sentiment analysis

def _analyze_ticker_sentiment(indicators: dict) -> str:
    """
    Analyze a ticker's sentiment based on technical indicators.

    Rules:
    - Bullish: RSI 30-50, MACD > signal, price > SMA_50
    - Bearish: RSI 50-70, MACD < signal, price < SMA_50
    - Neutral: Otherwise

    Args:
        indicators: Dictionary of technical indicators

    Returns:
        'bullish', 'bearish', or 'neutral'
    """
    rsi = indicators.get('rsi')
    macd = indicators.get('macd')
    macd_signal = indicators.get('macd_signal')
    price = indicators.get('price')
    sma_50 = indicators.get('sma_50')

    bullish_signals = 0
    bearish_signals = 0

    # RSI analysis
    if rsi is not None:
        if config.RSI_BULLISH_MIN <= rsi <= config.RSI_BULLISH_MAX:
            bullish_signals += 1
        elif config.RSI_BEARISH_MIN <= rsi <= config.RSI_BEARISH_MAX:
            bearish_signals += 1
        elif rsi < config.RSI_OVERSOLD:
            bullish_signals += 2  # Strong oversold signal
        elif rsi > config.RSI_OVERBOUGHT:
            bearish_signals += 2  # Strong overbought signal

    # MACD analysis
    if macd is not None and macd_signal is not None:
        if macd > macd_signal:
            bullish_signals += 1
        elif macd < macd_signal:
            bearish_signals += 1

    # SMA analysis
    if price is not None and sma_50 is not None:
        if price > sma_50:
            bullish_signals += 1
        elif price < sma_50:
            bearish_signals += 1

    if bullish_signals > bearish_signals:
        return 'bullish'
    elif bearish_signals > bullish_signals:
        return 'bearish'
    else:
        return 'neutral'


def _calculate_setup_score(indicators: dict, ticker: dict) -> tuple:
    """
    Calculate setup quality score (0-5) based on multiple signals.

    Args:
        indicators: Technical indicators
        ticker: Ticker data from Stocktwits

    Returns:
        Tuple of (score, signals_list, sentiment)
    """
    score = 0
    signals = []
    rsi = indicators.get('rsi')
    macd = indicators.get('macd')
    macd_signal = indicators.get('macd_signal')
    price = indicators.get('price')
    sma_20 = indicators.get('sma_20')
    sma_50 = indicators.get('sma_50')

    # RSI signals
    if rsi is not None:
        if rsi < config.RSI_OVERSOLD:
            score += 1
            signals.append(f"RSI oversold ({rsi:.1f})")
        elif rsi > config.RSI_OVERBOUGHT:
            score += 1
            signals.append(f"RSI overbought ({rsi:.1f})")

    # MACD signals
    if macd is not None and macd_signal is not None:
        if macd > macd_signal and macd > 0:
            score += 1
            signals.append("MACD bullish crossover")
        elif macd < macd_signal and macd < 0:
            score += 1
            signals.append("MACD bearish crossover")

    # SMA signals
    if price is not None and sma_20 is not None and sma_50 is not None:
        if price > sma_20 > sma_50:
            score += 1
            signals.append("Price above SMAs (bullish alignment)")
        elif price < sma_20 < sma_50:
            score += 1
            signals.append("Price below SMAs (bearish alignment)")

    # Volume surge
    percent_change = abs(ticker.get('percent_change', 0))
    if percent_change > 5:
        score += 1
        signals.append(f"Strong momentum ({percent_change:.1f}%)")

    # Determine sentiment
    sentiment = _analyze_ticker_sentiment(indicators)

    return score, signals, sentiment
