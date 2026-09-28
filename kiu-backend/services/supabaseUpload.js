const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')
const logger = require('../logger')

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
  if (!file || !file.buffer) {
    throw new Error("Yuklanadigan fayl topilmadi")
  }
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new Error(`Noto'g'ri yuklash papkasi: ${folder}`)
  }
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new Error(`Ruxsat etilmagan fayl turi: ${file.mimetype}`)
  }

  // Deklaratsiya qilingan MIME whitelist'da bo'lishi kifoya emas — fayl
  // mazmuni haqiqatan ham ruxsat etilgan rasm formatlaridan biriga mos
  // kelishi kerak (client Content-Type'ni ishonch bilan qabul qilmaymiz).
  const detectedMime = detectImageMime(file.buffer)
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
    .from('news-images')
    // Supabase'ga saqlanadigan Content-Type — endi tasodifiy client
    // sarlavhasi emas, tasdiqlangan haqiqiy fayl turi (`detectedMime`)
    .upload(path, file.buffer, { contentType: detectedMime })

  if (error) {
    throw new Error(`Supabase upload xatosi: ${error.message}`)
  }

  const { data } = client.storage.from('news-images').getPublicUrl(path)
  return { url: data.publicUrl, path }
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
  const { error } = await client.storage.from('news-images').remove(list)
  if (error) {
    throw new Error(`Supabase'dan o'chirishda xato: ${error.message}`)
  }
}

// ── KO'P FAYLNI PARALLEL YUKLASH — QISMAN MUVAFFAQIYATSIZLIKDA ROLLBACK ──
// Oldin `Promise.all` ishlatilardi: birorta fayl rad etilsa (masalan, MIME/
// magic-bytes yoki Supabase xatosi), allaqachon muvaffaqiyatli yuklangan
// boshqa fayllar Storage'da "yetim" qolib ketardi — ular hech qanday DB
// yozuviga bog'lanmagan, lekin saqlanib qoladi. `Promise.allSettled` bilan
// qaysi fayllar muvaffaqiyatli bo'lganini bilib, ularni Storage'dan o'chirib,
// keyin asl xatoni qayta chiqaramiz — chaqiruvchi (controller) buni oddiy
// `catch` orqali xuddi avvalgidek 400 qaytarish uchun ishlata oladi.
async function uploadImagesToSupabase(files, folder) {
  const results = await Promise.allSettled(files.map(f => uploadImageWithPath(f, folder)))

  const succeeded = results.filter(r => r.status === 'fulfilled').map(r => r.value)
  const firstFailure = results.find(r => r.status === 'rejected')

  if (firstFailure) {
    if (succeeded.length > 0) {
      await deleteSupabaseImages(succeeded.map(s => s.path)).catch(cleanupErr => {
        // Tozalash o'zi muvaffaqiyatsiz bo'lsa — asl xatoni niqoblamaymiz,
        // faqat log qoldiramiz (qo'lda tozalash kerak bo'lishi mumkin).
        logger.error(
          { err: cleanupErr.message, orphanedPaths: succeeded.map(s => s.path) },
          'Qisman yuklash xatosidan keyin rollback (Storage tozalash) muvaffaqiyatsiz bo\'ldi'
        )
      })
    }
    throw firstFailure.reason
  }

  return { urls: succeeded.map(s => s.url), paths: succeeded.map(s => s.path) }
}

module.exports = { getSupabase, uploadImageToSupabase, uploadImagesToSupabase, deleteSupabaseImages }