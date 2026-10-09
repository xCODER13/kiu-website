// ── RASM YUKLASH (multer) — DISKKA (reja 2.3) ──
// Avval `memoryStorage`: bir so'rovda 10 × 5 MB = 50 MB RAM (kichik Render instance'da parallel yuklashlar
// xotirani to'ldirib servisni yiqitishi mumkin). Endi fayllar vaqtincha diskka yoziladi, servis ularni
// birma-bir (cheklangan parallellikda) o'qib Storage'ga yuboradi — RAM'da bir vaqtda bir necha fayl.
//
// Xavfsizlik: papka faqat joriy jarayon uchun (0700), fayl nomi tasodifiy UUID (mijoz nomi diskka yozilmaydi,
// u faqat `file.originalname` sifatida Storage yo'lini yasash uchun tozalanib ishlatiladi). Vaqtincha fayllar
// javob tugagach (muvaffaqiyat, xato yoki uzilish) o'chiriladi; multer o'z xatolarida (limit) o'zi tozalaydi.
const multer = require('multer')
const os = require('os')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const UPLOAD_DIR = path.join(os.tmpdir(), 'kiu-uploads')
const MAX_FILE_BYTES = 5 * 1024 * 1024 // supabaseUpload.js dagi MAX_FILE_SIZE_BYTES bilan bir xil
const MAX_FILES = 10

const storage = multer.diskStorage({
  destination(req, file, cb) {
    fs.mkdir(UPLOAD_DIR, { recursive: true, mode: 0o700 }, err => cb(err, UPLOAD_DIR))
  },
  filename(req, file, cb) {
    cb(null, crypto.randomUUID())
  },
})

const instance = multer({ storage, limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES } })

function uploadedFiles(req) {
  const many = Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat()
  return [...many, req.file].filter(f => f && f.path)
}

// Javob yakunlangach (yoki ulanish uzilgach) vaqtincha fayllarni o'chiradi. Xato bo'lsa e'tiborsiz (fayl allaqachon yo'q).
function removeTempFiles(req) {
  return Promise.all(uploadedFiles(req).map(f => fs.promises.unlink(f.path).catch(() => {})))
}

function withCleanup(handler) {
  return (req, res, next) => {
    res.once('close', () => { removeTempFiles(req) })
    handler(req, res, next)
  }
}

const single = field => withCleanup(instance.single(field))
const array = (field, max = MAX_FILES) => withCleanup(instance.array(field, max))

module.exports = { single, array, UPLOAD_DIR, MAX_FILE_BYTES, MAX_FILES, removeTempFiles }
