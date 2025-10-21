'use client'

import { useRouter } from 'next/navigation'
import { TickerData } from '@/lib/api'
import {
  formatCurrency,
  formatPercent,
  formatCompact,
  getChangeColor,
  getRSIBadge,
  getSMAStatus,
} from '@/lib/utils'
import MiniSparkline from './MiniSparkline'
import { ExternalLink, TrendingUp } from 'lucide-react'

interface TickerTableProps {
  tickers: TickerData[]
}

export default function TickerTable({ tickers }: TickerTableProps) {
  const router = useRouter()

  const handleRowClick = (symbol: string) => {
    router.push(`/ticker/${symbol}`)
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-border">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">
              Symbol
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">
              Price
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">
              Change
            </th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">
              Sentiment
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">
              Volume
            </th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">
              RSI
            </th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">
              Signal
            </th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">
              Trend
            </th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tickers.map((ticker) => {
            const rsiBadge = getRSIBadge(ticker.indicators.rsi)
            const smaBadge = getSMAStatus(ticker.indicators.sma)
            const overallSignal = ticker.indicators.overall_signal

            return (
              <tr
                key={ticker.symbol}
                onClick={() => handleRowClick(ticker.symbol)}
                className="border-b border-surface-border/50 hover:bg-surface-light/50 transition-colors cursor-pointer"
              >
                {/* Symbol */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">
                      {ticker.symbol}
                    </span>
                    <span className="text-xs text-gray-400">{ticker.type}</span>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3 px-4 text-right">
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(ticker.current_price)}
                  </span>
                </td>

                {/* Change */}
                <td className="py-3 px-4 text-right">
                  <span
                    className={`text-sm font-semibold ${getChangeColor(
                      ticker.change_percent
                    )}`}
                  >
                    {formatPercent(ticker.change_percent)}
                  </span>
                </td>

                {/* Sentiment */}
                <td className="py-3 px-4 text-center">
                  {ticker.sentiment && ticker.sentiment.bullish_percent !== undefined ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-semibold ${ticker.sentiment.bullish_percent > 50 ? 'text-bullish' : 'text-bearish'}`}>
                          {ticker.sentiment.bullish_percent.toFixed(0)}%
                        </span>
                        <TrendingUp className={`w-3 h-3 ${ticker.sentiment.bullish_percent > 50 ? 'text-bullish' : 'text-bearish rotate-180'}`} />
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {ticker.sentiment.message_volume || 0} msgs
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">N/A</span>
                  )}
                </td>

                {/* Volume */}
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-white">
                      {formatCompact(ticker.volume)}
                    </span>
                    {ticker.indicators.volume.significant && (
                      <span className="text-xs text-primary font-medium">
                        High
                      </span>
                    )}
                  </div>
                </td>

                {/* RSI Badge */}
                <td className="py-3 px-4 text-center">
                  <span className={`badge ${rsiBadge.class}`}>
                    {ticker.indicators.rsi.value.toFixed(0)}
                  </span>
                </td>

                {/* Overall Signal Badge */}
                <td className="py-3 px-4 text-center">
                  <span className={`badge ${
                    overallSignal === 'bullish' ? 'badge-bullish' :
                    overallSignal === 'bearish' ? 'badge-bearish' :
                    'badge-neutral'
                  } text-[10px]`}>
                    {overallSignal.toUpperCase()}
                  </span>
                </td>

                {/* Sparkline Trend */}
                <td className="py-3 px-4">
                  <div className="flex justify-center">
                    {ticker.historical_prices &&
                    ticker.historical_prices.length > 0 ? (
                      <MiniSparkline
                        data={ticker.historical_prices.slice(-7)}
                        width={80}
                        height={30}
                      />
                    ) : (
                      <span className="text-xs text-gray-500">N/A</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`https://stocktwits.com/symbol/${ticker.symbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary-light transition-colors"
                    title="View on Stocktwits"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {tickers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No tickers available
        </div>
      )}
    </div>
  )
}
