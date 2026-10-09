const mongoose = require('mongoose')
const { STUDENT_LIFE_SECTIONS } = require('../utils/studentLifeSections')

// Faqat `https://` havola: `javascript:`, `data:`, `http:` va bo'shliq/qo'shtirnoq/burchakli qavs qabul qilinmaydi
// (havola ommaviy sahifada `<a href>` ga tushadi — XSS/phishing yuzasi).
const SAFE_LINK = /^https:\/\/[^\s<>"'`\\]+$/i

const StudentLifeSchema = new mongoose.Schema({
  section: { type: String, required: true, trim: true, lowercase: true, enum: STUDENT_LIFE_SECTIONS },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  desc: { type: String, default: '', maxlength: 2000 },
  // Events/Teachers kabi bitta rasm; faqat bizning Storage'dagi URL (controller'da tekshiriladi, 1.1)
  image: { type: String, default: '', maxlength: 1000 },
  // Ixtiyoriy tashqi havola (klub Telegram kanali, Instagram va h.k.)
  link: {
    type: String, default: '', trim: true, maxlength: 300,
    validate: { validator: v => v === '' || SAFE_LINK.test(v), message: "Havola https:// bilan boshlanishi kerak" },
  },
  // Bo'lim ichidagi tartib (kichigi birinchi); bir xil bo'lsa — yangisi oldin
  order: {
    type: Number, default: 0, min: 0, max: 9999,
    validate: { validator: Number.isInteger, message: "Tartib raqami butun son bo'lishi kerak" },
  },
}, { timestamps: true })

// GET /api/student-life: section bo'yicha filtr + sort({ section, order, createdAt desc, _id desc })
StudentLifeSchema.index({ section: 1, order: 1, createdAt: -1 })

module.exports = mongoose.model('StudentLife', StudentLifeSchema)
