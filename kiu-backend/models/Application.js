const mongoose = require('mongoose')

const { normalizeUzPhone } = require('../utils/phone')

// Frontend'dagi src/utils/validation.js bilan bir xil mantiq (utils/phone.js) — 998 bilan
// boshlanuvchi 9 ta raqamli O'zbekiston telefon formati. Ilgari PUT /api/applications/:id
// `runValidators` ishlatmagani uchun bu validator faqat POST (yangi ariza) yo'lida
// ishlar edi — endi (runValidators: true qo'shilgach) PUT orqali ham qo'llaniladi.
function isValidUzPhone(value) {
  return normalizeUzPhone(value) !== null
}

const ApplicationSchema = new mongoose.Schema({
  name:       { type: String, required: true, maxlength: 200 },
  phone: {
    type: String,
    required: true,
    maxlength: 30,
    validate: { validator: isValidUzPhone, message: "Telefon raqam formati noto'g'ri (masalan: +998901234567)" },
  },
  faculty:    { type: String, default: '', maxlength: 200 },
  message:    { type: String, default: '', maxlength: 3000 },
  email: {
    type: String,
    default: '',
    maxlength: 200,
    validate: { validator: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Email manzil noto'g'ri formatda" },
  },
  position:   { type: String, default: '', maxlength: 200 },
  education:  { type: String, default: '', maxlength: 100 },
  experience: { type: String, default: '', maxlength: 100 },
  type:       { type: String, default: 'admission', enum: ['admission', 'vacancy'] },
  status:     { type: String, default: 'new', enum: ['new', 'reviewed', 'accepted', 'rejected'] },
  // Normallashtirilgan telefon ("998901234567") — bir raqamdan takroriy arizani sanash uchun (4.3).
  // "+998 90 123 45 67" va "90 123 45 67" bir xil raqam. select:false va toJSON'dan olib tashlanadi:
  // admin ro'yxati ham, POST javobi ham bu texnik maydonni ko'rsatmaydi.
  phoneKey:   { type: String, select: false },
}, {
  timestamps: true,
  toJSON: { transform: (doc, ret) => { delete ret.phoneKey; return ret } },
})

ApplicationSchema.pre('validate', function () {
  this.phoneKey = normalizeUzPhone(this.phone) || undefined
})

// Takroriy ariza tekshiruvi: bir raqam + oxirgi 24 soat (applicationsController.create)
ApplicationSchema.index({ phoneKey: 1, createdAt: -1 })

// /api/stats va /api/applications ko'p marta {type,status} bo'yicha filtrlaydi va
// createdAt bo'yicha saralaydi. To'liq foyda uchun legacy (type maydonisiz) hujjatlarni
// backfill qilish kerak — bu keyingi bosqichdagi migratsiya bilan birga qilinadi.
ApplicationSchema.index({ type: 1, status: 1, createdAt: -1 })

module.exports = mongoose.model('Application', ApplicationSchema)