'use client'

import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface RefreshButtonProps {
  onRefresh: () => Promise<void>
}

export default function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="fixed bottom-8 right-8 btn-primary shadow-2xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Refresh market data"
    >
      <RefreshCw
        className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
      />
      <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
    </button>
  )
}
