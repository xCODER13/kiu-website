require('dotenv').config()

const mongoose = require('mongoose')

const logger = require('./logger')
const { validateEnv } = require('./config/env')
const { connectDB } = require('./config/db')
const app = require('./app')

const PORT = process.env.PORT || 5000
const SELF_URL = process.env.BACKEND_URL
const KEEP_ALIVE_INTERVAL_MS = 14 * 60 * 1000
const KEEP_ALIVE_TIMEOUT_MS = 10 * 1000

let server
let keepAliveTimer

// ── KEEP-ALIVE — Render cold-start'dan saqlanish uchun ──
// AbortController bilan timeout: Render sovuq holatda 20-50s javob berishi mumkin,
// timeout bo'lmasa fetch osilib qolib keyingi interval bilan ustma-ust tushadi.
function pingSelf() {
  if (!SELF_URL) return
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), KEEP_ALIVE_TIMEOUT_MS)

  fetch(`${SELF_URL}/health`, { signal: controller.signal })
    .then(() => logger.info('Keep-alive OK'))
    .catch(err => logger.warn({ err: err.message }, 'Keep-alive failed'))
    .finally(() => clearTimeout(timeout))
}

// ── GRACEFUL SHUTDOWN — HTTP server va Mongo ulanishini ketma-ket, toza yopadi ──
async function shutdown(signal) {
  logger.info(`${signal} qabul qilindi — server yopilmoqda...`)

  if (keepAliveTimer) clearInterval(keepAliveTimer)

  try {
    if (server) {
      // server.close() asinxron — hali tugallanmagan so'rovlar tugashini kutamiz
      await new Promise((resolve, reject) => {
        server.close(err => (err ? reject(err) : resolve()))
      })
      logger.info('HTTP server yopildi.')
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
      logger.info('Mongo ulanishi yopildi.')
    }

    logger.info('Chiqish.')
    process.exit(0)
  } catch (err) {
    logger.error({ err }, 'Shutdown paytida xato yuz berdi — majburan chiqilmoqda.')
    process.exit(1)
  }
}

// ── KUTILMAGAN XATOLAR — process jimgina o'lib qolmasligi yoki noto'g'ri holatda
// davom etmasligi uchun log qilib, toza chiqamiz ──
process.on('uncaughtException', err => {
  logger.fatal({ err }, 'uncaughtException — server to\'xtatilmoqda.')
  process.exit(1)
})

process.on('unhandledRejection', reason => {
  logger.fatal({ err: reason }, 'unhandledRejection — server to\'xtatilmoqda.')
  process.exit(1)
})

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// ── STARTUP ──
// DB ulanguncha server so'rov qabul qilmasin: aks holda route'lar Mongo'siz
// hang bo'lishi yoki noaniq xato qaytarishi mumkin.
async function start() {
  validateEnv(logger)

  try {
    await connectDB()
    logger.info('MongoDB ulandi.')
  } catch (err) {
    logger.fatal({ err }, 'MongoDB ulanish xatosi — server ishga tushmaydi.')
    process.exit(1)
  }

  server = app.listen(PORT, () => {
    logger.info(`Server ishlamoqda: http://localhost:${PORT}`)
  })

  if (SELF_URL) {
    keepAliveTimer = setInterval(pingSelf, KEEP_ALIVE_INTERVAL_MS)
  }
}

start()