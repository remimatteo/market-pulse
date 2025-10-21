'use client'

import { IndexData } from '@/lib/api'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'
import MiniSparkline from './MiniSparkline'

interface TopTickerStripProps {
  indices: IndexData[]
}

export default function TopTickerStrip({ indices }: TopTickerStripProps) {
  return (
    <div className="bg-surface border-b border-surface-light overflow-hidden">
      <div className="flex items-center space-x-6 px-4 py-3 overflow-x-auto scrollbar-hide">
        {indices.map((index) => (
          <div
            key={index.symbol}
            className="flex items-center space-x-3 min-w-fit"
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">
                {index.name}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(index.price)}
                </span>
                <span
                  className={`text-xs font-medium ${getChangeColor(
                    index.change_percent
                  )}`}
                >
                  {formatPercent(index.change_percent)}
                </span>
              </div>
            </div>
            {index.historical_prices && index.historical_prices.length > 0 && (
              <MiniSparkline
                data={index.historical_prices}
                color={index.change_percent >= 0 ? '#10b981' : '#ef4444'}
                width={60}
                height={25}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
