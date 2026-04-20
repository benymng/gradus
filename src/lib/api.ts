import type { WorkoutEntry } from './types'

export async function fetchWorkouts(): Promise<WorkoutEntry[]> {
  const res = await fetch('/api/workouts')
  if (!res.ok) throw new Error('Failed to fetch workouts')
  return res.json() as Promise<WorkoutEntry[]>
}
