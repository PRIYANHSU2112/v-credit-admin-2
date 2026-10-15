import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { APP_CONFIG } from '@/config/app.config'
import { storage } from '@/lib/storage'

export type ThemeMode = 'dark' | 'light' | 'system'
export type ThemeAccent = 'emerald' | 'sapphire' | 'violet' | 'teal'

export interface ThemeAccentOption {
  id: ThemeAccent
  name: string
  description: string
  primaryHex: string
  accentHex: string
  previewClass: string
}

export const THEME_ACCENT_OPTIONS: ThemeAccentOption[] = [
  {
    id: 'emerald',
    name: 'Emerald V-Credit',
    description: 'Official brand palette extracted from the V-Credit emblem',
    primaryHex: '#059669',
    accentHex: '#84cc16',
    previewClass: 'from-emerald-600 to-lime-500',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Blue',
    description: 'Crisp corporate financial technology aesthetic',
    primaryHex: '#2563eb',
    accentHex: '#06b6d4',
    previewClass: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    description: 'Modern executive console with vibrant purple tones',
    primaryHex: '#7c3aed',
    accentHex: '#a855f7',
    previewClass: 'from-purple-600 to-fuchsia-500',
  },
  {
    id: 'teal',
    name: 'Cyber Teal',
    description: 'High-contrast digital banking and security vibe',
    primaryHex: '#0d9488',
    accentHex: '#34d399',
    previewClass: 'from-teal-600 to-emerald-400',
  },
]

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  defaultAccent?: ThemeAccent
}

interface ThemeProviderState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  isDark: boolean
  accent: ThemeAccent
  setAccent: (accent: ThemeAccent) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

const STORAGE_KEY_ACCENT = 'vcredit_theme_accent'

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  defaultAccent = 'emerald',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    storage.get<ThemeMode>(APP_CONFIG.storageKeys.theme, defaultTheme)
  )

  const [accent, setAccentState] = useState<ThemeAccent>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACCENT) as ThemeAccent
    return saved === 'emerald' || saved === 'sapphire' || saved === 'violet' || saved === 'teal'
      ? saved
      : defaultAccent
  })

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolvedDark = useMemo<boolean>(() => {
    if (theme === 'system') return systemIsDark
    return theme === 'dark'
  }, [theme, systemIsDark])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedDark ? 'dark' : 'light')
    root.setAttribute('data-theme', accent)

    storage.set(APP_CONFIG.storageKeys.theme, theme)
    localStorage.setItem(STORAGE_KEY_ACCENT, accent)
  }, [theme, resolvedDark, accent])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const value = {
    theme,
    setTheme: (newTheme: ThemeMode) => setThemeState(newTheme),
    toggleTheme,
    isDark: resolvedDark,
    accent,
    setAccent: (newAccent: ThemeAccent) => setAccentState(newAccent),
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
