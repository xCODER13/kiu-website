const StudentLife = require('../models/StudentLife')
const { fail } = require('../middleware/errorHandler')
const audit = require('../services/auditLog')
const { applyPagination } = require('../utils/pagination')
const { uploadImagesToSupabase, deleteSupabaseImages } = require('../services/supabaseUpload')
const { rejectForeignImageUrls } = require('../utils/imageUrls')
const { removeStoredImages, removedUrls } = require('../services/imageCleanup')
const { STUDENT_LIFE_SECTIONS } = require('../utils/studentLifeSections')

const FOLDER = 'student-life'
const FIELDS = ['section', 'title', 'desc', 'link', 'order']

// `?section=` — faqat ro'yxatdagi qator (massiv/obyekt `?section[$ne]=x` kabi NoSQL-injection urinishlari 400 oladi)
async function getAll(req, res) {
  try {
    const { section } = req.query
    if (section !== undefined && !STUDENT_LIFE_SECTIONS.includes(section)) {
      return res.status(400).json({ error: "Bo'lim noto'g'ri" })
    }
    const q = StudentLife.find(section ? { section } : {}).sort({ section: 1, order: 1, createdAt: -1, _id: -1 }).lean()
    applyPagination(q, req.query)
    res.json(await q)
  } catch (e) { fail(req, res, 500, e) }
}

// Faqat kelgan maydonlar (undefined — tegilmaydi); `image` alohida hal qilinadi
function pickFields(body) {
  const out = {}
  for (const k of FIELDS) if (body[k] !== undefined) out[k] = body[k]
  return out
}

// Yangi fayl bo'lsa u ustun; bo'lmasa admin yuborgan `existingImage` ('' — rasm olib tashlandi). `uploadedPaths` — keyingi
// DB xatosida Storage'da yetim qolmasligi uchun chaqiruvchiga qaytariladi (events bilan bir xil naqsh).
async function resolveImage(req) {
  if (!req.file) return { image: req.body.existingImage || '', uploadedPaths: [] }
  const { urls, paths } = await uploadImagesToSupabase([req.file], FOLDER)
  return { image: urls[0], uploadedPaths: paths }
}

async function create(req, res) {
  let uploadedPaths = []
  try {
    if (!req.file && rejectForeignImageUrls(req, res, [req.body.existingImage || ''])) return
    const resolved = await resolveImage(req)
    uploadedPaths = resolved.uploadedPaths
    res.json(await StudentLife.create({ ...pickFields(req.body), image: resolved.image }))
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

async function update(req, res) {
  let uploadedPaths = []
  try {
    const stored = await StudentLife.findById(req.params.id).select('image')
    if (!stored) return res.status(404).json({ error: 'Topilmadi' }) // fayl yuklashdan OLDIN
    if (!req.file && rejectForeignImageUrls(req, res, [req.body.existingImage || ''], [stored.image])) return
    const resolved = await resolveImage(req)
    uploadedPaths = resolved.uploadedPaths
    const updated = await StudentLife.findByIdAndUpdate(
      req.params.id, { ...pickFields(req.body), image: resolved.image }, { returnDocument: 'after', runValidators: true },
    )
    if (!updated) { // yuklash paytida o'chirib yuborilgan
      if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
      return res.status(404).json({ error: 'Topilmadi' })
    }
    // DB yangilandi — almashtirilgan/olib tashlangan eski rasm Storage'dan o'chadi (2.1; xato bo'lsa faqat log)
    await removeStoredImages(req, removedUrls([stored.image], [resolved.image]))
    res.json(updated)
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

async function remove(req, res) {
  try {
    const deleted = await StudentLife.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Topilmadi' })
    await removeStoredImages(req, [deleted.image]) // avval DB, keyin Storage (2.1)
    await audit.record('delete', req, { resource: 'student-life', targetId: req.params.id })
    res.json({ success: true })
  } catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }
