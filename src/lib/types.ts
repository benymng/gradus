export interface WorkoutEntry {
  id: string
  name: string
  date: string | null
  weight: number | null
  reps: number | null
  unit: string | null
  volume: number | null
  notes: string | null
}

export interface ExerciseSummary {
  name: string
  lastDate: string | null
  lastWeight: number | null
  lastReps: number | null
  unit: string | null
  totalSets: number
}
