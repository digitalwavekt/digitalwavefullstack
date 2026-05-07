import jwt from 'jsonwebtoken'

export const getSupabase = (req) => {
    const db = req.app.locals.db

    if (!db || db.type !== 'supabase' || !db.connection) {
        throw new Error('Supabase database is not configured')
    }

    return db.connection
}

export const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin token required',
            })
        }

        const supabase = getSupabase(req)

        const { data: admin, error } = await supabase
            .from('admins')
            .select('id,name,email,role,permissions,status')
            .eq('id', decoded.id)
            .maybeSingle()

        if (error || !admin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required',
            })
        }

        if (admin.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Admin account is inactive',
            })
        }

        req.admin = admin
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        })
    }
}

export const requirePermission = (permission) => {
    return (req, res, next) => {
        const admin = req.admin

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin authentication required',
            })
        }

        if (admin.role === 'admin') {
            return next()
        }

        const permissions = admin.permissions || []

        if (!permissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: `Permission required: ${permission}`,
            })
        }

        next()
    }
}