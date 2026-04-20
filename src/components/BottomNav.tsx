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
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm z-50 pb-safe">
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ path, label, Icon }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
