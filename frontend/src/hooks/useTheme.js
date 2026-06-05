import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTheme = create(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme
        set({ theme })
      },
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.dataset.theme = nextTheme
          return { theme: nextTheme }
        }),
      hydrateTheme: () =>
        set((state) => {
          document.documentElement.dataset.theme = state.theme || 'dark'
          return state
        }),
    }),
    {
      name: 'digitalwave-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
