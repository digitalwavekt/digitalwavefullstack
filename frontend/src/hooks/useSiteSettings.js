import { useEffect, useState } from 'react'

export default function useSiteSettings() {
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/settings`
                )

                const data = await res.json()

                if (data.success) {
                    setSettings(data.data)
                }
            } catch (error) {
                console.error('Settings fetch failed:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    return {
        settings,
        loading,
    }
}