import React from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from '../store/store'
import { ThemeProvider } from './ThemeProvider'

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="system"
          toastOptions={{
            duration: 3500,
            className: 'font-sans text-sm rounded-xl border shadow-lg',
          }}
        />
      </ThemeProvider>
    </Provider>
  )
}
