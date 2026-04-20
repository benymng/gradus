import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { WorkoutEntry, ExerciseSummary } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No date'
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

export function getExerciseSummaries(entries: WorkoutEntry[]): ExerciseSummary[] {
  const map = new Map<string, WorkoutEntry[]>()

  for (const entry of entries) {
    if (!entry.name) continue
    const key = entry.name.toLowerCase()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(entry)
  }

  return Array.from(map.values())
    .map((group) => {
      const sorted = [...group].sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      const last = sorted[0]
      return {
        name: last.name,
        lastDate: last.date,
        lastWeight: last.weight,
        lastReps: last.reps,
        unit: last.unit,
        totalSets: group.length,
      }
    })
    .sort((a, b) => {
      if (!a.lastDate) return 1
      if (!b.lastDate) return -1
      return new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    })
}
