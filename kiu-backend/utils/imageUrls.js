// ── MIJOZDAN KELGAN RASM URL'LARINI TEKSHIRISH (DESIGN.md 10.4, 1.1) ──
// `existingImage(s)` admin paneldan keladi va ilgari tekshirilmay bazaga yozilardi. Natija:
// admin tokeni o'g'irlansa (yoki xato yuborsa) bazaga tashqi URL kiritish mumkin edi —
// ommaviy saytda `<img src>` / `background-image: url(...)` ga tushadi (kuzatuv pikseli,
// begona kontent, CSS injection). Qoida: yangi URL faqat BIZNING public bucket prefiksi
// bilan boshlanishi shart.
//
// Eski yozuvlarni buzmaslik uchun: tahrirlashda hujjatning O'ZIDA allaqachon saqlangan URL'lar
// (o'zgarmagan rasmlar) har qanday ko'rinishda qabul qilinadi — ya'ni bu tekshiruv faqat YANGI
// kiritilayotgan URL'larga qattiq. Yangi hujjat yaratishda "allaqachon saqlangan" yo'q.
const { getPublicUrlPrefix } = require('../services/supabaseUpload')

// Prefiksdan keyingi qism: `papka/uuid-fayl.ext` (+ eski yuklashlardagi `%20` kabi kodlashlar).
// So'rov qatori (?), yorliq (#), qavs, qo'shtirnoq, bo'shliq va teskari slash taqiqlanadi.
const SAFE_REST = /^[\w.\-%/]+$/
const ENCODED_TRAVERSAL = /%(2e|2f|5c)/i // kodlangan '.', '/', '\'

function isOwnStorageUrl(url, prefix) {
  if (typeof url !== 'string' || !prefix || !url.startsWith(prefix)) return false
  const rest = url.slice(prefix.length)
  return (
    rest.length > 0 &&
    rest.length <= 500 &&
    !rest.includes('..') &&
    !ENCODED_TRAVERSAL.test(rest) &&
    SAFE_REST.test(rest)
  )
}

// Ruxsat etilmagan birinchi qiymatni qaytaradi, hammasi joyida bo'lsa null.
// Bo'sh satr ('' — "rasm yo'q") doim ruxsat etiladi.
function findForeignImageUrl(urls, current = []) {
  const alreadyStored = new Set(current)
  let prefix = null
  try { prefix = getPublicUrlPrefix() } catch { /* Storage sozlanmagan — prefiks yo'q, yangi URL'lar rad etiladi */ }
  for (const u of urls) {
    if (u === '') continue
    if (typeof u === 'string' && alreadyStored.has(u)) continue
    if (!isOwnStorageUrl(u, prefix)) return u
  }
  return null
}

// Controller'lar uchun: begona URL topilsa 400 yuboradi va true qaytaradi (chaqiruvchi `return` qiladi).
function rejectForeignImageUrls(req, res, urls, current = []) {
  const bad = findForeignImageUrl(urls, current)
  if (bad === null) return false
  req.log.warn({ url: String(bad).slice(0, 200) }, "[SECURITY] Begona rasm URL'i rad etildi")
  res.status(400).json({ error: "Rasm manzili noto'g'ri" })
  return true
}

module.exports = { isOwnStorageUrl, findForeignImageUrl, rejectForeignImageUrls }
