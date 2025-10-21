'use client'

interface TabFilterProps {
  activeTab: 'stocks' | 'crypto'
  onTabChange: (tab: 'stocks' | 'crypto') => void
}

export default function TabFilter({ activeTab, onTabChange }: TabFilterProps) {
  const tabs = [
    { id: 'stocks' as const, label: 'Stocks' },
    { id: 'crypto' as const, label: 'Crypto' },
  ]

  return (
    <div className="flex items-center border-b border-surface-border mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-6 py-3 text-sm font-semibold transition-all relative
            ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }
          `}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  )
}
