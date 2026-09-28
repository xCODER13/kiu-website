const Event = require('../models/Event')
const { fail } = require('../middleware/errorHandler')
const { applyPagination } = require('../utils/pagination')
const { uploadImagesToSupabase, deleteSupabaseImages } = require('../services/supabaseUpload')

async function getAll(req, res) {
  try {
    const q = Event.find().sort({ createdAt: -1 })
    applyPagination(q, req.query)
    res.json(await q)
  } catch (e) { fail(req, res, 500, e) }
}

// ── RASM MAYDONINI ANIQLASH ──
// Yangi fayl yuklangan bo'lsa — shu ustunlik qiladi. Bo'lmasa, admin panel
// yuborgan `existingImage` (tahrirlashda o'zgartirilmagan yoki rasm butunlay
// olib tashlangan holatda bo'sh string) ishlatiladi. `uploadedPaths` — agar
// fayl yuklangan bo'lsa, undan keyingi DB yozuvi muvaffaqiyatsiz bo'lganda
// Storage'da "yetim" qolmasligi uchun chaqiruvchiga qaytariladi.
async function resolveImage(req, folder) {
  if (!req.file) return { image: req.body.existingImage || '', uploadedPaths: [] }
  const { urls, paths } = await uploadImagesToSupabase([req.file], folder)
  return { image: urls[0], uploadedPaths: paths }
}

async function create(req, res) {
  let uploadedPaths = []
  try {
    const resolved = await resolveImage(req, 'events')
    uploadedPaths = resolved.uploadedPaths
    const { title, desc, date, month, type } = req.body
    res.json(await Event.create({ title, desc, date, month, type, image: resolved.image }))
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

async function update(req, res) {
  let uploadedPaths = []
  try {
    const resolved = await resolveImage(req, 'events')
    uploadedPaths = resolved.uploadedPaths
    const { title, desc, date, month, type } = req.body
    const updated = await Event.findByIdAndUpdate(req.params.id, { title, desc, date, month, type, image: resolved.image }, { new: true, runValidators: true })
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
  try { await Event.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }