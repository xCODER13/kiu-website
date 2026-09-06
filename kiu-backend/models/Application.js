const mongoose = require('mongoose')

// Frontend'dagi src/utils/validation.js bilan bir xil mantiq — 998 bilan boshlanuvchi
// 9 ta raqamli O'zbekiston telefon formati. Faqat POST /api/applications (yangi ariza,
// autentifikatsiyasiz forma) yo'lida ishlaydi — PUT /api/applications/:id runValidators
// ishlatmaydi, shuning uchun admin status yangilashiga ta'sir qilmaydi.
function isValidUzPhone(value) {
  const digits = (value || '').replace(/\D/g, '')
  if (!digits) return false
  const normalized = digits.startsWith('998') ? digits : (digits.length === 9 ? '998' + digits : digits)
  return /^998\d{9}$/.test(normalized)
}

const ApplicationSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  phone: {
    type: String,
    required: true,
    validate: { validator: isValidUzPhone, message: "Telefon raqam formati noto'g'ri (masalan: +998901234567)" },
  },
  faculty:    { type: String, default: '' },
  message:    { type: String, default: '' },
  email: {
    type: String,
    default: '',
    validate: { validator: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Email manzil noto'g'ri formatda" },
  },
  position:   { type: String, default: '' },
  education:  { type: String, default: '' },
  experience: { type: String, default: '' },
  type:       { type: String, default: 'admission', enum: ['admission', 'vacancy'] },
  status:     { type: String, default: 'new', enum: ['new', 'reviewed', 'accepted', 'rejected'] },
}, { timestamps: true })

// /api/stats va /api/applications ko'p marta {type,status} bo'yicha filtrlaydi va
// createdAt bo'yicha saralaydi. To'liq foyda uchun legacy (type maydonisiz) hujjatlarni
// backfill qilish kerak — bu keyingi bosqichdagi migratsiya bilan birga qilinadi.
ApplicationSchema.index({ type: 1, status: 1, createdAt: -1 })

module.exports = mongoose.model('Application', ApplicationSchema)