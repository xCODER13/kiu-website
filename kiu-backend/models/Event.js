const mongoose = require('mongoose')
const { EVENT_TYPES } = require('../utils/eventTypes')

// Tadbir sanasi oralig'i (1.4): `new Date('5')` kabi tasodifiy qiymatlar (1970-yil) va yil xatolari (0226, 20260) rad etiladi.
// Yuqori chegara — hozirdan 10 yil keyin (har tekshiruvda hisoblanadi).
const MIN_EVENT_DATE = new Date('2000-01-01T00:00:00.000Z')
const eventDateInRange = v => {
  const max = new Date()
  max.setFullYear(max.getFullYear() + 10)
  return v >= MIN_EVENT_DATE && v <= max
}

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 300 },
  desc: { type: String, default: '', maxlength: 3000 },
  // Avval `date` ("28") va `month` ("mart") alohida matn maydonlari edi —
  // yil umuman saqlanmas edi. Endi bitta haqiqiy Date maydoni — kun, oy,
  // YIL hammasi birga saqlanadi.
  eventDate: { type: Date, required: true, validate: { validator: eventDateInRange, message: "Tadbir sanasi 2000-yildan keyin va 10 yildan oshmagan bo'lishi kerak" } },
  type: { type: String, default: 'general', trim: true, lowercase: true, enum: EVENT_TYPES },
  image: { type: String, default: '', maxlength: 1000 },
  // News'dagi bilan bir xil naqsh — tadbir kartasi bosilib, to'liq tavsif
  // modali ochilganda oshiriladi (Events.jsx). Admin statistikasida "eng ko'p
  // ko'rilgan tadbirlar" grafigi uchun ishlatiladi.
  views: { type: Number, default: 0 },
}, { timestamps: true })

// Tadbirlar taqvimi — eng yaqin tadbir birinchi chiqishi uchun eventDate bo'yicha sort qilinadi
EventSchema.index({ eventDate: 1 })

module.exports = mongoose.model('Event', EventSchema)