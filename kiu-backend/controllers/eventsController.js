const Event = require('../models/Event')
const { fail } = require('../middleware/errorHandler')
const { applyPagination } = require('../utils/pagination')
const { uploadImageToSupabase } = require('../services/supabaseUpload')

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
// olib tashlangan holatda bo'sh string) ishlatiladi.
async function resolveImage(req) {
  if (req.file) return uploadImageToSupabase(req.file, 'events')
  return req.body.existingImage || ''
}

async function create(req, res) {
  try {
    const image = await resolveImage(req)
    const { title, desc, date, month, type } = req.body
    res.json(await Event.create({ title, desc, date, month, type, image }))
  } catch (e) { fail(req, res, 400, e) }
}

async function update(req, res) {
  try {
    const image = await resolveImage(req)
    const { title, desc, date, month, type } = req.body
    res.json(await Event.findByIdAndUpdate(req.params.id, { title, desc, date, month, type, image }, { new: true }))
  } catch (e) { fail(req, res, 400, e) }
}

async function remove(req, res) {
  try { await Event.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }