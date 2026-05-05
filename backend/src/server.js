import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'


// Route imports
import authRoutes from './routes/auth.js'
import studentRoutes from './routes/student.js'
import paymentRoutes from './routes/payment.js'
import contactRoutes from './routes/contact.js'
import adminRoutes from './routes/admin.js'
import collegeProjectRoutes from './routes/collegeProject.js'
import certificateRoutes from './routes/certificate.js'
import settingsRoutes from './routes/settings.js'
import { seedAdmin } from './utils/seedAdmin.js'
// Config
import { connectDB } from './config/database.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Trust proxy for Render/Vercel/Cloudflare reverse proxy
app.set('trust proxy', 1)

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
)

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(',').map((url) => url.trim())
    : []),
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean)

console.log('✅ Allowed CORS Origins:', allowedOrigins)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    console.log('❌ CORS blocked origin:', origin)
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
})

app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: process.env.JSON_LIMIT || '10mb' }))
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_LIMIT || '10mb' }))

// Logging & compression
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

app.use(compression())

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Digital Wave IT Solutions API is running',
    health: '/api/health',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/college-project', collegeProjectRoutes)
app.use('/api/certificate', certificateRoutes)
app.use('/api/settings', settingsRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err)

  if (err.message && err.message.includes('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: err.message,
    })
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong!'
        : err.message,
  })
})

// Start server
connectDB()
  .then(async (db) => {
    app.locals.db = db

    if (db.type === 'supabase' && db.connection) {
      await seedAdmin(db.connection)
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err)
    process.exit(1)
  })