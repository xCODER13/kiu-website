const rateLimit = require('express-rate-limit')

// ── LOGIN RATE LIMITER — 5 ta urinish / 15 daqiqa ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Juda ko'p muvaffaqiyatsiz urinish. 15 daqiqadan so'ng qayta urinib ko'ring."
  },
  handler: (req, res, next, options) => {
    req.log.warn({ ip: req.ip }, '[RATE LIMIT] Login bloklandi')
    res.status(429).json(options.message)
  }
})

// ── FORM RATE LIMITER — arizalar / sorting-hat uchun, spam'dan himoya ──
// 10 ta so'rov / 15 daqiqa / IP — oddiy foydalanuvchi uchun yetarli, spam-bot uchun cheklovchi
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Juda ko'p so'rov yuborildi. Birozdan so'ng qayta urinib ko'ring."
  },
  handler: (req, res, next, options) => {
    req.log.warn({ ip: req.ip, url: req.originalUrl }, '[RATE LIMIT] Bloklandi')
    res.status(429).json(options.message)
  }
})

// ── VIEW/READ RATE LIMITER — ko'rishlar soni, Telegram postlari va public GET route'lar uchun ──
// Bular ko'p marta chaqirilishi mumkin bo'lgan yengil endpointlar, shuning uchun limit yuqoriroq
const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Juda ko'p so'rov. Birozdan so'ng qayta urinib ko'ring."
  }
})

module.exports = { loginLimiter, formLimiter, viewLimiter }