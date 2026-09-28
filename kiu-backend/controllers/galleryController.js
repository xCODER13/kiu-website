const Gallery = require('../models/Gallery')
const { fail } = require('../middleware/errorHandler')
const { uploadImagesToSupabase, deleteSupabaseImages } = require('../services/supabaseUpload')
const { applyPagination } = require('../utils/pagination')

async function getAll(req, res) {
  try {
    const q = Gallery.find().sort({ createdAt: -1 })
    applyPagination(q, req.query)
    res.json(await q)
  } catch (e) { fail(req, res, 500, e) }
}

// Admin panel tahrirlashda o'zgartirilmagan mavjud rasm URL'larini JSON massiv
// sifatida yuboradi (News/Teachers bilan bir xil konventsiya) — bu yerda
// News controllerdagi parseExistingImages bilan bir xil, lekin natija to'g'ridan
// -to'g'ri `images` massiviga yoziladi (string hibrid formatga aylantirilmaydi).
function parseExistingImages(raw) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(u => typeof u === 'string') : []
  } catch {
    return typeof raw === 'string' ? [raw] : []
  }
}

// Qisman-yuklash holatini (bir nechta fayldan biri muvaffaqiyatsiz bo'lsa)
// `uploadImagesToSupabase` o'zi ichida tozalaydi. Bu funksiya qaytargan
// `paths`ni chaqiruvchi (create/update) DB yozuvi muvaffaqiyatsiz bo'lganda
// ham tozalash uchun saqlab qo'yadi.
async function buildImages(req, folder) {
  const existingUrls = parseExistingImages(req.body.existingImages)
  const files = req.files || []
  const { urls: newUrls, paths } = await uploadImagesToSupabase(files, folder)
  return { images: [...existingUrls, ...newUrls], paths }
}

async function create(req, res) {
  let uploadedPaths = []
  try {
    const { images, paths } = await buildImages(req, 'gallery')
    uploadedPaths = paths
    if (images.length === 0) {
      if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
      return res.status(400).json({ error: 'Kamida bitta rasm kerak' })
    }
    const { title, desc } = req.body
    res.json(await Gallery.create({ title, desc, images }))
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

async function update(req, res) {
  let uploadedPaths = []
  try {
    const { images, paths } = await buildImages(req, 'gallery')
    uploadedPaths = paths
    const { title, desc } = req.body
    const updated = await Gallery.findByIdAndUpdate(req.params.id,
      { title, desc, images },
      { new: true, runValidators: true }
    )
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
  try { await Gallery.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }