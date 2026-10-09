// ── THUMBNAIL (reja 2.2) ──
// Admin va sayt 5 MB original rasmlarni yuklaydi; galereya mozaikasi har kartada bir nechta originalni olardi.
// Yuklashda har rasmga kichik WebP nusxa yaratiladi: `<original yo'l>.thumb.webp` (nom qoidasi — sxema/DB o'zgarishisiz,
// frontend originalning URL'iga `.thumb.webp` qo'shib thumbnail manzilini hosil qiladi; eski rasmlarda yo'q — zaxira original).
//
// Thumbnail — "eng yaxshi urinish": yaratib bo'lmasa (kutubxona yuklanmadi, rasm dekodlanmadi, piksel limiti) original
// baribir yuklanadi, xato faqat logga yoziladi. `sharp` lazy yuklanadi — native modul muammosi serverni ishga tushirmay
// qo'ymasin (avval startup'da yiqilgan deploylar bo'lgan).
const logger = require('../logger')

const THUMB_WIDTH = 640
const THUMB_QUALITY = 72
// Dekodlash xotirasi ~ piksel * 4 bayt: 40 MP ~ 160 MB (kichik Render instance uchun yuqori chegara).
// Katta "piksel bombasi" (5 MB PNG -> yuz millionlab piksel) shu yerda to'xtaydi.
const MAX_INPUT_PIXELS = 40_000_000
const THUMB_SUFFIX = '.thumb.webp'

let sharp
let sharpFailed = false
function getSharp() {
  if (sharp) return sharp
  if (sharpFailed) return null
  try {
    sharp = require('sharp')
    sharp.cache(false) // jarayon xotirasida kesh saqlamaymiz
    sharp.concurrency(1) // bitta rasm uchun bitta oqim — parallel yuklashlarda CPU/xotira portlamasin
    return sharp
  } catch (err) {
    sharpFailed = true
    logger.warn({ err: err && err.message }, "sharp yuklanmadi — thumbnail'lar yaratilmaydi")
    return null
  }
}

const thumbPathOf = path => `${path}${THUMB_SUFFIX}`

// Buffer -> WebP buffer, yoki null (log bilan). Hech qachon throw qilmaydi.
async function makeThumbnail(buffer) {
  const s = getSharp()
  if (!s) return null
  try {
    return await s(buffer, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate() // EXIF yo'nalishini qo'llaydi; qayta kodlash EXIF/GPS ma'lumotlarini ham olib tashlaydi
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer()
  } catch (err) {
    logger.warn({ err: err && err.message }, 'Thumbnail yaratib bo\'lmadi — faqat original saqlanadi')
    return null
  }
}

module.exports = { makeThumbnail, thumbPathOf, THUMB_SUFFIX, THUMB_WIDTH, MAX_INPUT_PIXELS }
