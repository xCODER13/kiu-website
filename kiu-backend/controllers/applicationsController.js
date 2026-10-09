const Application = require('../models/Application')
const { fail } = require('../middleware/errorHandler')
const audit = require('../services/auditLog')
const { sendTelegram, escapeTelegramHtml } = require('../services/telegram')
const { maskPhone } = require('../utils/phone')
const { parsePage } = require('../utils/pagination')

const APPLICATION_STATUSES = Application.schema.path('status').enumValues
const LIST_PAGE_SIZE = 20
const LIST_PAGE_MAX = 50

// `type=admission` — `type` maydoni umuman yo'q eski hujjatlarni ham qamraydi (`$in: [.., null]` yo'q maydonga ham mos):
// ular qabul arizasi hisoblanadi (ilgari buni klient filtrlardi). scripts/backfill-application-type.js ularni
// `type: 'admission'` qilib bo'lgach, bu tolerantlikni olib tashlash mumkin.
function typeFilter(type) {
  if (type === 'vacancy') return { type: 'vacancy' }
  if (type === 'admission') return { type: { $in: ['admission', null] } }
  return {}
}

// GET /api/applications?type=&status=&page=&limit=
// - `page`/`limit` YO'Q bo'lsa — eski format (oddiy massiv), shuning uchun backend frontenddan oldin deploy qilinsa
//   hech narsa buzilmaydi. (Katta ro'yxatda shaxsiy ma'lumot sahifalarsiz qaytmasligi uchun frontend sahifalab so'raydi.)
// - `page` yoki `limit` bor — `{ items, total, page, limit, counts }`: `total` — joriy filtr (type+status) bo'yicha,
//   `counts` — faqat TYPE bo'yicha holatlar sanog'i (filtr chiplari uchun; `status` filtri ularni o'zgartirmaydi).
async function getAll(req, res) {
  try {
    const { type, status, page, limit } = req.query
    // `typeof`: status faqat ruxsat etilgan qiymatlardan biri (obyekt/massiv filtrga o'tmasin)
    if (status !== undefined && (typeof status !== 'string' || !APPLICATION_STATUSES.includes(status))) {
      return res.status(400).json({ error: "Holat noto'g'ri" })
    }
    // o'chirilganlar (4.5) ro'yxatda ko'rinmaydi
    const base = { ...Application.ACTIVE, ...typeFilter(type) }
    const filter = status ? { ...base, status } : base
    const columns = '-__v -deletedAt'
    const order = { createdAt: -1, _id: -1 } // `_id` — createdAt teng bo'lganda sahifalar barqaror

    if (page === undefined && limit === undefined) {
      return res.json(await Application.find(filter).select(columns).sort(order))
    }

    const paging = parsePage({ page, limit }, { defaultLimit: LIST_PAGE_SIZE, max: LIST_PAGE_MAX })
    const [items, total, grouped] = await Promise.all([
      Application.find(filter).select(columns).sort(order).skip(paging.skip).limit(paging.limit),
      Application.countDocuments(filter),
      Application.aggregate([{ $match: base }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    ])
    const counts = { all: 0, new: 0, reviewed: 0, accepted: 0, rejected: 0 }
    for (const g of grouped) {
      if (g._id in counts) counts[g._id] = g.n
      counts.all += g.n
    }
    res.json({ items, total, page: paging.page, limit: paging.limit, counts })
  } catch (e) { fail(req, res, 500, e) }
}

// Diqqat: barcha maydonlar foydalanuvchi tomonidan kiritiladi (public forma
// orqali), shuning uchun Telegram xabariga qo'shishdan oldin escapeTelegramHtml
// bilan tozalanadi — aks holda arizachi ism/xabar maydoniga <a href="..."> kabi
// teg yozib, adminning Telegram kanaliga soxta (bosiladigan) link yuborishi mumkin edi.
// Telefon maskalanadi (4.3): Telegram — uchinchi tomon xizmati, xabarlar u yerda cheksiz saqlanadi.
// To'liq raqam faqat admin panelda (auth ortida) ko'rinadi.
function buildTelegramMessage(application) {
  const isVacancy = application.type === 'vacancy'
  const name = escapeTelegramHtml(application.name)
  const phone = escapeTelegramHtml(maskPhone(application.phone))
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

// Bir telefon raqamidan takroriy ariza chegarasi (4.3): oxirgi 24 soatda eng ko'pi bilan 3 ta
// (turidan qat'i nazar). IP bo'yicha formLimiter spamni IP almashtirib aylanib o'tish mumkin —
// bu esa bitta abonentni (yoki birovning raqamini) ariza bilan "bombalashni" to'xtatadi.
// Tekshiruv va yozish atomik emas: bir vaqtdagi parallel so'rovlar chegaradan 1-2 taga oshishi
// mumkin; formLimiter (10/15 daq/IP) buni cheklaydi, qat'iy kafolat kerak bo'lsa unique-indeks kerak.
const PHONE_WINDOW_MS = 24 * 60 * 60 * 1000
const PHONE_MAX_APPLICATIONS = 3

async function create(req, res) {
  try {
    const body = {}
    for (const field of APPLICATION_FIELDS) {
      if (req.body[field] !== undefined) body[field] = req.body[field]
    }
    if (!body.type || !['admission', 'vacancy'].includes(body.type)) body.type = 'admission'
    if (body.type !== 'vacancy') for (const field of VACANCY_ONLY_FIELDS) delete body[field]
    body.status = 'new'

    const application = new Application(body)
    // Avval validatsiya (noto'g'ri telefon 400 bo'lib qoladi va hisobga kirmaydi); `phoneKey`
    // validatsiya hook'ida to'ldiriladi — sanash aynan saqlanadigan qiymat bilan bo'ladi.
    await application.validate()

    // Atayin `Application.ACTIVE`siz: soft-deleted arizalar ham sanaladi — aks holda admin o'chirgach
    // spamer chegarani qaytadan aylanib o'tardi.
    const recent = await Application.countDocuments({
      phoneKey: application.phoneKey,
      createdAt: { $gte: new Date(Date.now() - PHONE_WINDOW_MS) },
    })
    if (recent >= PHONE_MAX_APPLICATIONS) {
      req.log.warn({ phone: maskPhone(application.phone), recent }, '[APPLICATION] Bir raqamdan takroriy ariza rad etildi')
      return res.status(429).json({ error: "Bu telefon raqamidan so'nggi 24 soatda juda ko'p ariza yuborilgan. Keyinroq urinib ko'ring." })
    }

    await application.save()
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
async function update(req, res) {
  try {
    const status = req.body && req.body.status
    // `typeof` tekshiruvi: `{ "status": { "$ne": null } }` kabi obyekt filtrga/yangilanishga o'tmasin
    if (typeof status !== 'string' || !APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Holat noto'g'ri" })
    }

    // O'chirilgan (4.5) arizaning holatini o'zgartirib bo'lmaydi — 404
    const updated = await Application.findOneAndUpdate({ _id: req.params.id, ...Application.ACTIVE }, { status }, { returnDocument: 'after', runValidators: true })
    if (!updated) return res.status(404).json({ error: 'Topilmadi' })
    res.json(updated)
  } catch (e) { fail(req, res, 400, e) }
}

async function remove(req, res) {
  try {
    // Soft delete (4.5): hujjat TRASH_DAYS kun turadi (xato bosilgan bo'lsa bazadan qo'lda tiklash mumkin:
    // `deletedAt: null`), keyin TTL indeks o'chiradi. Allaqachon o'chirilgan ariza — 404 (jurnalga yozilmaydi).
    const deleted = await Application.findOneAndUpdate(
      { _id: req.params.id, ...Application.ACTIVE },
      { $set: { deletedAt: new Date() } },
      { projection: { _id: 1 } }
    )
    if (!deleted) return res.status(404).json({ error: 'Topilmadi' })
    await audit.record('delete', req, { resource: 'applications', targetId: req.params.id })
    res.json({ success: true })
  } catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }