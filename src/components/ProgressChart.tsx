import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { WorkoutEntry } from '@/lib/types'

interface ProgressChartProps {
  entries: WorkoutEntry[]
  metric: 'weight' | 'volume'
}

export function ProgressChart({ entries, metric }: ProgressChartProps) {
  const data = [...entries]
    .filter((e) => e.date && (metric === 'weight' ? e.weight !== null : e.volume !== null))
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .map((e) => ({
      date: new Date(e.date!.slice(0, 10) + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: metric === 'weight' ? e.weight : e.volume,
    }))

  if (data.length < 2) return null

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'oklch(0.58 0.010 280)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'oklch(0.58 0.010 280)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'oklch(0.14 0.008 280)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '10px',
            color: 'oklch(0.97 0.005 280)',
            fontSize: 13,
          }}
          cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="oklch(0.68 0.22 293)"
          strokeWidth={2.5}
          dot={{ fill: 'oklch(0.68 0.22 293)', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
