// ── EXPRESS APP ──
// Bu fayl faqat app'ni yaratadi va sozlaydi — HECH QACHON .listen() chaqirmaydi,
// MongoDB'ga ulanmaydi, env validatsiya qilmaydi. Shu tufayli testlarda (Supertest)
// haqiqiy portsiz, to'g'ridan-to'g'ri ishlatish mumkin: require('./app').
// Production ishga tushirish (.listen(), DB ulanish, va h.k.) — server.js'da.
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const pinoHttp = require('pino-http')

const logger = require('./logger')
const { corsOptions } = require('./config/cors')
const { notFound, globalErrorHandler } = require('./middleware/errorHandler')

const adminRoutes = require('./routes/admin.routes')
const newsRoutes = require('./routes/news.routes')
const eventsRoutes = require('./routes/events.routes')
const teachersRoutes = require('./routes/teachers.routes')
const applicationsRoutes = require('./routes/applications.routes')
const statsRoutes = require('./routes/stats.routes')
const miscRoutes = require('./routes/misc.routes')

const app = express()

// Render / Vercel proxy orqasida ishlaydi — real IP ni olish uchun
app.set('trust proxy', 1)

// ── HELMET — HTTP xavfsizlik headerlari ──
app.use(helmet())

// ── SO'ROV LOGGING — har bir so'rov/javobni avtomatik JSON log qiladi ──
// Test muhitida (`NODE_ENV=test`) autoLogging butunlay o'chiriladi — daraja
// pasaytirilmaydi, balki har bir so'rov/javob uchun avtomatik yoziladigan log
// umuman chiqarilmaydi. Bu Supertest chiqishini chalkashtirmaslik uchun kerak.
app.use(pinoHttp({ logger, autoLogging: process.env.NODE_ENV !== 'test' }))

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

module.exports = app