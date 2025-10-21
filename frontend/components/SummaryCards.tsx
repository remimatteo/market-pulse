'use client'

import { MarketSummary } from '@/lib/api'
import { formatPercent, formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface SummaryCardsProps {
  summary: MarketSummary
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Market Sentiment Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Market Sentiment</h3>
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">
            {summary.bullish_count > summary.bearish_count ? (
              <span className="text-bullish">Bullish</span>
            ) : summary.bearish_count > summary.bullish_count ? (
              <span className="text-bearish">Bearish</span>
            ) : (
              <span className="text-neutral">Neutral</span>
            )}
          </p>
          <p className="text-xs text-gray-400">
            {summary.bullish_count} bullish • {summary.bearish_count} bearish •{' '}
            {summary.neutral_count} neutral
          </p>
        </div>
      </div>

      {/* Top Gainer Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Top Gainer</h3>
          <TrendingUp className="w-5 h-5 text-bullish" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">
            {summary.top_gainer.symbol}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {formatCurrency(summary.top_gainer.price)}
            </span>
            <span className="text-sm font-semibold text-bullish">
              {formatPercent(summary.top_gainer.change_percent)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Loser Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Top Loser</h3>
          <TrendingDown className="w-5 h-5 text-bearish" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">
            {summary.top_loser.symbol}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {formatCurrency(summary.top_loser.price)}
            </span>
            <span className="text-sm font-semibold text-bearish">
              {formatPercent(summary.top_loser.change_percent)}
            </span>
          </div>
        </div>
      </div>

      {/* Market Insights (full width) */}
      <div className="card md:col-span-3">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Market Insights
        </h3>
        <div className="space-y-2">
          <p className="text-base font-semibold text-white">
            {summary.headline}
          </p>
          <ul className="space-y-1">
            {summary.key_insights.slice(0, 3).map((insight, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start">
                <span className="text-primary mr-2">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
