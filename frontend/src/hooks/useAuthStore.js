import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAdmin: false,
      isSubAdmin: false,
      permissions: [],

      setUser: (userData) => set({
        user: userData,
        isAdmin: userData?.role === 'admin',
        isSubAdmin: userData?.role === 'subadmin',
        permissions: userData?.permissions || [],
      }),

      setToken: (token) => set({ token }),

      logout: () => set({
        user: null,
        token: null,
        isAdmin: false,
        isSubAdmin: false,
        permissions: [],
      }),

      hasPermission: (permission) => {
        const state = get()
        if (state.isAdmin) return true
        return state.permissions.includes(permission)
      },
    }),
    {
      name: 'digitalwave-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAdmin: state.isAdmin, isSubAdmin: state.isSubAdmin, permissions: state.permissions }),
    }
  )
)
