import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { fetchWorkouts } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressChart } from '@/components/ProgressChart'

export function ExercisePage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const decodedName = decodeURIComponent(name ?? '')

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => fetchWorkouts(),
  })

  const entries = workouts
    .filter((w) => w.name.toLowerCase() === decodedName.toLowerCase())
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  const latest = entries[0]

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 pb-6 max-w-lg mx-auto w-full page-enter">
      {/* Back navigation — 44px touch target */}
      <div className="flex items-center gap-1 -ml-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-xl transition-colors active:bg-white/5"
          style={{ minWidth: '44px', minHeight: '44px' }}
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <h1
          className="text-xl font-bold leading-tight flex-1 truncate"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '-0.01em' }}
        >
          {decodedName}
        </h1>
      </div>

      {/* Latest workout hero card */}
      {latest && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, oklch(0.18 0.08 291) 0%, oklch(0.13 0.05 278) 100%)',
            border: '1px solid oklch(0.64 0.26 291 / 0.3)',
          }}
        >
          {/* Subtle radial glow */}
          <div
            className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at top right, oklch(0.64 0.26 291 / 0.12) 0%, transparent 70%)',
            }}
          />
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4 relative"
            style={{ color: 'oklch(0.72 0.20 291)', letterSpacing: '0.12em' }}
          >
            Last Workout
          </p>
          <div className="flex items-end gap-5 relative">
            {latest.weight !== null && (
              <div>
                <div
                  className="leading-none"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: '64px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {latest.weight}
                </div>
                <div className="text-sm mt-1" style={{ color: 'oklch(0.72 0.20 291)' }}>
                  {latest.unit ?? 'lbs'}
                </div>
              </div>
            )}
            {latest.reps !== null && (
              <div className="pb-0.5">
                <div
                  className="font-bold leading-none"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: '32px',
                    color: 'oklch(0.80 0.12 291)',
                  }}
                >
                  ×{latest.reps}
                </div>
                <div className="text-xs mt-1" style={{ color: 'oklch(0.60 0.014 278)' }}>reps</div>
              </div>
            )}
            <div className="ml-auto text-right pb-0.5">
              <div className="text-sm font-medium" style={{ color: 'oklch(0.72 0.014 278)' }}>
                {formatDate(latest.date)}
              </div>
              {latest.volume !== null && (
                <div className="text-xs mt-0.5" style={{ color: 'oklch(0.52 0.014 278)' }}>
                  {latest.volume} vol
                </div>
              )}
            </div>
          </div>
          {latest.notes && (
            <p
              className="text-xs mt-4 pt-3 relative"
              style={{
                borderTop: '1px solid oklch(0.64 0.26 291 / 0.2)',
                color: 'oklch(0.64 0.014 278)',
              }}
            >
              {latest.notes}
            </p>
          )}
        </div>
      )}

      {/* Progress chart */}
      {entries.length >= 2 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'oklch(0.11 0.011 278)',
            border: '1px solid oklch(1 0 0 / 7%)',
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'oklch(0.52 0.014 278)', letterSpacing: '0.1em' }}
            >
              Weight Over Time
            </CardTitle>
          </CardHeader>
          <div className="pr-2 pb-3 pl-1">
            <ProgressChart entries={entries} metric="weight" />
          </div>
        </div>
      )}

      {/* History list */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'oklch(0.52 0.014 278)', letterSpacing: '0.1em' }}
        >
          History · {entries.length} {entries.length === 1 ? 'set' : 'sets'}
        </p>
        <div className="flex flex-col gap-1.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl px-4"
              style={{
                background: 'oklch(0.11 0.011 278)',
                border: '1px solid oklch(1 0 0 / 7%)',
                minHeight: '52px',
              }}
            >
              <div className="min-w-0 py-3">
                <p className="text-sm font-medium leading-tight">{formatDate(entry.date)}</p>
                {entry.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.notes}</p>
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
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No data found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
