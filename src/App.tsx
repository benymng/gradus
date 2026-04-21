import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BottomNav } from '@/components/BottomNav'
import { getCredentials } from '@/lib/credentials'

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const SearchPage = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })))
const ExercisePage = lazy(() => import('@/pages/ExercisePage').then((m) => ({ default: m.ExercisePage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

const safeTop: React.CSSProperties = { paddingTop: 'env(safe-area-inset-top)' }

export default function App() {
  const [hasCredentials, setHasCredentials] = useState(() => !!getCredentials())

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-svh bg-background" style={safeTop}>
          {hasCredentials ? (
            <>
              <main className="flex-1 overflow-y-auto pb-20">
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/exercise/:name" element={<ExercisePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Suspense>
              </main>
              <BottomNav />
            </>
          ) : (
            <main className="flex-1 overflow-y-auto">
              <Suspense fallback={null}>
                <SettingsPage onSetup={() => setHasCredentials(true)} />
              </Suspense>
            </main>
          )}
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
