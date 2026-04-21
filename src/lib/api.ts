import type { WorkoutEntry } from './types'
import { getCredentials } from './credentials'

export async function fetchWorkouts(): Promise<WorkoutEntry[]> {
  const creds = getCredentials()
  const headers: Record<string, string> = {}
  if (creds) {
    headers['x-notion-token'] = creds.token
    headers['x-notion-database-id'] = creds.databaseId
  }
  const res = await fetch('/api/workouts', { headers })
  if (!res.ok) throw new Error('Failed to fetch workouts')
  return res.json() as Promise<WorkoutEntry[]>
}
