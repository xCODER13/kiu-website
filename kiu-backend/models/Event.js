const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 300 },
  desc: { type: String, default: '', maxlength: 3000 },
  // Avval `date` ("28") va `month` ("mart") alohida matn maydonlari edi —
  // yil umuman saqlanmas edi. Endi bitta haqiqiy Date maydoni — kun, oy,
  // YIL hammasi birga saqlanadi.
  eventDate: { type: Date, required: true },
  type: { type: String, default: 'general', maxlength: 50 },
  image: { type: String, default: '', maxlength: 1000 },
  // News'dagi bilan bir xil naqsh — tadbir kartasi bosilib, to'liq tavsif
  // modali ochilganda oshiriladi (Events.jsx). Admin statistikasida "eng ko'p
  // ko'rilgan tadbirlar" grafigi uchun ishlatiladi.
  views: { type: Number, default: 0 },
}, { timestamps: true })

// Tadbirlar taqvimi — eng yaqin tadbir birinchi chiqishi uchun eventDate bo'yicha sort qilinadi
EventSchema.index({ eventDate: 1 })

module.exports = mongoose.model('Event', EventSchema)