import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const updateAdminCredentials = async () => {
  const newEmail = process.env.ADMIN_EMAIL
  const newPassword = process.env.ADMIN_PASSWORD
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!newEmail || !newPassword) {
    console.error('❌ ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env')
    process.exit(1)
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in .env')
    process.exit(1)
  }

  try {
    console.log('🔄 Connecting to Supabase...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10)
    console.log('🔐 Password hashed successfully')

    // Check if admin with new email already exists
    const { data: existingAdmin, error: findError } = await supabase
      .from('admins')
      .select('id,email,name')
      .eq('email', newEmail.trim().toLowerCase())
      .maybeSingle()

    if (findError) {
      console.error('❌ Error checking admin:', findError.message)
      process.exit(1)
    }

    if (existingAdmin) {
      console.log(`✅ Admin already exists with email: ${newEmail}`)
      console.log('📝 Updating password...')

      const { error: updateError } = await supabase
        .from('admins')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAdmin.id)

      if (updateError) {
        console.error('❌ Error updating password:', updateError.message)
        process.exit(1)
      }

      console.log(`✅ Admin password updated successfully for: ${newEmail}`)
    } else {
      console.log(`📝 Creating new admin with email: ${newEmail}`)

      // Delete old admin if exists (optional - only if you want to replace it)
      const { data: oldAdmin } = await supabase
        .from('admins')
        .select('id')
        .eq('role', 'admin')
        .neq('email', newEmail)
        .limit(1)
        .single()

      if (oldAdmin) {
        console.log('🗑️  Found old admin, backing up data...')
        // Keep the old admin for reference, just create new one
      }

      // Create new admin
      const { data: newAdmin, error: createError } = await supabase
        .from('admins')
        .insert({
          name: 'Super Admin',
          email: newEmail.trim().toLowerCase(),
          password_hash: passwordHash,
          role: 'admin',
          permissions: ['all'],
          status: 'active',
        })
        .select()
        .single()

      if (createError) {
        if (createError.message.includes('duplicate')) {
          console.error('⚠️  Email already exists in database')
          console.log('💡 Tip: Run update command instead')
        } else {
          console.error('❌ Error creating admin:', createError.message)
        }
        process.exit(1)
      }

      console.log(`✅ New admin created successfully!`)
      console.log(`📧 Email: ${newAdmin.email}`)
      console.log(`🆔 Admin ID: ${newAdmin.id}`)
    }

    console.log('\n✨ Admin credentials updated successfully!')
    console.log('📝 Next steps:')
    console.log(`   1. Login with email: ${newEmail}`)
    console.log(`   2. Password: (from your .env ADMIN_PASSWORD)`)
    console.log('   3. Access admin dashboard at /admin/login')

    process.exit(0)
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

updateAdminCredentials()
