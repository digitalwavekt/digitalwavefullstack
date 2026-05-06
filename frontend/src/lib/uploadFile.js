import { apiFetch } from './api'

const API_URL = import.meta.env.VITE_API_URL

export const uploadFile = async ({
    file,
    bucket = 'uploads',
    folder = 'general',
}) => {
    const signed = await apiFetch(
        '/api/upload/signed-url',
        {
            method: 'POST',
            body: JSON.stringify({
                fileName: file.name,
                bucket,
                folder,
            }),
        }
    )

    const {
        signedUrl,
        token,
        path,
        publicUrl,
    } = signed.data

    const uploadRes = await fetch(
        `${signedUrl}&token=${token}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        }
    )

    if (!uploadRes.ok) {
        throw new Error('Upload failed')
    }

    return {
        path,
        publicUrl,
    }
}