import mongoose from 'mongoose'
import { createClient } from '@supabase/supabase-js'
import pkg from 'pg'
const { Pool } = pkg

export const connectDB = async () => {
  const dbType = process.env.DB_TYPE || 'mongodb'

  try {
    if (dbType === 'mongodb' && process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('✅ MongoDB Connected')
      return { type: 'mongodb', connection: mongoose.connection }
    } 
    else if (dbType === 'postgres' && process.env.POSTGRES_URL) {
      const pool = new Pool({ connectionString: process.env.POSTGRES_URL })
      await pool.query('SELECT NOW()')
      console.log('✅ PostgreSQL Connected')
      return { type: 'postgres', connection: pool }
    }
    else if (dbType === 'supabase' && process.env.SUPABASE_URL) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
      console.log('✅ Supabase Connected')
      return { type: 'supabase', connection: supabase }
    }
    else {
      console.log('⚠️ No database configured, using in-memory fallback')
      return { type: 'memory', connection: null }
    }
  } catch (error) {
    console.error('❌ Database connection error:', error)
    throw error
  }
}
