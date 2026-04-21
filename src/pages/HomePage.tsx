import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Dumbbell, TrendingUp, Flame, RefreshCw } from 'lucide-react'
import { fetchWorkouts } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WorkoutEntry } from '@/lib/types'

export function HomePage() {
  const { data: workouts = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts,
  })

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
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading workouts…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh] p-6">
        <Card className="p-6 text-center border-destructive/30 bg-destructive/10 w-full max-w-sm">
          <p className="text-sm text-destructive font-medium mb-1">Connection error</p>
          <p className="text-xs text-muted-foreground">
            Check your Notion API token and database ID in Vercel environment variables.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-6 max-w-lg mx-auto w-full">
      <div className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gradus</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-muted-foreground p-1 -mr-1 mt-1 disabled:opacity-40"
        >
          <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <Dumbbell className="h-4 w-4 text-primary mb-2" />
            <div className="text-2xl font-bold">{thisWeek.length}</div>
            <div className="text-xs text-muted-foreground">sets this week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <Flame className="h-4 w-4 text-orange-400 mb-2" />
            <div className="text-2xl font-bold">{uniqueDays}</div>
            <div className="text-xs text-muted-foreground">days trained</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <TrendingUp className="h-4 w-4 text-emerald-400 mb-2" />
            <div className="text-2xl font-bold">{maxWeight > 0 ? maxWeight : '—'}</div>
            <div className="text-xs text-muted-foreground">top weight</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Recent Activity
        </p>
        <div className="flex flex-col gap-5">
          {sortedDates.slice(0, 7).map((date) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted-foreground mb-2">{formatDate(date)}</p>
              <div className="flex flex-col gap-2">
                {grouped[date].map((entry) => (
                  <Link key={entry.id} to={`/exercise/${encodeURIComponent(entry.name)}`}>
                    <Card className="active:opacity-60 transition-opacity cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{entry.name}</p>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          {entry.weight !== null && (
                            <span className="text-sm font-semibold">{entry.weight}</span>
                          )}
                          {entry.unit && (
                            <Badge className="bg-violet-900/50 text-violet-300 border-violet-700/40 border">
                              {entry.unit}
                            </Badge>
                          )}
                          {entry.reps !== null && (
                            <span className="text-xs text-muted-foreground">×{entry.reps}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {workouts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No workouts yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
