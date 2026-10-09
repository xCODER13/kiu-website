// ── ESKI RASMLARNI STORAGE'DAN O'CHIRISH (reja 2.1) ──
// Yangilik/tadbir/o'qituvchi/albom o'chirilganda yoki tahrirlashda rasm olib tashlanganda fayl
// Storage'da "yetim" qolardi (pul va joy sarflaydi). Bu modul shu fayllarni o'chiradi.
//
// Qoidalar (qaytarib bo'lmaydigan amal bo'lgani uchun qattiq):
//  1. TARTIB: avval DB yozuvi, keyin Storage. Chaqiruvchi bu funksiyani DB o'zgarishi MUVAFFAQIYATLI
//     bo'lgandan keyin chaqiradi. Teskari tartibda DB xatosi rasmni yo'qotib, yozuvni esa saqlab qolardi.
//  2. Faqat BIZNING bucket'dagi, faqat ruxsat etilgan papkalardagi (news/events/teachers/gallery),
//     `papka/fayl` ko'rinishidagi yo'llar o'chiriladi. Yo'l bazadagi URL'dan bucket prefiksi orqali
//     chiqariladi — begona/eski tashqi URL'ga tegilmaydi.
//  3. Boshqa hujjat hamon shu rasmga havola qilsa, fayl O'CHIRILMAYDI (yangi hujjatga boshqa hujjatning
//     rasm URL'ini kiritish mumkin — 1.1 faqat prefiksni tekshiradi).
//  4. Xato foydalanuvchiga 500 qaytarmaydi: asosiy amal (DB) allaqachon bajarilgan. Faqat log yoziladi
//     (qo'lda tozalash uchun yo'llar bilan). Funksiya HECH QACHON throw qilmaydi.
const logger = require('../logger')
const { getPublicUrlPrefix, deleteSupabaseImages } = require('./supabaseUpload')
const { isOwnStorageUrl } = require('../utils/imageUrls')
const { thumbPathOf } = require('./thumbnail')
const News = require('../models/News')
const Event = require('../models/Event')
const Teacher = require('../models/Teacher')
const Gallery = require('../models/Gallery')

// supabaseUpload.ALLOWED_FOLDERS bilan bir xil (u eksport qilinmaydi); yuklash faqat shu papkalarga yozadi.
const FOLDERS = ['news', 'events', 'teachers', 'gallery']

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// `url` bizning bucket'dagi `papka/fayl` bo'lsa { path, rest } qaytaradi, aks holda null.
// `rest` — URL'dagi (kodlangan) qism: bazadagi satrlarni qidirish uchun; `path` — Storage'ga beriladigan (dekodlangan) yo'l.
function toStoragePath(url, prefix) {
  if (!isOwnStorageUrl(url, prefix)) return null
  const rest = url.slice(prefix.length)
  let path
  try { path = decodeURIComponent(rest) } catch { return null }
  const parts = path.split('/')
  if (parts.length !== 2 || !parts[1] || !FOLDERS.includes(parts[0])) return null
  if (path.includes('..') || path.includes('\\')) return null
  return { path, rest }
}

// Bazadagi biror hujjat hamon shu rasmga havola qiladimi (News.image — satr yoki JSON-satr, Gallery.images — massiv).
async function isStillReferenced(rest) {
  const re = new RegExp(escapeRegExp(rest))
  const [n, e, t, g] = await Promise.all([
    News.exists({ image: re }),
    Event.exists({ image: re }),
    Teacher.exists({ image: re }),
    Gallery.exists({ images: re }),
  ])
  return Boolean(n || e || t || g)
}

// Tahrirlashda: eski ro'yxatda bor, yangisida yo'q URL'lar (bo'sh qiymatlarsiz, takrorsiz).
function removedUrls(before, after) {
  const keep = new Set(after)
  return [...new Set(before)].filter(u => typeof u === 'string' && u !== '' && !keep.has(u))
}

// DB o'zgarishi MUVAFFAQIYATLI bo'lgandan KEYIN chaqiriladi. Hech qachon throw qilmaydi.
async function removeStoredImages(req, urls) {
  const log = (req && req.log) || logger
  let paths = []
  try {
    const list = [...new Set((urls || []).filter(u => typeof u === 'string' && u !== ''))]
    if (list.length === 0) return

    let prefix
    try { prefix = getPublicUrlPrefix() } catch {
      log.warn('Storage sozlanmagan — eski rasmlar o\'chirilmadi')
      return
    }

    const candidates = list.map(u => toStoragePath(u, prefix)).filter(Boolean)
    for (const c of candidates) {
      // Original bilan birga uning thumbnail'i (2.2; eski rasmlarda yo'q — mavjud bo'lmagan yo'lni o'chirish xato bermaydi)
      if (!(await isStillReferenced(c.rest))) paths.push(c.path, thumbPathOf(c.path))
    }
    if (paths.length === 0) return
    await deleteSupabaseImages(paths)
  } catch (err) {
    // Asosiy amal (DB) bajarilgan — mijozga xato yo'q; yetim qolgan yo'llar logda
    log.error({ err: err && err.message, orphanedPaths: paths }, "Eski rasmlarni Storage'dan o'chirish muvaffaqiyatsiz bo'ldi (qo'lda tozalash kerak)")
  }
}

module.exports = { removeStoredImages, removedUrls, toStoragePath }
