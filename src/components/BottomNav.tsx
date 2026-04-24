import { Home, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/search', label: 'Search', Icon: Search },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-background/90 backdrop-blur-xl z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Top border gradient for depth */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent pointer-events-none" />
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ path, label, Icon }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-all duration-200',
                'select-none touch-manipulation',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground active:scale-95',
              )}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator pill */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-8 rounded-lg transition-all duration-200',
                  active ? 'bg-primary/10' : 'bg-transparent',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all duration-200',
                    active ? 'stroke-[2.5px]' : 'stroke-[1.75px]',
                  )}
                />
              </div>
              <span
                className={cn(
                  'transition-all duration-200',
                  active ? 'font-semibold text-[0.7rem]' : 'font-medium text-[0.65rem]',
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
