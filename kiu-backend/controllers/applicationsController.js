const Application = require('../models/Application')
const { fail } = require('../middleware/errorHandler')
const { sendTelegram, escapeTelegramHtml } = require('../services/telegram')

async function getAll(req, res) {
  try {
    const { type } = req.query
    let filter = {}
    if (type === 'vacancy') {
      filter = { type: 'vacancy' }
    } else if (type === 'admission') {
      filter = { type: 'admission' }
    }
    res.json(await Application.find(filter).sort({ createdAt: -1 }))
  } catch (e) { fail(req, res, 500, e) }
}

// Diqqat: barcha maydonlar foydalanuvchi tomonidan kiritiladi (public forma
// orqali), shuning uchun Telegram xabariga qo'shishdan oldin escapeTelegramHtml
// bilan tozalanadi — aks holda arizachi ism/xabar maydoniga <a href="..."> kabi
// teg yozib, adminning Telegram kanaliga soxta (bosiladigan) link yuborishi mumkin edi.
function buildTelegramMessage(application) {
  const isVacancy = application.type === 'vacancy'
  const name = escapeTelegramHtml(application.name)
  const phone = escapeTelegramHtml(application.phone)
  const email = escapeTelegramHtml(application.email)
  const position = escapeTelegramHtml(application.position)
  const faculty = escapeTelegramHtml(application.faculty)
  const education = escapeTelegramHtml(application.education)
  const experience = escapeTelegramHtml(application.experience)
  const message = escapeTelegramHtml(application.message?.slice(0, 200))

  let msg = ''
  if (isVacancy) {
    msg = "\uD83D\uDCCB Vakansiya arizasi\n\n\uD83D\uDC64 " + name + "\n\uD83D\uDCDE " + phone
    if (email) msg += "\n\uD83D\uDCE7 " + email
    if (position) msg += "\n\uD83D\uDCBC " + position
    if (faculty) msg += "\n\uD83C\uDFEB " + faculty
    if (education) msg += "\n\uD83C\uDF93 " + education
    if (experience) msg += "\n\uD83D\uDCC5 " + experience
    if (message) msg += "\n\uD83D\uDCAC " + message
  } else {
    msg = "\uD83C\uDF93 Qabul arizasi\n\n\uD83D\uDC64 " + name + "\n\uD83D\uDCDE " + phone
    if (email) msg += "\n\uD83D\uDCE7 " + email
    if (faculty) msg += "\n\uD83D\uDCDA " + faculty
    if (message) msg += "\n\uD83D\uDCAC " + message
  }
  return msg
}

// Mass assignment himoyasi: create() va update() shu ro'yxatdan foydalanadi —
// Application sxemasidagi foydalanuvchi/admin tahrirlashi mumkin bo'lgan barcha
// maydonlar. "status" bundan ataylab tashqarida: create() uni hech qachon
// client'dan olmaydi (har doim serverda 'new' qilib belgilanadi, aks holda
// so'rov yuboruvchi o'z arizasini to'g'ridan-to'g'ri "accepted" qilib yuborishi
// mumkin edi). Holatni faqat admin `update()` orqali o'zgartiradi.
const APPLICATION_FIELDS = ['name', 'phone', 'faculty', 'message', 'email', 'position', 'education', 'experience', 'type']

// Faqat vakansiya arizasida mazmunli maydonlar (1.7). Qabul arizasi formasi ularni yubormaydi (ApplyModal.jsx),
// shuning uchun `type: 'admission'` bilan kelsa e'tiborsiz qoldiriladi va SAQLANMAYDI — shaxsiy ma'lumotni
// (email) keraksiz yig'maslik. Admin panel va Telegram shabloni ham qabul arizasida ularni ko'rsatmaydi.
const VACANCY_ONLY_FIELDS = ['email', 'position', 'education', 'experience']

async function create(req, res) {
  try {
    const body = {}
    for (const field of APPLICATION_FIELDS) {
      if (req.body[field] !== undefined) body[field] = req.body[field]
    }
    if (!body.type || !['admission', 'vacancy'].includes(body.type)) body.type = 'admission'
    if (body.type !== 'vacancy') for (const field of VACANCY_ONLY_FIELDS) delete body[field]
    body.status = 'new'

    const application = await Application.create(body)
    sendTelegram(buildTelegramMessage(application))
    res.json(application)
  } catch (e) { fail(req, res, 400, e) }
}

// ── ADMIN FAQAT ARIZA HOLATINI O'ZGARTIRADI (DESIGN.md 10.4, 1.2) ──
// Avval PUT `APPLICATION_FIELDS + status` ni qabul qilardi: o'g'irlangan/xato admin token
// bilan arizachining ismi, telefoni, emaili, matni va turini o'zgartirish mumkin edi
// (shaxsiy ma'lumot). Admin panel esa faqat `{ status }` yuboradi. Endi `status` shart va
// ruxsat etilgan qiymatlardan biri bo'lishi kerak (aks holda 400); body'dagi boshqa hamma
// maydon e'tiborsiz qoldiriladi va saqlanmaydi. Arizachi ma'lumotlari faqat POST orqali kiradi.
const APPLICATION_STATUSES = Application.schema.path('status').enumValues

async function update(req, res) {
  try {
    const status = req.body && req.body.status
    // `typeof` tekshiruvi: `{ "status": { "$ne": null } }` kabi obyekt filtrga/yangilanishga o'tmasin
    if (typeof status !== 'string' || !APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Holat noto'g'ri" })
    }

    const updated = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ error: 'Topilmadi' })
    res.json(updated)
  } catch (e) { fail(req, res, 400, e) }
}

async function remove(req, res) {
  try {
    const deleted = await Application.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Topilmadi' })
    res.json({ success: true })
  } catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }