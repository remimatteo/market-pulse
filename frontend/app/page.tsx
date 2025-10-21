'use client'

import { useEffect, useState } from 'react'
import { fetchTrending, fetchIndices, refreshData, TrendingResponse, IndicesResponse } from '@/lib/api'
import TopTickerStrip from '@/components/TopTickerStrip'
import SummaryCards from '@/components/SummaryCards'
import TabFilter from '@/components/TabFilter'
import TickerTable from '@/components/TickerTable'
import RefreshButton from '@/components/RefreshButton'
import { Loader2, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const [trendingData, setTrendingData] = useState<TrendingResponse | null>(null)
  const [indicesData, setIndicesData] = useState<IndicesResponse | null>(null)
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch both trending and indices data in parallel
      const [trending, indices] = await Promise.all([
        fetchTrending(),
        fetchIndices(),
      ])

      setTrendingData(trending)
      setIndicesData(indices)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load market data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      // Clear cache on backend
      await refreshData()
      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error refreshing data:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    }
  }

  // Filter tickers based on active tab
  const filteredTickers = trendingData?.tickers.filter((ticker) => {
    if (activeTab === 'stocks') return ticker.type === 'stock'
    if (activeTab === 'crypto') return ticker.type === 'crypto'
    return true
  }) || []

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-400">Loading market data...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-bearish" />
        <p className="text-gray-400">Error: {error}</p>
        <button onClick={loadData} className="btn-primary">
          Retry
        </button>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="space-y-6">
      {/* Top Ticker Strip */}
      {indicesData && <TopTickerStrip indices={indicesData.indices} />}

      {/* Summary Cards */}
      {trendingData && <SummaryCards summary={trendingData.summary} />}

      {/* Tab Filter */}
      <TabFilter activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Ticker Table */}
      <TickerTable tickers={filteredTickers} />

      {/* Refresh Button */}
      <RefreshButton onRefresh={handleRefresh} />

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 pb-4">
        <p>
          Data updated:{' '}
          {trendingData && new Date(trendingData.timestamp).toLocaleString()}
        </p>
        <p className="mt-1">
          Showing {filteredTickers.length} of {trendingData?.tickers.length || 0} tickers
        </p>
      </div>
    </div>
  )
}
