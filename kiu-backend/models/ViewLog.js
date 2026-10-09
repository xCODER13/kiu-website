const mongoose = require('mongoose')

// Ko'rishlarni takrorlashdan himoya (4.6): "shu tashrifchi shu yangilik/tadbirni oxirgi 24 soatda
// ko'rgan" belgisi. `key` — HMAC(sir, resurs:id:IP): xom IP bazada SAQLANMAYDI (shaxsiy ma'lumot),
// kalitdan IP'ni qaytarib ham bo'lmaydi. Unique indeks parallel so'rovlarda ham bir marta sanashni
// kafolatlaydi (ikkinchi insert E11000 beradi), TTL indeks yozuvni VIEW_DEDUPE_HOURS dan keyin o'chiradi.
const VIEW_DEDUPE_HOURS = 24

const ViewLogSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: VIEW_DEDUPE_HOURS * 60 * 60 },
}, { versionKey: false })

const ViewLog = mongoose.model('ViewLog', ViewLogSchema)
ViewLog.VIEW_DEDUPE_HOURS = VIEW_DEDUPE_HOURS

module.exports = ViewLog
