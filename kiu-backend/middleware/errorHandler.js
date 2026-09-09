// ── XATOLARNI XAVFSIZ QAYTARISH ──
// To'liq xato server logiga yoziladi, clientga esa umumiy xabar qaytariladi
// (Mongoose/ichki xato tafsilotlari sizib chiqmasligi uchun).
function fail(req, res, status, e) {
  req.log.error({ err: e }, `[ERROR] ${req.method} ${req.originalUrl}`)
  const publicMsg = status === 400
    ? "So'rovda xatolik bor. Ma'lumotlarni tekshirib qayta yuboring."
    : 'Server xatosi yuz berdi. Birozdan so\'ng qayta urinib ko\'ring.'
  res.status(status).json({ error: publicMsg })
}

// ── 404 — mos endpoint topilmasa ──
function notFound(req, res) {
  res.status(404).json({ error: "So'ralgan endpoint topilmadi" })
}

// ── GLOBAL ERROR HANDLER — oxirgi himoya chizig'i ──
// Bu yergacha yetib kelgan xato route ichidagi try/catch tomonidan ushlanmagan degani
// (masalan: noto'g'ri formatdagi JSON body, yoki kutilmagan sync xato). Client'ga
// hech qachon stack trace yoki ichki xato tafsilotlari yubormaymiz.
// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  const log = req.log || require('../logger')
  log.error({ err }, '[UNHANDLED ERROR]')
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: "So'rov tanasi (JSON) noto'g'ri formatda" })
  }
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Ruxsat etilmagan manba (CORS)' })
  }
  res.status(err.status || 500).json({ error: "Server xatosi yuz berdi. Birozdan so'ng qayta urinib ko'ring." })
}

module.exports = { fail, notFound, globalErrorHandler }