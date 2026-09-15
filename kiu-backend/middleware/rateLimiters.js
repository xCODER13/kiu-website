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

// ── MUTATION RATE LIMITER — auth talab qiluvchi yozish amallari uchun (POST/PUT/DELETE) ──
// News/Events/Teachers/Applications kabi admin-only mutatsiya endpointlari `auth`
// middleware bilan himoyalangan, lekin o'g'irlangan/oqib chiqqan JWT bo'lsa,
// shu token cheksiz so'rov yubora olmasligi uchun IP-based qo'shimcha chegara.
// 30/15 daqiqa — oddiy admin ishlatishga yetarli bo'sh (bir nechta postni ketma-ket
// saqlash), lekin avtomatlashtirilgan spam/abuse uchun cheklovchi.
const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Juda ko'p so'rov yuborildi. Birozdan so'ng qayta urinib ko'ring."
  },
  handler: (req, res, next, options) => {
    req.log.warn({ ip: req.ip, url: req.originalUrl }, '[RATE LIMIT] Mutatsiya endpoint bloklandi')
    res.status(429).json(options.message)
  }
})

module.exports = { loginLimiter, formLimiter, viewLimiter, mutationLimiter }