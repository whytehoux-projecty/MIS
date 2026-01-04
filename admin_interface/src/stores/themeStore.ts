import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  initializeTheme: () => void
  applyTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme) => {
        set({ theme })
        get().applyTheme(theme)
      },

      initializeTheme: () => {
        const theme = get().theme
        get().applyTheme(theme)
      },

      applyTheme: (theme: Theme) => {
        const root = document.documentElement
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          root.classList.toggle('dark', systemTheme === 'dark')
        } else {
          root.classList.toggle('dark', theme === 'dark')
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
) 
