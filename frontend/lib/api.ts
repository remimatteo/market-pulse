/**
 * API client for MarketPulse backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface TickerData {
  symbol: string
  title: string
  type: 'stock' | 'crypto'
  exchange: string
  current_price: number
  previous_close: number
  change_percent: number
  volume: number
  avg_volume: number
  historical_prices: number[]
  historical_dates: string[]
  indicators: IndicatorData
  sentiment?: SentimentData
  timestamp: string
  source?: string
}

export interface IndicatorData {
  rsi: {
    value: number
    signal: 'overbought' | 'oversold' | 'neutral'
    bullish: boolean
  }
  macd: {
    macd: number
    signal: number
    histogram: number
    bullish: boolean
  }
  sma: {
    sma_50: number
    sma_200: number
    golden_cross: boolean
    death_cross: boolean
    bullish: boolean
  }
  volume: {
    current: number
    average: number
    percent_change: number
    significant: boolean
  }
  overall_signal: 'bullish' | 'bearish' | 'neutral'
}

export interface SentimentData {
  bullish_percent?: number
  bearish_percent?: number
  message_volume?: number
  trending_score?: number
  watchlist_count?: number
}

export interface MarketSummary {
  headline: string
  top_gainer: {
    symbol: string
    change_percent: number
    price: number
  }
  top_loser: {
    symbol: string
    change_percent: number
    price: number
  }
  stock_trend: string
  crypto_trend: string
  bullish_count: number
  bearish_count: number
  neutral_count: number
  key_insights: string[]
}

export interface TrendingResponse {
  tickers: TickerData[]
  summary: MarketSummary
  timestamp: string
  cache_status?: string
}

export interface IndexData {
  symbol: string
  name: string
  price: number
  change_percent: number
  historical_prices: number[]
}

export interface IndicesResponse {
  indices: IndexData[]
  timestamp: string
}

/**
 * Fetch trending tickers with analysis
 */
export async function fetchTrending(): Promise<TrendingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/trending`)

  if (!response.ok) {
    throw new Error(`Failed to fetch trending data: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch major market indices
 */
export async function fetchIndices(): Promise<IndicesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/indices`)

  if (!response.ok) {
    throw new Error(`Failed to fetch indices: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Refresh market data (clear cache)
 */
export async function refreshData(): Promise<{ message: string; cache_cleared: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/refresh`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Failed to refresh data: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch single ticker data
 */
export async function fetchTicker(symbol: string): Promise<TickerData> {
  const response = await fetch(`${API_BASE_URL}/api/ticker/${symbol}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch ticker ${symbol}: ${response.statusText}`)
  }

  return response.json()
}
