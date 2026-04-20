import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BottomNav } from '@/components/BottomNav'
import { HomePage } from '@/pages/HomePage'
import { SearchPage } from '@/pages/SearchPage'
import { ExercisePage } from '@/pages/ExercisePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-svh bg-background">
          <main className="flex-1 overflow-y-auto pb-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/exercise/:name" element={<ExercisePage />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
