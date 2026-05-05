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
    contentSecurityPolicy: false, // Three.js conflict avoid
  })
)

// ============================================
// FIXED CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(',').map((url) => url.trim())
    : []),
  'http://localhost:5173',
  'http://localhost:3000',
  'https://localhost:5173',
  'https://localhost:3000',
  // Add your deployed frontend URLs here
  'https://digitalwaveitsolution.online',
  'https://www.digitalwaveitsolution.online',
].filter(Boolean)

console.log('✅ Allowed CORS Origins:', allowedOrigins)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    // For development - allow all origins
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode - allowing origin:', origin)
      return callback(null, true)
    }

    console.log('❌ CORS blocked origin:', origin)
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
}

// Apply CORS to all routes
app.use(cors(corsOptions))

// Handle preflight requests for all routes
app.options('*', cors(corsOptions))

// ============================================
// RATE LIMITING
// ============================================
// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

// Strict auth limiter (important)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 attempts
  message: {
    success: false,
    message: 'Too many login attempts, try after 15 minutes',
  },
})

app.use('/api/', apiLimiter)
app.use('/api/auth', authLimiter)

// Body parsing
app.use(express.json({ limit: process.env.JSON_LIMIT || '10mb' }))
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_LIMIT || '10mb' }))

// Logging & compression
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

app.use(compression())

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Digital Wave IT Solutions API is running',
    health: '/api/health',
    cors: 'enabled',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
  })
})

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/college-project', collegeProjectRoutes)
app.use('/api/certificate', certificateRoutes)
app.use('/api/settings', settingsRoutes)

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err)

  if (err.message && err.message.includes('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: err.message,
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin || 'unknown',
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

// ============================================
// START SERVER
// ============================================
connectDB()
  .then(async (db) => {
    app.locals.db = db

    if (db.type === 'supabase' && db.connection) {
      await seedAdmin(db.connection)
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`)
    })
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err)
    process.exit(1)
  })

export default app