import bcrypt from 'bcryptjs'

export const seedAdmin = async (supabase) => {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
        console.log('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD missing. Skipping admin seed.')
        return
    }

    const { data: existingAdmin, error: findError } = await supabase
        .from('admins')
        .select('id,email')
        .eq('email', email)
        .maybeSingle()

    if (findError) {
        console.error('❌ Admin lookup failed:', findError.message)
        return
    }

    if (existingAdmin) {
        console.log('✅ Admin already exists:', email)
        return
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { error: insertError } = await supabase.from('admins').insert({
        name: 'Super Admin',
        email,
        password_hash: passwordHash,
        role: 'admin',
        permissions: ['all'],
        status: 'active',
    })

    if (insertError) {
        console.error('❌ Admin seed failed:', insertError.message)
        return
    }

    console.log('✅ Admin seeded successfully:', email)
}