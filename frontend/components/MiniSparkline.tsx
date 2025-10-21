'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface MiniSparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
}

export default function MiniSparkline({
  data,
  color = '#667eea',
  width = 80,
  height = 30,
}: MiniSparklineProps) {
  // Convert data array to format required by Recharts
  const chartData = data.map((value, index) => ({
    index,
    value,
  }))

  // Determine color based on trend
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0
  const lineColor = color || (trend >= 0 ? '#10b981' : '#ef4444')

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
