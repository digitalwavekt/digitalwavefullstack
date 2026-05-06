import { useEffect } from 'react'
import { useSiteStore } from '../store/useSiteStore'

export default function useSiteSettings() {
    const { settings, loading, fetchSettings } = useSiteStore()

    useEffect(() => {
        if (!settings) {
            fetchSettings()
        }
    }, [])

    return {
        settings,
        loading,
    }
}