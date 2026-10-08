// Admin xavfsizlik jurnaliga yozish (3.7). Batafsil: models/AuditLog.js.
//
// Jurnal yozilmasa ham asosiy amal (login, o'chirish...) buzilmasligi kerak — shuning uchun xato yutiladi va faqat
// logga yoziladi. Lekin yozuv javobdan OLDIN kutiladi (await): shunda tekshiruv deterministik, va server javob
// berganidan keyin jarayon to'xtasa ham yozuv yo'qolmaydi. Narxi — bitta indekssiz insert (~1 ms).
const AuditLog = require('../models/AuditLog')
const logger = require('../logger')

async function record(event, req, { resource = '', targetId = '' } = {}) {
  try {
    await AuditLog.create({
      event,
      ip: String(req.ip || '').slice(0, 64),
      actor: typeof req.user?.username === 'string' ? req.user.username.slice(0, 100) : '',
      resource,
      targetId: String(targetId || '').slice(0, 64),
    })
  } catch (e) {
    logger.warn({ err: e, event }, "Audit jurnaliga yozib bo'lmadi")
  }
}

module.exports = { record }
