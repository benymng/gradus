import type { WorkoutEntry } from './types'

export async function fetchWorkouts({ bust }: { bust?: boolean } = {}): Promise<WorkoutEntry[]> {
  const url = bust ? `/api/workouts?_t=${Date.now()}` : '/api/workouts'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch workouts')
  return res.json() as Promise<WorkoutEntry[]>
}

export async function deleteWorkout(id: string): Promise<void> {
  const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete workout')
}
