import { apiFetch } from './api'

export const uploadFile = async ({
    file,
    bucket = 'uploads',
    folder = 'general',
}) => {
    if (!file) {
        throw new Error('No file selected')
    }

    const signed = await apiFetch('/api/upload/signed-url', {
        method: 'POST',
        body: JSON.stringify({
            fileName: file.name,
            bucket,
            folder,
        }),
    })

    const { signedUrl, path, publicUrl } = signed.data

    const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
    })

    if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => '')
        throw new Error(errorText || 'Upload failed')
    }

    return {
        path,
        publicUrl,
    }
}