// Xatoni log'ga yozishdan oldin foydalanuvchi kiritgan qiymatlardan tozalaydi (4.3).
//
// Nima uchun redact yetmaydi: Mongoose CastError/ValidationError matni (`message`, `stack`) kiritilgan
// qiymatni o'zi bilan olib yuradi ("Cast to string failed for value ..."), body-parser'ning JSON xatosi
// esa xom body'ni (`err.body`) va uning bo'lagini xabarda saqlaydi — login so'rovida bu parol bo'lishi
// mumkin. Bunday xatolarda faqat TURI va MAYDON NOMI log'ga yoziladi: nima noto'g'ri ekanini bilish
// uchun yetarli, qiymat esa yozilmaydi. Boshqa xatolar o'zgarishsiz qaytadi (stack kerak).
function sanitizeError(e) {
  if (!e || typeof e !== 'object') return e

  if (e.name === 'ValidationError' && e.errors && typeof e.errors === 'object') {
    const fields = {}
    for (const [path, detail] of Object.entries(e.errors)) fields[path] = detail?.kind || detail?.name || 'invalid'
    return { type: 'ValidationError', fields }
  }
  if (e.name === 'CastError') return { type: 'CastError', path: e.path, kind: e.kind }
  if (e.type === 'entity.parse.failed' || e.type === 'entity.too.large') return { type: e.type, status: e.status }

  return e
}

module.exports = { sanitizeError }
