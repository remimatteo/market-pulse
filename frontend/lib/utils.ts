/**
 * Utility functions for MarketPulse
 */

/**
 * Format number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format number as compact (e.g., 1.5M, 2.3K)
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/**
 * Get color class for percentage change
 */
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-bullish'
  if (value < 0) return 'text-bearish'
  return 'text-neutral'
}

/**
 * Get badge class for indicator signal
 */
export function getBadgeClass(signal: 'bullish' | 'bearish' | 'neutral'): string {
  switch (signal) {
    case 'bullish':
      return 'badge-bullish'
    case 'bearish':
      return 'badge-bearish'
    default:
      return 'badge-neutral'
  }
}

/**
 * Get RSI badge info
 */
export function getRSIBadge(rsiData: { value: number; signal: string }): {
  text: string
  class: string
} {
  const { value, signal } = rsiData

  if (signal === 'overbought') {
    return {
      text: `RSI ${value.toFixed(0)} - Overbought`,
      class: 'badge-bearish',
    }
  }

  if (signal === 'oversold') {
    return {
      text: `RSI ${value.toFixed(0)} - Oversold`,
      class: 'badge-bullish',
    }
  }

  return {
    text: `RSI ${value.toFixed(0)}`,
    class: 'badge-neutral',
  }
}

/**
 * Get SMA status text
 */
export function getSMAStatus(smaData: {
  sma_50: number
  sma_200: number
  golden_cross: boolean
  death_cross: boolean
  bullish: boolean
}): {
  text: string
  class: string
} {
  if (smaData.golden_cross) {
    return {
      text: 'Golden Cross',
      class: 'badge-bullish',
    }
  }

  if (smaData.death_cross) {
    return {
      text: 'Death Cross',
      class: 'badge-bearish',
    }
  }

  if (smaData.bullish) {
    return {
      text: 'Above SMA 50/200',
      class: 'badge-bullish',
    }
  }

  return {
    text: 'Below SMA 50/200',
    class: 'badge-bearish',
  }
}

/**
 * Format relative time
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
