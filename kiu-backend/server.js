require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const pinoHttp = require('pino-http')
const mongoose = require('mongoose')

const logger = require('./logger')
const { validateEnv } = require('./config/env')
const { connectDB } = require('./config/db')
const { corsOptions } = require('./config/cors')
const { notFound, globalErrorHandler } = require('./middleware/errorHandler')

const adminRoutes = require('./routes/admin.routes')
const newsRoutes = require('./routes/news.routes')
const eventsRoutes = require('./routes/events.routes')
const teachersRoutes = require('./routes/teachers.routes')
const applicationsRoutes = require('./routes/applications.routes')
const statsRoutes = require('./routes/stats.routes')
const miscRoutes = require('./routes/misc.routes')

// ── STARTUP VALIDATSIYA — kritik env yo'q bo'lsa, server ishga tushmaydi ──
validateEnv(logger)

const app = express()

// Render / Vercel proxy orqasida ishlaydi — real IP ni olish uchun
app.set('trust proxy', 1)

// ── HELMET — HTTP xavfsizlik headerlari ──
app.use(helmet())

// ── SO'ROV LOGGING — har bir so'rov/javobni avtomatik JSON log qiladi ──
app.use(pinoHttp({ logger }))

app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── ROUTE'LAR ──
app.use('/api/admin', adminRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/teachers', teachersRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api', miscRoutes) // /api/sorting-hat-lead, /api/telegram/posts

// ── HEALTH CHECK — keep-alive va monitoring uchun, biznes-logikadan mustaqil ──
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

// ── 404 va GLOBAL ERROR HANDLER — har doim eng oxirida bo'lishi shart ──
app.use(notFound)
app.use(globalErrorHandler)

// ── MONGODB ──
connectDB().catch(err => logger.error({ err }, 'MongoDB ulanish xatosi'))

// ── SERVER ──
const PORT = process.env.PORT || 5000
const SELF_URL = process.env.BACKEND_URL
if (SELF_URL) {
  setInterval(async () => {
    try { await fetch(`${SELF_URL}/health`); logger.info('Keep-alive OK') }
    catch { logger.warn('Keep-alive failed') }
  }, 14 * 60 * 1000)
}

const server = app.listen(PORT, () => logger.info(`Server ishlamoqda: http://localhost:${PORT}`))

// ── GRACEFUL SHUTDOWN — Render qayta deploy/restart paytida ulanishlarni toza yopish ──
process.on('SIGTERM', async () => {
  logger.info('SIGTERM qabul qilindi — server yopilmoqda...')
  server.close()
  await mongoose.connection.close()
  logger.info('Mongo ulanishi yopildi. Chiqish.')
  process.exit(0)
})