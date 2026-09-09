const Application = require('../models/Application')
const { fail } = require('../middleware/errorHandler')
const { sendTelegram } = require('../services/telegram')

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

function buildTelegramMessage(application) {
  const isVacancy = application.type === 'vacancy'
  let msg = ''
  if (isVacancy) {
    msg = "\uD83D\uDCCB Vakansiya arizasi\n\n\uD83D\uDC64 " + application.name + "\n\uD83D\uDCDE " + application.phone
    if (application.email) msg += "\n\uD83D\uDCE7 " + application.email
    if (application.position) msg += "\n\uD83D\uDCBC " + application.position
    if (application.faculty) msg += "\n\uD83C\uDFEB " + application.faculty
    if (application.education) msg += "\n\uD83C\uDF93 " + application.education
    if (application.experience) msg += "\n\uD83D\uDCC5 " + application.experience
    if (application.message) msg += "\n\uD83D\uDCAC " + application.message.slice(0, 200)
  } else {
    msg = "\uD83C\uDF93 Qabul arizasi\n\n\uD83D\uDC64 " + application.name + "\n\uD83D\uDCDE " + application.phone
    if (application.email) msg += "\n\uD83D\uDCE7 " + application.email
    if (application.faculty) msg += "\n\uD83D\uDCDA " + application.faculty
    if (application.message) msg += "\n\uD83D\uDCAC " + application.message.slice(0, 200)
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
  try { res.json(await Application.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (e) { fail(req, res, 400, e) }
}

async function remove(req, res) {
  try { await Application.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }