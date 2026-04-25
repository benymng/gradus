import { Home, Search, PlusCircle, BarChart2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/analytics', label: 'Stats', Icon: BarChart2 },
  { path: '/search', label: 'Search', Icon: Search },
  { path: '/add', label: 'Add', Icon: PlusCircle },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="shrink-0 border-t border-border z-50"
      style={{
        background: 'oklch(0.09 0.011 278 / 0.96)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ path, label, Icon }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors select-none',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
              style={{ minHeight: '56px', paddingTop: '10px', paddingBottom: '10px' }}
            >
              <div className="relative flex items-center justify-center">
                {active && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'oklch(0.64 0.26 291 / 0.15)',
                      width: '40px',
                      height: '32px',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
                <Icon className="relative h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
              </div>
              <span className={cn('tracking-wide', active ? 'font-semibold' : '')}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
