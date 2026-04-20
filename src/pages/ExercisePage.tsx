import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { fetchWorkouts } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressChart } from '@/components/ProgressChart'

export function ExercisePage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const decodedName = decodeURIComponent(name ?? '')

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts,
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
    <div className="flex flex-col gap-4 p-4 pb-6 max-w-lg mx-auto w-full">
      <div className="flex items-center gap-1 pt-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="-ml-2 shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold leading-tight">{decodedName}</h1>
      </div>

      {latest && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-primary uppercase tracking-widest">
              Last Workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              {latest.weight !== null && (
                <div>
                  <div className="text-5xl font-bold tracking-tight">{latest.weight}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {latest.unit ?? 'lbs'}
                  </div>
                </div>
              )}
              {latest.reps !== null && (
                <div className="pb-1">
                  <div className="text-2xl font-semibold text-muted-foreground">
                    ×{latest.reps}
                  </div>
                  <div className="text-xs text-muted-foreground">reps</div>
                </div>
              )}
              <div className="ml-auto text-right pb-1">
                <div className="text-sm text-muted-foreground">{formatDate(latest.date)}</div>
                {latest.volume !== null && (
                  <div className="text-xs text-muted-foreground">{latest.volume} vol</div>
                )}
              </div>
            </div>
            {latest.notes && (
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                {latest.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {entries.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Weight Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pr-2">
            <ProgressChart entries={entries} metric="weight" />
          </CardContent>
        </Card>
      )}

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          History · {entries.length} {entries.length === 1 ? 'set' : 'sets'}
        </p>
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                  {entry.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {entry.weight !== null && (
                    <span className="font-semibold">{entry.weight}</span>
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
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No data found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
