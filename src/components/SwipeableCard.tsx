import { useState } from 'react'
import { useSwipeable, type SwipeEventData } from 'react-swipeable'
import { Trash2 } from 'lucide-react'

interface SwipeableCardProps {
  children: React.ReactNode
  onDelete: () => void
}

export function SwipeableCard({ children, onDelete }: SwipeableCardProps) {
  const [offset, setOffset] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const handlers = useSwipeable({
    onSwiping: (e: SwipeEventData) => {
      // Only allow swiping left (negative delta)
      if (e.deltaX < 0) {
        setOffset(Math.max(e.deltaX, -120))
      }
    },
    onSwiped: (e: SwipeEventData) => {
      if (e.dir === 'Left' && e.absX > 80) {
        setOffset(-120)
      } else {
        setOffset(0)
      }
    },
    trackMouse: true,
  })

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
      setOffset(0)
    }
  }

  function cancelDelete() {
    setOffset(0)
  }

  const deleteOpacity = Math.min(Math.abs(offset) / 80, 1)

  return (
    <div className="relative overflow-hidden rounded-xl" {...handlers}>
      {/* Delete background */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end px-5"
        style={{ width: '120px' }}
      >
        <button
          onClick={offset < -40 ? handleDelete : cancelDelete}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
          style={{
            background: isDeleting
              ? 'oklch(0.50 0.20 25)'
              : deleteOpacity > 0.5
                ? 'oklch(0.60 0.22 25)'
                : 'oklch(0.70 0.18 25)',
            color: 'oklch(0.98 0 0)',
            opacity: deleteOpacity > 0.3 ? deleteOpacity : 0,
            transition: 'opacity 0.15s, background 0.15s',
          }}
          aria-label="Delete entry"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {/* Swipeable content */}
      <div
        className="relative bg-transparent transition-transform duration-100"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
