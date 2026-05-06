import { create } from 'zustand'

export const useSiteStore = create((set) => ({
    settings: null,
    loading: false,

    fetchSettings: async () => {
        try {
            set({ loading: true })

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/settings`
            )

            const data = await res.json()

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