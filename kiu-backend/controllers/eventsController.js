const Event = require('../models/Event')
const { fail } = require('../middleware/errorHandler')
const audit = require('../services/auditLog')
const { shouldCountView } = require('../services/viewDedupe')
const { applyPagination } = require('../utils/pagination')
const { uploadImagesToSupabase, deleteSupabaseImages } = require('../services/supabaseUpload')
const { rejectForeignImageUrls } = require('../utils/imageUrls')
const { removeStoredImages, removedUrls } = require('../services/imageCleanup')
const { omitUnchangedLegacy } = require('../utils/legacyValues')
const { EVENT_TYPES } = require('../utils/eventTypes')

async function getAll(req, res) {
  try {
    // Tadbirlar taqvimi — eng yaqin sanadagi tadbir birinchi chiqadi
    // (avval createdAt bo'yicha edi, ya'ni qo'shilish tartibi — voqea
    // qachon bo'lishiga aloqasi yo'q edi)
    const q = Event.find().sort({ eventDate: 1, _id: 1 })
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
    // `existingImage` faqat fayl yuborilmaganda ishlatiladi; fayl bo'lsa u e'tiborsiz (1.1)
    if (!req.file && rejectForeignImageUrls(req, res, [req.body.existingImage || ''])) return
    const resolved = await resolveImage(req, 'events')
    uploadedPaths = resolved.uploadedPaths
    const { title, desc, eventDate, type } = req.body
    res.json(await Event.create({ title, desc, eventDate, type, image: resolved.image }))
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

async function update(req, res) {
  let uploadedPaths = []
  try {
    const stored = await Event.findById(req.params.id).select('image type')
    if (!req.file && rejectForeignImageUrls(req, res, [req.body.existingImage || ''], stored ? [stored.image] : [])) return
    const resolved = await resolveImage(req, 'events')
    uploadedPaths = resolved.uploadedPaths
    const { title, desc, eventDate, type } = req.body
    // Eski (enum'dan oldin saqlangan) tur o'zgarmasdan qaytsa — tahrirlash bloklanmasin (utils/legacyValues.js)
    const fields = omitUnchangedLegacy({ title, desc, eventDate, type }, stored, { type: t => EVENT_TYPES.includes(t) })
    const updated = await Event.findByIdAndUpdate(req.params.id, { ...fields, image: resolved.image }, { returnDocument: 'after', runValidators: true })
    if (!updated) {
      if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
      return res.status(404).json({ error: 'Topilmadi' })
    }
    // DB yangilandi — almashtirilgan/olib tashlangan eski rasm Storage'dan o'chiriladi (2.1; xato bo'lsa faqat log)
    await removeStoredImages(req, removedUrls([stored && stored.image], [resolved.image]))
    res.json(updated)
  } catch (e) {
    if (uploadedPaths.length > 0) await deleteSupabaseImages(uploadedPaths).catch(() => {})
    fail(req, res, 400, e)
  }
}

// News.incrementView bilan bir xil naqsh (newsController.js) — tadbir kartasi
// bosilib, to'liq tavsif modali ochilganda chaqiriladi (Events.jsx).
async function incrementView(req, res) {
  try {
    // Bir tashrifchi (IP) bir resursni 24 soatda bir marta sanaydi (4.6). Mavjud bo'lmagan id uchun jurnal
    // yaratilmaydi (viewLimiter ostida ham bazani keraksiz yozuvlar bilan to'ldirib bo'lmasin).
    if (await Event.exists({ _id: req.params.id }) && await shouldCountView(req, 'events', req.params.id)) {
      await Event.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
    }
    res.json({ success: true })
  } catch (e) { fail(req, res, 500, e) }
}

async function remove(req, res) {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Topilmadi' })
    await removeStoredImages(req, [deleted.image]) // avval DB, keyin Storage (2.1)
    await audit.record('delete', req, { resource: 'events', targetId: req.params.id })
    res.json({ success: true })
  } catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, incrementView, remove }