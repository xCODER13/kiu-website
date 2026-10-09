const crypto = require('crypto')
const ViewLog = require('../models/ViewLog')

// HMAC kaliti JWT_SECRET'dan "domen ajratish" prefiksi bilan olinadi: alohida sozlama kerak emas,
// lekin JWT imzolash kaliti bilan bir xil qiymat ham ishlatilmaydi.
function viewKey(resource, id, ip) {
  const secret = `view-dedupe:${process.env.JWT_SECRET || ''}`
  return crypto.createHmac('sha256', secret).update(`${resource}:${id}:${ip}`).digest('hex')
}

// true — bu tashrifchi (IP) bu resursni oxirgi 24 soatda hali ko'rmagan: ko'rish SANALADI.
// false — takror: sanalmaydi (javob baribir muvaffaqiyatli — hisoblagich holati sirtga chiqmaydi).
async function shouldCountView(req, resource, id) {
  try {
    await ViewLog.create({ key: viewKey(resource, id, req.ip) })
    return true
  } catch (e) {
    if (e && e.code === 11000) return false
    // Jurnal yozilmasa (DB nosozligi) ko'rishni yo'qotmaymiz: sanaymiz, lekin xatoni qayd etamiz.
    req.log.warn({ err: { name: e?.name, code: e?.code } }, '[VIEW] Takrorlanish jurnali yozilmadi')
    return true
  }
}

module.exports = { shouldCountView, viewKey }
