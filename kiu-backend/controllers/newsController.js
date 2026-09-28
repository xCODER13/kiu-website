const News = require('../models/News')
const { fail } = require('../middleware/errorHandler')
const { uploadImagesToSupabase, deleteSupabaseImages } = require('../services/supabaseUpload')
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
  // Fayl(lar) muvaffaqiyatli Storage'ga yuklangan bo'lishi mumkin, lekin
  // shundan keyingi DB yozuvi (validatsiya va h.k. sabab) muvaffaqiyatsiz
  // bo'lishi mumkin — shu holatda ularni "yetim" qoldirmaslik uchun bu yerda
  // ham tozalaymiz. (Qisman-yuklash holatini — bir nechta fayldan biri
  // muvaffaqiyatsiz bo'lganda — `uploadImagesToSupabase`ning o'zi ichida
  // hal qiladi.)
  let uploadedPaths = []
  try {
    const existingUrls = parseExistingImages(req.body.existingImages)
    const files = req.files || []
    const { urls: newUrls, paths } = await uploadImagesToSupabase(files, 'news')
    uploadedPaths = paths
    const imageUrl = buildImageValue(existingUrls, newUrls)

    const { title, content, category, videoId } = req.body
    const shortsUrl = req.body.shortsUrl || ''
    res.json(await News.create({ title, content, category, image: imageUrl, shortsUrl, videoId: videoId || '' }))
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

async function update(req, res) {
  let uploadedPaths = []
  try {
    const existingUrls = parseExistingImages(req.body.existingImages)
    const files = req.files || []
    const { urls: newUrls, paths } = await uploadImagesToSupabase(files, 'news')
    uploadedPaths = paths
    const imageUrl = buildImageValue(existingUrls, newUrls)

    const { title, content, category, videoId } = req.body
    const shortsUrl = req.body.shortsUrl || ''
    const updated = await News.findByIdAndUpdate(req.params.id,
      { title, content, category, image: imageUrl, shortsUrl, videoId: videoId || '' },
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