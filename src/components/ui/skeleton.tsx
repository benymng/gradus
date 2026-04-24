import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />
}

export function SkeletonCard({ className }: SkeletonProps) {
  return <div className={cn('skeleton-card', className)} />
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="skeleton-line h-4 w-4 rounded mb-2" />
      <div className="skeleton-line h-7 w-8 rounded mb-1" />
      <div className="skeleton-line h-3 w-16 rounded" />
    </div>
  )
}

export function SkeletonWorkoutCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="skeleton-line h-4 w-32 rounded mb-2" />
        <div className="skeleton-line h-3 w-24 rounded" />
      </div>
      <div className="flex items-center gap-2 ml-3 shrink-0">
        <div className="skeleton-circle h-8 w-12 rounded" />
        <div className="skeleton-circle h-5 w-10 rounded-full" />
      </div>
    </div>
  )
}
