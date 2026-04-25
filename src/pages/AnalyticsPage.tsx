import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import { fetchWorkouts } from '@/lib/api'
import { Card } from '@/components/ui/card'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function buildMonthCells(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

const TOOLTIP_STYLE = {
  backgroundColor: 'oklch(0.14 0.008 280)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '10px',
  color: 'oklch(0.97 0.005 280)',
  fontSize: 12,
}

const SECTION_LABEL: React.CSSProperties = {
  color: 'oklch(0.52 0.014 278)',
  letterSpacing: '0.1em',
}

const CARD_STYLE = {
  background: 'oklch(0.11 0.011 278)',
  border: '1px solid oklch(1 0 0 / 7%)',
}

export function AnalyticsPage() {
  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => fetchWorkouts(),
  })

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  // Map of dateStr -> workout count
  const workoutsByDate = useMemo(() => {
    const map: Record<string, number> = {}
    for (const w of workouts) {
      if (!w.date) continue
      const d = w.date.slice(0, 10)
      map[d] = (map[d] || 0) + 1
    }
    return map
  }, [workouts])

  // Two months: previous and current
  const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1
  const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear()
  const months = [
    { year: prevYear, month: prevMonth },
    { year: today.getFullYear(), month: today.getMonth() },
  ]

  // Top exercises by total volume
  const volumeByExercise = useMemo(() => {
    const map: Record<string, number> = {}
    for (const w of workouts) {
      if (!w.name || !w.volume) continue
      map[w.name] = (map[w.name] || 0) + w.volume
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, volume]) => ({
        name: name.length > 15 ? name.slice(0, 14) + '…' : name,
        volume: Math.round(volume),
      }))
      .reverse() // bottom-to-top looks better in vertical bar chart
  }, [workouts])

  // Top 3 exercises by percentage weight increase (first session → latest session)
  const topProgressors = useMemo(() => {
    // Group max weight per date per exercise
    const byExercise: Record<string, Record<string, number>> = {}
    const unitMap: Record<string, string> = {}
    for (const w of workouts) {
      if (!w.name || !w.date || w.weight === null) continue
      const d = w.date.slice(0, 10)
      if (!byExercise[w.name]) byExercise[w.name] = {}
      byExercise[w.name][d] = Math.max(byExercise[w.name][d] ?? 0, w.weight)
      if (w.unit && !unitMap[w.name]) unitMap[w.name] = w.unit
    }

    return Object.entries(byExercise)
      .map(([name, dateMap]) => {
        const sorted = Object.entries(dateMap).sort((a, b) => a[0].localeCompare(b[0]))
        if (sorted.length < 2) return null
        const first = sorted[0][1]
        const last = sorted[sorted.length - 1][1]
        if (first === 0) return null
        const pctIncrease = ((last - first) / first) * 100
        const points = sorted.map(([date, weight]) => ({
          date: new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          weight,
        }))
        return { name, pctIncrease, points, unit: unitMap[name] ?? 'lbs', first, last }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null && x.pctIncrease > 0)
      .sort((a, b) => b.pctIncrease - a.pctIncrease)
      .slice(0, 3)
  }, [workouts])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div
          className="h-8 w-8 rounded-full border-2 animate-spin"
          style={{ borderColor: 'oklch(0.64 0.26 291)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6 max-w-lg mx-auto w-full page-enter">
      {/* Header */}
      <div className="pt-1">
        <h1
          className="text-4xl font-bold tracking-tight leading-none"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: '-0.01em' }}
        >
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Past two months</p>
      </div>

      {/* ── Consistency Calendar ── */}
      <Card style={CARD_STYLE} className="p-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={SECTION_LABEL}>
          Consistency
        </p>

        <div className="grid grid-cols-2 gap-4">
          {months.map(({ year, month }) => {
            const cells = buildMonthCells(year, month)
            return (
              <div key={`${year}-${month}`}>
                <p className="text-sm font-semibold mb-2 leading-none">{monthLabel(year, month)}</p>
                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 gap-[3px] mb-[3px]">
                  {DOW.map((d, i) => (
                    <div
                      key={i}
                      className="text-center"
                      style={{ color: 'oklch(0.42 0.010 278)', fontSize: '9px', fontWeight: 600 }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-[3px]">
                  {cells.map((day, i) => {
                    if (day === null) return <div key={i} style={{ height: '14px' }} />

                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const count = workoutsByDate[dateStr] ?? 0
                    const isToday = dateStr === todayStr
                    const isFuture = dateStr > todayStr

                    let bg: string
                    let border = 'none'

                    if (isFuture) {
                      bg = 'oklch(0.13 0.009 278)'
                    } else if (isToday) {
                      bg = count > 0 ? 'oklch(0.52 0.20 200)' : 'oklch(0.18 0.012 278)'
                      border = '1.5px solid oklch(0.62 0.22 240)'
                    } else if (count === 0) {
                      bg = 'oklch(0.17 0.011 278)'
                    } else if (count === 1) {
                      bg = 'oklch(0.58 0.22 140)'
                    } else if (count === 2) {
                      bg = 'oklch(0.60 0.19 168)'
                    } else {
                      bg = 'oklch(0.55 0.20 200)'
                    }

                    return (
                      <div
                        key={i}
                        style={{ height: '14px', borderRadius: '3px', background: bg, border }}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {[
            { color: 'oklch(0.58 0.22 140)', label: '1 workout' },
            { color: 'oklch(0.60 0.19 168)', label: '2 workouts' },
            { color: 'oklch(0.55 0.20 200)', label: '3+ workouts' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: color }} />
              <span className="text-xs" style={{ color: 'oklch(0.52 0.014 278)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Volume by Exercise ── */}
      <Card style={CARD_STYLE} className="p-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={SECTION_LABEL}>
          Total Volume by Exercise
        </p>
        {volumeByExercise.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No volume data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={volumeByExercise.length * 34 + 10}>
            <BarChart
              data={volumeByExercise}
              layout="vertical"
              margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fill: 'oklch(0.48 0.010 280)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'oklch(0.78 0.010 280)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                formatter={(v) => [`${Number(v).toLocaleString()} lbs`, 'Volume']}
              />
              <Bar dataKey="volume" fill="oklch(0.64 0.26 291)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Strength Progression ── */}
      <Card style={CARD_STYLE} className="p-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={SECTION_LABEL}>
          Strength Progression
        </p>
        <p className="text-xs text-muted-foreground mb-4">Top 3 most improved exercises</p>
        {topProgressors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Need 2+ sessions per exercise to show progression
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {topProgressors.map(({ name, pctIncrease, points, unit, first, last }) => (
              <div key={name}>
                {/* Exercise header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'oklch(0.52 0.014 278)' }}>
                      {first} → {last} {unit}
                    </p>
                  </div>
                  <div
                    className="ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{
                      background: 'oklch(0.72 0.20 155 / 0.15)',
                      color: 'oklch(0.72 0.20 155)',
                      border: '1px solid oklch(0.72 0.20 155 / 0.3)',
                    }}
                  >
                    +{pctIncrease.toFixed(1)}%
                  </div>
                </div>
                {/* Mini line chart */}
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={points} margin={{ top: 4, right: 10, bottom: 0, left: -24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'oklch(0.48 0.010 280)', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'oklch(0.48 0.010 280)', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                      formatter={(v) => [`${v} ${unit}`, 'Max Weight']}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="oklch(0.72 0.20 155)"
                      strokeWidth={2}
                      dot={{ fill: 'oklch(0.72 0.20 155)', r: 2.5, strokeWidth: 0 }}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
