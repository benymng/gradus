import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import { fetchWorkouts } from '@/lib/api'
import { getExerciseSummaries, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function SearchPage() {
  const [query, setQuery] = useState('')

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => fetchWorkouts(),
  })

  const summaries = getExerciseSummaries(workouts)
  const filtered = query
    ? summaries.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : summaries

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Sticky header with search */}
      <div
        className="shrink-0 px-4 pt-4 pb-3"
        style={{
          background: 'oklch(0.07 0.012 278)',
          borderBottom: '1px solid oklch(1 0 0 / 6%)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <h1
          className="text-3xl font-bold tracking-tight leading-none mb-3"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}
        >
          Exercises
        </h1>
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: 'oklch(0.52 0.014 278)' }}
          />
          <input
            placeholder="Search exercises…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground"
            style={{
              background: 'oklch(0.13 0.011 278)',
              border: '1px solid oklch(1 0 0 / 8%)',
              borderRadius: '0.75rem',
              height: '44px',
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: '16px',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'oklch(0.64 0.26 291 / 0.5)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'oklch(1 0 0 / 8%)'
            }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div
              className="h-7 w-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'oklch(0.64 0.26 291)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-w-lg mx-auto">
            {filtered.length > 0 && (
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2 ml-0.5"
                style={{ color: 'oklch(0.52 0.014 278)', letterSpacing: '0.1em' }}
              >
                {query ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : `${filtered.length} exercises`}
              </p>
            )}
            {filtered.map((summary) => (
              <Link key={summary.name} to={`/exercise/${encodeURIComponent(summary.name)}`}>
                <div
                  className="flex items-center justify-between rounded-xl px-4 transition-all active:scale-[0.98] active:opacity-70"
                  style={{
                    background: 'oklch(0.11 0.011 278)',
                    border: '1px solid oklch(1 0 0 / 7%)',
                    minHeight: '56px',
                  }}
                >
                  <div className="min-w-0 flex-1 py-3">
                    <p className="font-medium text-sm truncate leading-tight">{summary.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'oklch(0.52 0.014 278)' }}>
                      {formatDate(summary.lastDate)} · {summary.totalSets}{' '}
                      {summary.totalSets === 1 ? 'set' : 'sets'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    {summary.lastWeight !== null && (
                      <span
                        className="font-bold text-xl"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                      >
                        {summary.lastWeight}
                      </span>
                    )}
                    {summary.unit && (
                      <Badge
                        className="text-xs font-semibold"
                        style={{
                          background: 'oklch(0.64 0.26 291 / 0.15)',
                          color: 'oklch(0.80 0.18 291)',
                          border: '1px solid oklch(0.64 0.26 291 / 0.25)',
                          padding: '1px 7px',
                        }}
                      >
                        {summary.unit}
                      </Badge>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-40" />
                  </div>
                </div>
              </Link>
            ))}
            {!isLoading && filtered.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-2">
                <Search className="h-8 w-8 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground text-center">
                  {query ? `No exercises matching "${query}"` : 'No exercises found.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
