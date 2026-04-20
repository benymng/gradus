import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { fetchWorkouts } from '@/lib/api'
import { getExerciseSummaries, formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function SearchPage() {
  const [query, setQuery] = useState('')

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts,
  })

  const summaries = getExerciseSummaries(workouts)
  const filtered = query
    ? summaries.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : summaries

  return (
    <div className="flex flex-col gap-4 p-4 pb-6 max-w-lg mx-auto w-full">
      <div className="pt-2">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Search</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search exercises…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((summary) => (
            <Link key={summary.name} to={`/exercise/${encodeURIComponent(summary.name)}`}>
              <Card className="active:opacity-60 transition-opacity cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{summary.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(summary.lastDate)} · {summary.totalSets}{' '}
                      {summary.totalSets === 1 ? 'set' : 'sets'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    {summary.lastWeight !== null && (
                      <span className="text-xl font-bold">{summary.lastWeight}</span>
                    )}
                    {summary.unit && (
                      <Badge className="bg-violet-900/50 text-violet-300 border-violet-700/40 border">
                        {summary.unit}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              {query ? `No exercises matching "${query}"` : 'No exercises found.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
