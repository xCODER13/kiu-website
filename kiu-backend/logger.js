// ── STRUKTURAVIY LOGGING ──
// Oldin console.log/warn/error tarqoq holda ishlatilgan edi — buni JSON formatdagi,
// log-darajali (info/warn/error) logger bilan almashtiramiz. Render kabi platformalarda
// bu loglarni qidirish/filtrlashni osonlashtiradi.
//
// Development'da (local) o'qish uchun qulay rangli format ishlatiladi (pino-pretty
// o'rnatilgan bo'lsa); productionda esa toza JSON chiqadi (log yig'uvchilar uchun qulay).
const pino = require('pino')
const { REDACT_PATHS, CENSOR } = require('./logRedact')

const isProd = process.env.NODE_ENV === 'production'

// pino-pretty faqat devDependencies'da — agar o'rnatilmagan bo'lsa (masalan
// production build'da `npm ci --omit=dev`), oddiy JSON formatga qaytamiz.
let prettyAvailable = false
if (!isProd) {
  try { require.resolve('pino-pretty'); prettyAvailable = true } catch { /* yo'q — JSON bilan davom etamiz */ }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Token/cookie va xatolardagi foydalanuvchi qiymatlari (telefon, ism) log fayllarga
  // tushmasligi kerak — ro'yxat logRedact.js da.
  redact: { paths: REDACT_PATHS, censor: CENSOR },
  transport: prettyAvailable
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
    : undefined,
})

module.exports = logger