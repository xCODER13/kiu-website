const Teacher = require('../models/Teacher')
const { fail } = require('../middleware/errorHandler')
const { applyPagination } = require('../utils/pagination')
const { uploadImagesToSupabase, deleteSupabaseImages } = require('../services/supabaseUpload')

async function getAll(req, res) {
  try {
    const q = Teacher.find().sort({ createdAt: -1 })
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
    const resolved = await resolveImage(req)
    uploadedPaths = resolved.uploadedPaths
    const { name, role, dept, avatar, email } = req.body
    res.json(await Teacher.create({ name, role, dept, avatar, email, image: resolved.image }))
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

async function update(req, res) {
  let uploadedPaths = []
  try {
    const resolved = await resolveImage(req)
    uploadedPaths = resolved.uploadedPaths
    const { name, role, dept, avatar, email } = req.body
    const updated = await Teacher.findByIdAndUpdate(req.params.id, { name, role, dept, avatar, email, image: resolved.image }, { new: true, runValidators: true })
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
  try { await Teacher.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }