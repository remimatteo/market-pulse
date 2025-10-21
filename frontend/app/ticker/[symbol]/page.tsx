'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchTicker, TickerData } from '@/lib/api'
import { Loader2, AlertCircle, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import {
  formatCurrency,
  formatPercent,
  formatCompact,
  getChangeColor,
} from '@/lib/utils'

export default function TickerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const symbol = params.symbol as string

  const [ticker, setTicker] = useState<TickerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    const loadTickerData = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchTicker(symbol.toUpperCase())
        setTicker(data)
      } catch (err) {
        console.error('Error loading ticker:', err)
        setError(err instanceof Error ? err.message : 'Failed to load ticker data')
      } finally {
        setLoading(false)
      }
    }

    loadTickerData()
  }, [symbol])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-400">Loading {symbol} data...</p>
      </div>
    )
  }

  if (error || !ticker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-bearish" />
        <p className="text-gray-400">Error: {error || 'Ticker not found'}</p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  const isPositive = ticker.change_percent >= 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Ticker Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{ticker.symbol}</h1>
              <span className="badge badge-neutral text-xs">{ticker.type.toUpperCase()}</span>
            </div>
            <p className="text-gray-400 mt-1">{ticker.title}</p>
            <p className="text-xs text-gray-500 mt-1">{ticker.exchange}</p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {formatCurrency(ticker.current_price)}
            </div>
            <div className={`flex items-center justify-end gap-1 mt-1 text-lg font-semibold ${getChangeColor(ticker.change_percent)}`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>{formatPercent(ticker.change_percent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sentiment Card */}
        {ticker.sentiment && ticker.sentiment.bullish_percent !== undefined && (
          <div className="card">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Sentiment</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-bullish font-semibold">Bullish</span>
              <span className="text-bullish text-2xl font-bold">
                {ticker.sentiment.bullish_percent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-surface-light rounded-full h-2 mb-2">
              <div
                className="bg-bullish h-2 rounded-full transition-all"
                style={{ width: `${ticker.sentiment.bullish_percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-bearish font-semibold">Bearish</span>
              <span className="text-bearish text-2xl font-bold">
                {ticker.sentiment.bearish_percent?.toFixed(1)}%
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-surface-border">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Messages:</span>
                <span>{ticker.sentiment.message_volume || 0}</span>
              </div>
              {ticker.sentiment.watchlist_count ? (
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Watchers:</span>
                  <span>{formatCompact(ticker.sentiment.watchlist_count)}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Technical Indicators */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Technical Indicators</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">RSI</span>
              <span className={`font-semibold ${
                ticker.indicators.rsi.signal === 'overbought' ? 'text-bearish' :
                ticker.indicators.rsi.signal === 'oversold' ? 'text-bullish' :
                'text-neutral'
              }`}>
                {ticker.indicators.rsi.value.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">MACD</span>
              <span className={ticker.indicators.macd.bullish ? 'text-bullish font-semibold' : 'text-bearish font-semibold'}>
                {ticker.indicators.macd.histogram > 0 ? '+' : ''}{ticker.indicators.macd.histogram.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">SMA 50/200</span>
              <span className={ticker.indicators.sma.bullish ? 'text-bullish font-semibold' : 'text-bearish font-semibold'}>
                {ticker.indicators.sma.golden_cross ? 'Golden Cross' :
                 ticker.indicators.sma.death_cross ? 'Death Cross' :
                 ticker.indicators.sma.sma_50 > ticker.indicators.sma.200 ? 'Bullish' : 'Bearish'}
              </span>
            </div>
            <div className="pt-3 border-t border-surface-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Overall Signal</span>
                <span className={`badge ${
                  ticker.indicators.overall_signal === 'bullish' ? 'badge-bullish' :
                  ticker.indicators.overall_signal === 'bearish' ? 'badge-bearish' :
                  'badge-neutral'
                }`}>
                  {ticker.indicators.overall_signal.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Volume Info */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Volume</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Current</span>
              <span className="font-semibold text-white">{formatCompact(ticker.volume)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Average</span>
              <span className="font-semibold text-white">{formatCompact(ticker.avg_volume)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">vs Average</span>
              <span className={`font-semibold ${ticker.indicators.volume.percent_change > 0 ? 'text-bullish' : 'text-bearish'}`}>
                {ticker.indicators.volume.percent_change > 0 ? '+' : ''}{ticker.indicators.volume.percent_change.toFixed(1)}%
              </span>
            </div>
            {ticker.indicators.volume.significant && (
              <div className="pt-3 border-t border-surface-border">
                <span className="badge badge-bullish">High Volume</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Data */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Price Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-gray-500">Previous Close</span>
            <div className="text-lg font-semibold text-white mt-1">
              {formatCurrency(ticker.previous_close)}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">SMA 50</span>
            <div className="text-lg font-semibold text-white mt-1">
              {formatCurrency(ticker.indicators.sma.sma_50)}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">SMA 200</span>
            <div className="text-lg font-semibold text-white mt-1">
              {formatCurrency(ticker.indicators.sma.sma_200)}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Last Updated</span>
            <div className="text-sm text-gray-400 mt-1">
              {new Date(ticker.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* View on Stocktwits */}
      <div className="card">
        <a
          href={`https://stocktwits.com/symbol/${ticker.symbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-primary hover:text-primary-light transition-colors py-2"
        >
          <span className="font-medium">View Discussions on Stocktwits</span>
          <TrendingUp className="w-5 h-5" />
        </a>
      </div>
    </div>
  )
}
