import { create } from 'zustand'
import { apiFetch } from '../lib/api'

export const useSiteStore = create((set) => ({
    settings: null,
    loading: false,

    fetchSettings: async () => {
        try {
            set({ loading: true })

            const data = await apiFetch('/api/settings')

            if (data.success) {
                set({ settings: data.data })
            }
        } catch (error) {
            console.error(error)
        } finally {
            set({ loading: false })
        }
    },
}))
