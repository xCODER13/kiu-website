// .env FAQAT `node server.js` bilan to'g'ridan-to'g'ri ishga tushirilganda yuklanadi
// (Render / `npm start` / nodemon). Bu qator quyidagi require'lardan OLDIN turishi shart:
// config/cors.js kabi modullar FRONTEND_URL'ni yuklanish paytida o'qiydi.
// Testlarda fayl `require` qilinadi, shuning uchun lokal .env (production qiymatlari
// bo'lishi mumkin) process.env'ga tushib qolmaydi.
if (require.main === module) require('dotenv').config()

const mongoose = require('mongoose')

const logger = require('./logger')
const { validateEnv } = require('./config/env')
const { connectDB } = require('./config/db')
const app = require('./app')

const KEEP_ALIVE_INTERVAL_MS = 14 * 60 * 1000
const KEEP_ALIVE_TIMEOUT_MS = 10 * 1000

let server
let keepAliveTimer

// ── KEEP-ALIVE — Render cold-start'dan saqlanish uchun ──
// AbortController bilan timeout: Render sovuq holatda 20-50s javob berishi mumkin,
// timeout bo'lmasa fetch osilib qolib keyingi interval bilan ustma-ust tushadi.
function pingSelf() {
  const selfUrl = process.env.BACKEND_URL
  if (!selfUrl) return
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), KEEP_ALIVE_TIMEOUT_MS)

  fetch(`${selfUrl}/health`, { signal: controller.signal })
    .then(() => logger.info('Keep-alive OK'))
    .catch(err => logger.warn({ err: err.message }, 'Keep-alive failed'))
    .finally(() => clearTimeout(timeout))
}

// ── GRACEFUL SHUTDOWN — HTTP server va Mongo ulanishini ketma-ket, toza yopadi ──
// `exit` in'ektsiya qilinadi (standart: process.exit) — testda haqiqiy process'ni
// o'ldirmaslik uchun.
async function shutdown(signal, exit = process.exit) {
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
    exit(0)
  } catch (err) {
    logger.error({ err }, 'Shutdown paytida xato yuz berdi — majburan chiqilmoqda.')
    exit(1)
  }
}

// ── KUTILMAGAN XATOLAR VA SIGNALLAR — process jimgina o'lib qolmasligi yoki noto'g'ri
// holatda davom etmasligi uchun log qilib, toza chiqamiz ──
function registerProcessHandlers(exit = process.exit) {
  process.on('uncaughtException', err => {
    logger.fatal({ err }, 'uncaughtException — server to\'xtatilmoqda.')
    exit(1)
  })

  process.on('unhandledRejection', reason => {
    logger.fatal({ err: reason }, 'unhandledRejection — server to\'xtatilmoqda.')
    exit(1)
  })

  process.on('SIGTERM', () => shutdown('SIGTERM', exit))
  process.on('SIGINT', () => shutdown('SIGINT', exit))
}

// ── STARTUP ──
// DB ulanguncha server so'rov qabul qilmasin: aks holda route'lar Mongo'siz
// hang bo'lishi yoki noaniq xato qaytarishi mumkin.
async function start(exit = process.exit) {
  validateEnv(logger, exit)

  try {
    await connectDB()
    logger.info('MongoDB ulandi.')
  } catch (err) {
    logger.fatal({ err }, 'MongoDB ulanish xatosi — server ishga tushmaydi.')
    exit(1)
    return // haqiqiy process.exit hech qachon qaytmaydi; in'ektsiya qilingan exit'da davom etib ketmasin
  }

  const port = process.env.PORT || 5000
  server = app.listen(port, () => {
    logger.info(`Server ishlamoqda: http://localhost:${port}`)
  })

  if (process.env.BACKEND_URL) {
    keepAliveTimer = setInterval(pingSelf, KEEP_ALIVE_INTERVAL_MS)
  }

  return server
}

if (require.main === module) {
  registerProcessHandlers()
  start()
}

module.exports = { start, shutdown, pingSelf, registerProcessHandlers, KEEP_ALIVE_INTERVAL_MS, KEEP_ALIVE_TIMEOUT_MS }