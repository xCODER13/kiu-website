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

// ── RASM MAYDONINI QURISH ──
// News bir nechta rasmni qo'llab-quvvatlaydi: mavjud (tahrirlashda saqlanib
// qolgan) URL'lar + shu so'rovda yangi yuklangan fayllar birlashtiriladi.
// Saqlash formati eski frontend konventsiyasi bilan bir xil: bo'sh bo'lsa '',
// bitta URL bo'lsa string, bir nechta bo'lsa JSON-stringified massiv —
// buni o'zgartirish frontend/NewsDetail'dagi parseImages() bilan mos kelishi shart.
function buildImageValue(existingUrls, newUrls) {
  const all = [...existingUrls, ...newUrls]
  if (all.length === 0) return ''
  if (all.length === 1) return all[0]
  return JSON.stringify(all)
}

function parseExistingImages(raw) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(u => typeof u === 'string') : []
  } catch {
    // Eski format — bitta URL string sifatida yuborilgan bo'lishi mumkin
    return typeof raw === 'string' ? [raw] : []
  }
}

async function create(req, res) {
  try {
    const existingUrls = parseExistingImages(req.body.existingImages)
    const files = req.files || []
    const newUrls = await Promise.all(files.map(f => uploadImageToSupabase(f, 'news')))
    const imageUrl = buildImageValue(existingUrls, newUrls)

    const { title, content, category, videoId } = req.body
    const shortsUrl = req.body.shortsUrl || ''
    res.json(await News.create({ title, content, category, image: imageUrl, shortsUrl, videoId: videoId || '' }))
  } catch (e) { fail(req, res, 400, e) }
}

async function update(req, res) {
  try {
    const existingUrls = parseExistingImages(req.body.existingImages)
    const files = req.files || []
    const newUrls = await Promise.all(files.map(f => uploadImageToSupabase(f, 'news')))
    const imageUrl = buildImageValue(existingUrls, newUrls)

    const { title, content, category, videoId } = req.body
    const shortsUrl = req.body.shortsUrl || ''
    res.json(await News.findByIdAndUpdate(req.params.id,
      { title, content, category, image: imageUrl, shortsUrl, videoId: videoId || '' },
      { new: true, runValidators: true }
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