// `router.param('id', validateObjectId)` — ':id' parametrli barcha route'lar uchun.
// Noto'g'ri formatdagi id bazaga yetib bormasdan aniq 400 bilan qaytariladi (aks holda
// Mongoose CastError 500 sifatida chiqib, xato loglarini to'ldirardi).
const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function validateObjectId(req, res, next, id) {
  if (!OBJECT_ID_RE.test(id)) return res.status(400).json({ error: "Noto'g'ri identifikator formati" })
  next()
}

module.exports = validateObjectId
