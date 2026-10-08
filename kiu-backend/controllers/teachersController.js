const Teacher = require('../models/Teacher')
const { fail } = require('../middleware/errorHandler')
const { applyPagination } = require('../utils/pagination')
const { uploadImagesToSupabase, deleteSupabaseImages } = require('../services/supabaseUpload')
const { rejectForeignImageUrls } = require('../utils/imageUrls')
const { omitUnchangedLegacy } = require('../utils/legacyValues')
const { DEPARTMENTS } = require('../utils/departments')

// Bazada eski `email` qiymatlari qolgan bo'lishi mumkin (Mongoose strict rejimi ularni o'chirmaydi) —
// shuning uchun har bir javobdan aniq chiqarib tashlanadi (scripts/unset-teacher-email.js bilan DB ham tozalanadi).
const HIDE = '-email'

// Ruxsat etilgan kafedralar ro'yxati (ommaviy; admin forma va kelajakda sayt filtri shundan oladi)
function getDepartments(req, res) {
  res.json(DEPARTMENTS)
}

async function getAll(req, res) {
  try {
    const q = Teacher.find().select(HIDE).sort({ createdAt: -1 })
    applyPagination(q, req.query)
    res.json(await q)
  } catch (e) { fail(req, res, 500, e) }
}

// Events controllerdagi bilan bir xil mantiq: yangi fayl bo'lsa — yuklanadi,
// bo'lmasa admin panel yuborgan `existingImage` (yoki rasm olib tashlangan
// bo'lsa bo'sh string) saqlanadi. `uploadedPaths` — fayl yuklangan bo'lsa,
// undan keyingi DB yozuvi muvaffaqiyatsiz bo'lganda Storage'da "yetim"
// qolmasligi uchun chaqiruvchiga qaytariladi.
async function resolveImage(req) {
  if (!req.file) return { image: req.body.existingImage || '', uploadedPaths: [] }
  const { urls, paths } = await uploadImagesToSupabase([req.file], 'teachers')
  return { image: urls[0], uploadedPaths: paths }
}

async function create(req, res) {
  let uploadedPaths = []
  try {
    // `existingImage` faqat fayl yuborilmaganda ishlatiladi; fayl bo'lsa u e'tiborsiz (1.1)
    if (!req.file && rejectForeignImageUrls(req, res, [req.body.existingImage || ''])) return
    const resolved = await resolveImage(req)
    uploadedPaths = resolved.uploadedPaths
    const { name, role, dept, avatar } = req.body
    const created = await Teacher.create({ name, role, dept, avatar, image: resolved.image })
    res.json(created)
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

async function update(req, res) {
  let uploadedPaths = []
  try {
    const stored = await Teacher.findById(req.params.id).select('image dept avatar')
    if (!req.file && rejectForeignImageUrls(req, res, [req.body.existingImage || ''], stored ? [stored.image] : [])) return
    const resolved = await resolveImage(req)
    uploadedPaths = resolved.uploadedPaths
    const { name, role, dept, avatar } = req.body
    // Eski (ro'yxatdan oldin saqlangan) kafedra/avatar o'zgarmasdan qaytsa — tahrirlash bloklanmasin (utils/legacyValues.js)
    const fields = omitUnchangedLegacy({ name, role, dept, avatar }, stored, {
      dept: d => DEPARTMENTS.includes(d),
      avatar: a => a.length <= 2,
    })
    const updated = await Teacher.findByIdAndUpdate(req.params.id, { ...fields, image: resolved.image }, { new: true, runValidators: true }).select(HIDE)
    if (!updated) {
      if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
      return res.status(404).json({ error: 'Topilmadi' })
    }
    res.json(updated)
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

async function remove(req, res) {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Topilmadi' })
    res.json({ success: true })
  } catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, getDepartments, create, update, remove }