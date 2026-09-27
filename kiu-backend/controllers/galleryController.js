const Gallery = require('../models/Gallery')
const { fail } = require('../middleware/errorHandler')
const { uploadImageToSupabase } = require('../services/supabaseUpload')
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

async function buildImages(req) {
  const existingUrls = parseExistingImages(req.body.existingImages)
  const files = req.files || []
  const newUrls = await Promise.all(files.map(f => uploadImageToSupabase(f, 'gallery')))
  return [...existingUrls, ...newUrls]
}

async function create(req, res) {
  try {
    const images = await buildImages(req)
    if (images.length === 0) return res.status(400).json({ error: 'Kamida bitta rasm kerak' })
    const { title, desc } = req.body
    res.json(await Gallery.create({ title, desc, images }))
  } catch (e) { fail(req, res, 400, e) }
}

async function update(req, res) {
  try {
    const images = await buildImages(req)
    const { title, desc } = req.body
    const updated = await Gallery.findByIdAndUpdate(req.params.id,
      { title, desc, images },
      { new: true, runValidators: true }
    )
    if (!updated) return res.status(404).json({ error: 'Topilmadi' })
    res.json(updated)
  } catch (e) { fail(req, res, 400, e) }
}

async function remove(req, res) {
  try { await Gallery.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }