import { useEffect } from 'react'
import { useSiteStore } from '../store/useSiteStore'

export default function useSiteSettings() {
    const { settings, loading, fetchSettings } = useSiteStore()

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    return { settings, loading, refreshSettings: () => fetchSettings(true) }
}