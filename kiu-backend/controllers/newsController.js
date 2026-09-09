const News = require('../models/News')
const { fail } = require('../middleware/errorHandler')
const { uploadImageToSupabase } = require('../services/supabaseUpload')
const { applyPagination } = require('../utils/pagination')

async function getOne(req, res) {
  try {
    const news = await News.findById(req.params.id)
    if (!news) return res.status(404).json({ error: 'Topilmadi' })
    res.json(news)
  } catch (e) { fail(req, res, 500, e) }
}

async function getAll(req, res) {
  try {
    const q = News.find().sort({ createdAt: -1 })
    applyPagination(q, req.query)
    res.json(await q)
  } catch (e) { fail(req, res, 500, e) }
}

async function create(req, res) {
  try {
    let imageUrl = req.body.image || ''
    if (req.file) imageUrl = await uploadImageToSupabase(req.file)
    const { title, content, category, videoId } = req.body
    const shortsUrl = req.body.shortsUrl || ''
    res.json(await News.create({ title, content, category, image: imageUrl, shortsUrl, videoId: videoId || '' }))
  } catch (e) { fail(req, res, 400, e) }
}

async function update(req, res) {
  try {
    let imageUrl = req.body.image || ''
    if (req.file) imageUrl = await uploadImageToSupabase(req.file)
    const { title, content, category, videoId } = req.body
    const shortsUrl = req.body.shortsUrl || ''
    res.json(await News.findByIdAndUpdate(req.params.id,
      { title, content, category, image: imageUrl, shortsUrl, videoId: videoId || '' },
      { new: true }
    ))
  } catch (e) { fail(req, res, 400, e) }
}

async function incrementView(req, res) {
  try {
    await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
    res.json({ success: true })
  } catch (e) { fail(req, res, 500, e) }
}

async function remove(req, res) {
  try { await News.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getOne, getAll, create, update, incrementView, remove }