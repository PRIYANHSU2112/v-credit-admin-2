import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from '@/app/providers/AppProvider'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find root element.')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
)
