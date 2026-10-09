// Log'dan yashiriladigan maydonlar (logger.js va tests/log-redact.test.js ishlatadi).
//
// 1) Authorization (JWT) va cookie headerlari — log storage orqali token o'g'irlanmasin.
// 2) Mongoose xatolaridagi foydalanuvchi qiymatlari (4.3): ValidationError `errors.<maydon>.value`
//    ichida kiritilgan ism/telefonni to'liq saqlaydi, CastError esa `value` da. `fail()` va
//    boshqa joylar `{ err }` ni to'liq log qilgani uchun, bu yo'l bilan PII log'ga tushardi.
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'err.value',
  'err.keyValue',
  'err.properties.value',
  'err.errors.*.value',
  'err.errors.*.properties.value',
]

module.exports = { REDACT_PATHS, CENSOR: '[YASHIRILGAN]' }
