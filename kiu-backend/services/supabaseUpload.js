const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')
const fs = require('fs')
const logger = require('../logger')
const { makeThumbnail, thumbPathOf } = require('./thumbnail')

// Barcha rasmlar shu bucket'da (public). Nom bitta joyda — upload/delete/prefiks mos tushishi uchun.
const STORAGE_BUCKET = 'news-images'

let supabase = null

function getSupabase() {
  if (!supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_URL yoki SUPABASE_SERVICE_KEY sozlanmagan')
    }
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  }
  return supabase
}

function sanitizeFileName(originalName) {
  return originalName
    .normalize('NFKD')
    .replace(/[^\w.-]/g, '_')
    .slice(-100)
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

// ── FAYL MAZMUNI TEKSHIRUVI (magic bytes) ──
// `file.mimetype` multer tomonidan to'g'ridan-to'g'ri klient yuborgan
// `Content-Type`dan olinadi — bu qiymatni istalgan client soxtalashtirishi
// mumkin (masalan, ichida skript bo'lgan faylni "image/png" deb yuborish).
// Shuning uchun MIME whitelist yetarli emas: fayl bayt'larining haqiqiy
// "imzosi" tekshiriladi — bu klient tomonidan o'zgartirib bo'lmaydigan
// yagona narsa, chunki u haqiqiy fayl mazmunidan olinadi.
const IMAGE_SIGNATURES = [
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF87a va GIF89a ikkalasi ham shu bilan boshlanadi
]

function detectImageMime(buffer) {
  for (const { mime, bytes } of IMAGE_SIGNATURES) {
    if (buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b)) {
      return mime
    }
  }
  // WEBP imzosi ikkiga bo'lingan: 0-3 baytlar "RIFF", 8-11 baytlar "WEBP"
  // (4-7 baytlar fayl hajmi — bu yerda tekshirilmaydi)
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp'
  }
  return null
}

// Admin panelda avval Dashboard.jsx brauzerdan to'g'ridan-to'g'ri Supabase'ga
// yuklaganida ishlatilgan papka nomlari — ma'lumotlar bazasidagi mavjud rasm
// URL'lari shu tuzilishga (news/, events/, teachers/) mos. Backend endi bu
// yuklashni o'z zimmasiga olganda ham xuddi shu joylashuvni davom ettiradi,
// aks holda eski va yangi rasm URL'lari turli joylarda tarqalib ketadi.
// Whitelist — folder parametri controller kodidan keladi (foydalanuvchi
// kiritmaydi), lekin himoya sifatida baribir cheklaymiz.
const ALLOWED_FOLDERS = new Set(['news', 'events', 'teachers', 'gallery'])

// Asosiy yuklash mantig'i — public URL bilan bir qatorda Storage yo'lini
// (`path`) ham qaytaradi. `path` keyinchalik qisman muvaffaqiyatsizlikda
// faylni tozalash (o'chirish) uchun kerak bo'ladi — shuning uchun bu ichki
// funksiya alohida ajratilgan, `uploadImageToSupabase` esa eski (faqat URL
// qaytaradigan) kontraktni saqlab qolish uchun uni o'rab turadi.
async function uploadImageWithPath(file, folder) {
  // multer endi diskka yozadi (`file.path`, middleware/upload.js — reja 2.3); `file.buffer` esa xotiradagi
  // fayllar (testlar, eski chaqiruvlar) uchun saqlangan.
  if (!file || (!file.buffer && !file.path)) {
    throw new Error("Yuklanadigan fayl topilmadi")
  }
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new Error(`Noto'g'ri yuklash papkasi: ${folder}`)
  }
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new Error(`Ruxsat etilmagan fayl turi: ${file.mimetype}`)
  }

  // Fayl faqat shu yerda (papka/MIME tekshiruvidan keyin) o'qiladi; bitta fayl <= 5 MB (multer limiti).
  const buffer = file.buffer || await fs.promises.readFile(file.path)

  // Deklaratsiya qilingan MIME whitelist'da bo'lishi kifoya emas — fayl
  // mazmuni haqiqatan ham ruxsat etilgan rasm formatlaridan biriga mos
  // kelishi kerak (client Content-Type'ni ishonch bilan qabul qilmaymiz).
  const detectedMime = detectImageMime(buffer)
  if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
    throw new Error("Fayl mazmuni haqiqiy rasm formatiga mos kelmadi (mazmun tekshiruvidan o'tmadi)")
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Fayl hajmi juda katta (maksimal ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB)`)
  }

  const client = getSupabase()
  const safeName = sanitizeFileName(file.originalname)
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`

  const { error } = await client.storage
    .from(STORAGE_BUCKET)
    // Supabase'ga saqlanadigan Content-Type — endi tasodifiy client
    // sarlavhasi emas, tasdiqlangan haqiqiy fayl turi (`detectedMime`)
    .upload(path, buffer, { contentType: detectedMime })

  if (error) {
    throw new Error(`Supabase upload xatosi: ${error.message}`)
  }

  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path)

  // Thumbnail (reja 2.2): eng yaxshi urinish — original allaqachon yuklangan, shuning uchun bu yerdagi
  // xato yuklashni bekor qilmaydi (frontend thumbnail topilmasa originalga qaytadi).
  let thumbPath = null
  const thumb = await makeThumbnail(buffer)
  if (thumb) {
    const candidate = thumbPathOf(path)
    const { error: thumbError } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(candidate, thumb, { contentType: 'image/webp' })
    if (thumbError) {
      logger.warn({ err: thumbError.message, path: candidate }, "Thumbnail'ni Storage'ga yuklab bo'lmadi — faqat original saqlandi")
    } else {
      thumbPath = candidate
    }
  }

  return { url: data.publicUrl, path, thumbPath }
}

// Bizning public bucket URL'lari boshlanadigan prefiks (oxiri '/'). Qiymat qo'lda yig'ilmaydi,
// supabase-js'ning o'zidan olinadi — shunda u har doim `uploadImageWithPath` qaytaradigan
// URL'lar bilan mos keladi (SUPABASE_URL formati o'zgarsa ham). SUPABASE_URL/KEY
// sozlanmagan bo'lsa `getSupabase()` xato tashlaydi — chaqiruvchi buni "prefiks yo'q" deb oladi.
function getPublicUrlPrefix() {
  const SENTINEL = '__prefix__'
  const { data } = getSupabase().storage.from(STORAGE_BUCKET).getPublicUrl(SENTINEL)
  const url = data && data.publicUrl
  if (typeof url !== 'string' || !url.endsWith(SENTINEL)) {
    throw new Error("Storage public URL prefiksini aniqlab bo'lmadi")
  }
  return url.slice(0, -SENTINEL.length)
}

async function uploadImageToSupabase(file, folder) {
  const { url } = await uploadImageWithPath(file, folder)
  return url
}

// ── YETIM FAYLLARNI TOZALASH ──
// Storage'dan berilgan yo'llarni o'chiradi. Bu har doim "eng yaxshi urinish"
// sifatida ishlatiladi (chaqiruvchi tomonda try/catch bilan o'raladi): tozalash
// muvaffaqiyatsiz bo'lsa ham, asosiy xatoni (masalan, "DB yozuvi muvaffaqiyatsiz
// bo'ldi") niqoblab qo'ymasligi kerak — faqat log qolady, qo'lda tozalash uchun.
async function deleteSupabaseImages(paths) {
  const list = (Array.isArray(paths) ? paths : [paths]).filter(Boolean)
  if (list.length === 0) return
  const client = getSupabase()
  const { error } = await client.storage.from(STORAGE_BUCKET).remove(list)
  if (error) {
    throw new Error(`Supabase'dan o'chirishda xato: ${error.message}`)
  }
}

// ── KO'P FAYLNI CHEKLANGAN PARALLELLIKDA YUKLASH — QISMAN MUVAFFAQIYATSIZLIKDA ROLLBACK ──
// Oldin `Promise.all` ishlatilardi: birorta fayl rad etilsa (masalan, MIME/
// magic-bytes yoki Supabase xatosi), allaqachon muvaffaqiyatli yuklangan
// boshqa fayllar Storage'da "yetim" qolib ketardi — ular hech qanday DB
// yozuviga bog'lanmagan, lekin saqlanib qoladi. Qaysi fayllar muvaffaqiyatli
// bo'lganini bilib, ularni (thumbnail'lari bilan) Storage'dan o'chirib,
// keyin asl xatoni qayta chiqaramiz — chaqiruvchi (controller) buni oddiy
// `catch` orqali xuddi avvalgidek 400 qaytarish uchun ishlata oladi.
// Bir vaqtda ko'pi bilan shuncha fayl qayta ishlanadi (o'qish + yuklash + thumbnail): RAM'da 10 × 5 MB emas, ~3 × 5 MB.
const UPLOAD_CONCURRENCY = 3

async function uploadImagesToSupabase(files, folder) {
  // Cheklangan parallellik; birinchi xatodan keyin yangi fayl boshlanmaydi (allaqachon boshlanganlari tugaydi
  // va quyida rollback qilinadi).
  const results = new Array(files.length)
  let next = 0
  let stop = false
  async function lane() {
    while (!stop) {
      const i = next++
      if (i >= files.length) return
      try {
        results[i] = { status: 'fulfilled', value: await uploadImageWithPath(files[i], folder) }
      } catch (reason) {
        results[i] = { status: 'rejected', reason }
        stop = true
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, lane))

  const done = results.filter(Boolean)
  const succeeded = done.filter(r => r.status === 'fulfilled').map(r => r.value)
  const firstFailure = done.find(r => r.status === 'rejected')
  // Originallar, keyin ularning thumbnail'lari: rollback va controller tozalashi ikkalasini ham o'chiradi
  const allPaths = [...succeeded.map(s => s.path), ...succeeded.map(s => s.thumbPath).filter(Boolean)]

  if (firstFailure) {
    if (allPaths.length > 0) {
      await deleteSupabaseImages(allPaths).catch(cleanupErr => {
        // Tozalash o'zi muvaffaqiyatsiz bo'lsa — asl xatoni niqoblamaymiz,
        // faqat log qoldiramiz (qo'lda tozalash kerak bo'lishi mumkin).
        logger.error(
          { err: cleanupErr.message, orphanedPaths: allPaths },
          'Qisman yuklash xatosidan keyin rollback (Storage tozalash) muvaffaqiyatsiz bo\'ldi'
        )
      })
    }
    throw firstFailure.reason
  }

  return { urls: succeeded.map(s => s.url), paths: allPaths }
}

module.exports = { getSupabase, getPublicUrlPrefix, uploadImageToSupabase, uploadImagesToSupabase, deleteSupabaseImages, STORAGE_BUCKET }