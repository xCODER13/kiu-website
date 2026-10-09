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

// ── LOGIN: ADMIN LOGIN BO'YICHA CHEGARA — 30 ta muvaffaqiyatsiz urinish / 15 daqiqa, BARCHA IP'lar bo'yicha (3.6) ──
// `loginLimiter` faqat IP bo'yicha: botnet har IP'dan 5 tadan sinab, admin parolini kam-kam bo'lsa ham tez taxmin qila oladi.
// Bu chegara admin hisobining o'ziga umumiy shift qo'yadi: IP'lar soni qancha bo'lmasin, 15 daqiqada ko'pi bilan 30 ta taxmin.
//
// Qarorlar va xavflar:
//  - Faqat HAQIQIY admin logini kiritilgan so'rovlar sanaladi (`skip`). Boshqa kiritilgan matnlar bo'yicha hisoblagich yaratilmaydi:
//    xotira tasodifiy login'lar bilan to'lmaydi va kiritilgan matn (parol o'rniga yozib yuborilgan bo'lishi mumkin) hech qayerda saqlanmaydi.
//  - Kalit doimiy (admin bitta) — kiritilgan login katta-kichik harfi, probel va hokazolar bilan aylanib o'tib bo'lmaydi
//    (login `===` bilan solishtiriladi, mos kelmaganlar umuman sanalmaydi).
//  - Tartib: avval `loginLimiter` (IP). IP bo'yicha bloklangan so'rov bu hisoblagichni oshirmaydi.
//  - Muvaffaqiyatli login sanalmaydi (`skipSuccessfulRequests`).
//  - Javob `loginLimiter` bilan AYNAN bir xil matn va sarlavhasiz (`standardHeaders: false`): aks holda javob farqi
//    «bu login to'g'ri» degan ma'lumotni oshkor qilardi (enumeration). Qolgan farq — 30 ta urinishdan keyingina seziladi.
//  - TRADE-OFF (DoS): hujumchi ~6 ta IP'dan (har biri 5 tadan) admin loginini 15 daqiqaga qulflab turishi mumkin.
//    Tizimga ALLAQACHON kirgan admin ta'sirlanmaydi (JWT), lekin yangi kirish bloklanadi. Bunday holat logda `[SECURITY]` bilan ko'rinadi.
//    Doimiy yechim — bot tekshiruvi (Turnstile, 7.1).
const LOGIN_USERNAME_KEY = 'admin-login'
const loginUsernameLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  standardHeaders: false,
  legacyHeaders: false,
  keyGenerator: () => LOGIN_USERNAME_KEY,
  skip: req => {
    const u = req.body?.username
    return typeof u !== 'string' || !process.env.ADMIN_USERNAME || u !== process.env.ADMIN_USERNAME
  },
  message: {
    error: "Juda ko'p muvaffaqiyatsiz urinish. 15 daqiqadan so'ng qayta urinib ko'ring."
  },
  handler: (req, res, next, options) => {
    req.log.warn({ ip: req.ip }, '[SECURITY] Admin login bo\'yicha umumiy limit to\'ldi — turli IP\'lardan taxmin yoki qulflash urinishi')
    res.status(429).json(options.message)
  }
})
// Faqat testlar uchun: testlar orasida hisoblagichni nolga qaytaradi (server kodida chaqirilmaydi).
const resetLoginUsernameLimit = () => loginUsernameLimiter.resetKey(LOGIN_USERNAME_KEY)

// ── CHANGE-PASSWORD RATE LIMITER — 5 ta urinish / 15 daqiqa ──
// loginLimiter bilan bir xil shakl (bcrypt.compare orqali parol taqqoslaydigan
// endpoint, xuddi login kabi qo'pol kuch hujumiga ochiq), lekin ALOHIDA
// hisoblagich — login va change-password bitta umumiy byudjetni bo'lishmaydi.
// Aks holda: (a) kimdir login'ni ko'p marta noto'g'ri sinasa, admin o'zining
// parolini almashtira olmay qolishi mumkin edi, (b) aksincha.
const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Juda ko'p muvaffaqiyatsiz urinish. 15 daqiqadan so'ng qayta urinib ko'ring."
  },
  handler: (req, res, next, options) => {
    req.log.warn({ ip: req.ip }, '[RATE LIMIT] Parol almashtirish bloklandi')
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

module.exports = { loginLimiter, loginUsernameLimiter, resetLoginUsernameLimit, changePasswordLimiter, formLimiter, viewLimiter, mutationLimiter }