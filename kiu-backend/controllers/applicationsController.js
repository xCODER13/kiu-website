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

async function create(req, res) {
  try {
    // Mass assignment himoyasi: faqat kerakli maydonlar qabul qilinadi.
    // "status" hech qachon client'dan olinmaydi — har doim serverda 'new' qilib belgilanadi,
    // aks holda so'rov yuboruvchi o'z arizasini to'g'ridan-to'g'ri "accepted" qilib yuborishi mumkin edi.
    const allowedFields = ['name', 'phone', 'faculty', 'message', 'email', 'position', 'education', 'experience', 'type']
    const body = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) body[field] = req.body[field]
    }
    if (!body.type || !['admission', 'vacancy'].includes(body.type)) body.type = 'admission'
    body.status = 'new'

    const application = await Application.create(body)
    sendTelegram(buildTelegramMessage(application))
    res.json(application)
  } catch (e) { fail(req, res, 400, e) }
}

async function update(req, res) {
  try { res.json(await Application.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })) }
  catch (e) { fail(req, res, 400, e) }
}

async function remove(req, res) {
  try { await Application.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }