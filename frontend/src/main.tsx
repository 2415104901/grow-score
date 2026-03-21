import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 分钟内不重复请求
      retry: 1,
    },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('找不到 #root 元素')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/grow-score">
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
