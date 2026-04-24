import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Send, Zap, AlertCircle } from 'lucide-react'
import { fetchWorkouts } from '@/lib/api'

const WEBHOOK_URL = 'https://n8n.benjaminng.ca/webhook/workout-log'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function QuickAddPage() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => fetchWorkouts(),
  })

  // Derive unique exercise names sorted alphabetically
  const exerciseNames = useMemo(() => {
    const names = new Set(workouts.map((w) => w.name).filter(Boolean))
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [workouts])

  // Filter suggestions based on the first "word group" typed (before numbers/units)
  const suggestions = useMemo(() => {
    if (!text.trim()) return exerciseNames.slice(0, 8)
    const query = text.toLowerCase()
    return exerciseNames
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 6)
  }, [text, exerciseNames])

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus()
  }, [])

  async function handleSubmit() {
    if (!text.trim() || status === 'loading') return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      if (!res.ok) throw new Error(`Server responded ${res.status}`)
      setStatus('success')
      setText('')
      setShowSuggestions(false)
      // Invalidate cache so data refreshes on next load
      await queryClient.invalidateQueries({ queryKey: ['workouts'] })
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function applySuggestion(name: string) {
    setText(name + ' ')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  return (
    <div className="flex flex-col min-h-full px-4 pt-4 pb-6 max-w-lg mx-auto w-full page-enter">
      {/* Header */}
      <div className="flex items-start justify-between pt-1 mb-6">
        <div>
          <h1
            className="text-4xl font-bold tracking-tight leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: '-0.01em' }}
          >
            Quick Add
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Log a workout in plain text</p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
          style={{ background: 'oklch(0.64 0.26 291 / 0.15)', border: '1px solid oklch(0.64 0.26 291 / 0.25)' }}
        >
          <Zap className="h-4.5 w-4.5" style={{ color: 'oklch(0.80 0.18 291)' }} />
        </div>
      </div>

      {/* Input area */}
      <div className="relative flex flex-col gap-3">
        <div
          className="relative rounded-2xl overflow-hidden transition-all"
          style={{
            background: 'oklch(0.11 0.011 278)',
            border: `1.5px solid ${isError ? 'oklch(0.65 0.22 25 / 0.6)' : isSuccess ? 'oklch(0.72 0.18 155 / 0.6)' : 'oklch(1 0 0 / 10%)'}`,
            boxShadow: isError
              ? '0 0 0 3px oklch(0.65 0.22 25 / 0.08)'
              : isSuccess
              ? '0 0 0 3px oklch(0.72 0.18 155 / 0.08)'
              : 'none',
          }}
        >
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setShowSuggestions(true)
              if (status !== 'idle') setStatus('idle')
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={'bench press 135 lbs 8 reps'}
            disabled={isLoading || isSuccess}
            rows={3}
            className="w-full resize-none bg-transparent px-4 pt-4 pb-3 text-base outline-none placeholder:text-muted-foreground/50 leading-relaxed"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          />
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <p className="text-xs text-muted-foreground/60">
              Press <kbd
                className="text-xs px-1 py-0.5 rounded"
                style={{ background: 'oklch(1 0 0 / 8%)', fontFamily: 'monospace' }}
              >↵</kbd> to log
            </p>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading || isSuccess}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.96] disabled:opacity-40"
              style={{
                background: isSuccess ? 'oklch(0.72 0.18 155 / 0.2)' : 'oklch(0.64 0.26 291)',
                color: isSuccess ? 'oklch(0.72 0.18 155)' : 'oklch(0.07 0.012 278)',
              }}
            >
              {isLoading ? (
                <div
                  className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'oklch(0.07 0.012 278)', borderTopColor: 'transparent' }}
                />
              ) : isSuccess ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>{isLoading ? 'Logging…' : isSuccess ? 'Logged!' : 'Log'}</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {isError && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
            style={{
              background: 'oklch(0.65 0.22 25 / 0.1)',
              border: '1px solid oklch(0.65 0.22 25 / 0.25)',
              color: 'oklch(0.75 0.18 25)',
            }}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg || 'Failed to log workout. Try again.'}</span>
          </div>
        )}

        {/* Success message */}
        {isSuccess && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
            style={{
              background: 'oklch(0.72 0.18 155 / 0.1)',
              border: '1px solid oklch(0.72 0.18 155 / 0.25)',
              color: 'oklch(0.72 0.18 155)',
            }}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Workout logged successfully!</span>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && !isSuccess && (
        <div className="mt-5">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2.5"
            style={{ color: 'oklch(0.52 0.014 278)', letterSpacing: '0.1em' }}
          >
            {text.trim() ? 'Matching exercises' : 'Recent exercises'}
          </p>
          <div className="flex flex-col gap-1.5">
            {suggestions.map((name) => (
              <button
                key={name}
                onClick={() => applySuggestion(name)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.98] active:opacity-70"
                style={{
                  background: 'oklch(0.11 0.011 278)',
                  border: '1px solid oklch(1 0 0 / 7%)',
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: 'oklch(0.64 0.26 291 / 0.6)' }}
                />
                <span className="text-sm font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Format hint */}
      <div className="mt-6">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2.5"
          style={{ color: 'oklch(0.52 0.014 278)', letterSpacing: '0.1em' }}
        >
          Format examples
        </p>
        <div className="flex flex-col gap-2">
          {[
            'bench press 135 lbs 8 reps',
            'squat 225 lbs 5 reps',
            'pull ups 12 reps',
            'deadlift 315 lbs 3 reps',
          ].map((example) => (
            <button
              key={example}
              onClick={() => {
                setText(example)
                setShowSuggestions(false)
                inputRef.current?.focus()
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all active:opacity-70"
              style={{
                background: 'oklch(0.09 0.010 278)',
                border: '1px solid oklch(1 0 0 / 5%)',
              }}
            >
              <span
                className="text-xs font-mono tracking-tight"
                style={{ color: 'oklch(0.52 0.014 278)' }}
              >
                {example}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
