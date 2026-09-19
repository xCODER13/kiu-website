const Teacher = require('../models/Teacher')
const { fail } = require('../middleware/errorHandler')
const { applyPagination } = require('../utils/pagination')
const { uploadImageToSupabase } = require('../services/supabaseUpload')

async function getAll(req, res) {
  try {
    const q = Teacher.find().sort({ createdAt: -1 })
    applyPagination(q, req.query)
    res.json(await q)
  } catch (e) { fail(req, res, 500, e) }
}

// Events controllerdagi bilan bir xil mantiq: yangi fayl bo'lsa — yuklanadi,
// bo'lmasa admin panel yuborgan `existingImage` (yoki rasm olib tashlangan
// bo'lsa bo'sh string) saqlanadi.
async function resolveImage(req) {
  if (req.file) return uploadImageToSupabase(req.file, 'teachers')
  return req.body.existingImage || ''
}

async function create(req, res) {
  try {
    const image = await resolveImage(req)
    const { name, role, dept, avatar, email } = req.body
    res.json(await Teacher.create({ name, role, dept, avatar, email, image }))
  } catch (e) { fail(req, res, 400, e) }
}

async function update(req, res) {
  try {
    const image = await resolveImage(req)
    const { name, role, dept, avatar, email } = req.body
    res.json(await Teacher.findByIdAndUpdate(req.params.id, { name, role, dept, avatar, email, image }, { new: true, runValidators: true }))
  } catch (e) { fail(req, res, 400, e) }
}

async function remove(req, res) {
  try { await Teacher.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }