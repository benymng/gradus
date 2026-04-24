import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Dumbbell, TrendingUp, Flame, RefreshCw, ChevronRight } from 'lucide-react'
import { fetchWorkouts } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WorkoutEntry } from '@/lib/types'

export function HomePage() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { data: workouts = [], isLoading, error } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => fetchWorkouts(),
  })

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      const fresh = await fetchWorkouts({ bust: true })
      queryClient.setQueryData(['workouts'], fresh)
    } finally {
      setIsRefreshing(false)
    }
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const thisWeek = workouts.filter((w) => {
    if (!w.date) return false
    return new Date(w.date) >= sevenDaysAgo
  })

  const maxWeight = thisWeek.reduce((max, w) => Math.max(max, w.weight ?? 0), 0)

  const uniqueDays = new Set(thisWeek.map((w) => w.date ? w.date.split('T')[0] : 'unknown')).size

  const recent = workouts.slice(0, 30)
  const grouped = recent.reduce<Record<string, WorkoutEntry[]>>((acc, entry) => {
    const date = (entry.date ? entry.date.split('T')[0] : 'unknown')
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  )

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'oklch(0.64 0.26 291)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-muted-foreground tracking-wide">Loading…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh] p-6">
        <Card className="p-6 text-center w-full max-w-sm" style={{ borderColor: 'oklch(0.65 0.22 25 / 0.3)', background: 'oklch(0.65 0.22 25 / 0.08)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'oklch(0.75 0.18 25)' }}>Connection error</p>
          <p className="text-xs text-muted-foreground">
            Check your Notion API token and database ID in Vercel environment variables.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6 max-w-lg mx-auto w-full page-enter">
      {/* Header */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <h1
            className="text-4xl font-bold tracking-tight leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: '-0.01em' }}
          >
            Gradus
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-muted-foreground p-2 -mr-1 mt-0.5 rounded-full transition-colors active:bg-white/5 disabled:opacity-40"
          style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Refresh"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          icon={<Dumbbell className="h-3.5 w-3.5" style={{ color: 'oklch(0.64 0.26 291)' }} />}
          value={thisWeek.length}
          label="sets"
          delay="0ms"
        />
        <StatCard
          icon={<Flame className="h-3.5 w-3.5" style={{ color: 'oklch(0.75 0.18 55)' }} />}
          value={uniqueDays}
          label="days"
          delay="60ms"
        />
        <StatCard
          icon={<TrendingUp className="h-3.5 w-3.5" style={{ color: 'oklch(0.72 0.18 155)' }} />}
          value={maxWeight > 0 ? maxWeight : '—'}
          label="top wt"
          delay="120ms"
        />
      </div>

      {/* Recent Activity */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'oklch(0.52 0.014 278)', letterSpacing: '0.1em' }}
        >
          Recent Activity
        </p>
        <div className="flex flex-col gap-4">
          {sortedDates.slice(0, 7).map((date) => (
            <div key={date}>
              <p
                className="text-xs font-semibold mb-2 ml-0.5"
                style={{ color: 'oklch(0.52 0.014 278)' }}
              >
                {formatDate(date)}
              </p>
              <div className="flex flex-col gap-1.5">
                {grouped[date].map((entry) => (
                  <Link key={entry.id} to={`/exercise/${encodeURIComponent(entry.name)}`}>
                    <div
                      className="flex items-center justify-between rounded-xl px-4 transition-all active:scale-[0.98] active:opacity-70"
                      style={{
                        background: 'oklch(0.11 0.011 278)',
                        border: '1px solid oklch(1 0 0 / 7%)',
                        minHeight: '52px',
                      }}
                    >
                      <div className="min-w-0 flex-1 py-3">
                        <p className="font-medium text-sm truncate leading-tight">{entry.name}</p>
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        {entry.weight !== null && (
                          <span
                            className="font-bold text-base"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                          >
                            {entry.weight}
                          </span>
                        )}
                        {entry.unit && (
                          <Badge
                            className="text-xs font-semibold"
                            style={{
                              background: 'oklch(0.64 0.26 291 / 0.15)',
                              color: 'oklch(0.80 0.18 291)',
                              border: '1px solid oklch(0.64 0.26 291 / 0.25)',
                              padding: '1px 7px',
                            }}
                          >
                            {entry.unit}
                          </Badge>
                        )}
                        {entry.reps !== null && (
                          <span className="text-xs text-muted-foreground">×{entry.reps}</span>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-40" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {workouts.length === 0 && (
            <div className="flex flex-col items-center py-14 gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'oklch(0.17 0.012 278)' }}
              >
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
  delay: string
}) {
  return (
    <div
      className="flex flex-col gap-1.5 rounded-xl p-3"
      style={{
        background: 'oklch(0.11 0.011 278)',
        border: '1px solid oklch(1 0 0 / 7%)',
      }}
    >
      <div className="flex items-center justify-between">
        {icon}
      </div>
      <div
        className="stat-number text-3xl font-bold leading-none tracking-tight"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          animationDelay: delay,
        }}
      >
        {value}
      </div>
      <div
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: 'oklch(0.52 0.014 278)', letterSpacing: '0.06em' }}
      >
        {label}
      </div>
    </div>
  )
}
