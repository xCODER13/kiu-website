const mongoose = require('mongoose')

// SortingHat ("Sehrli Shlyapa") testini topshirgan har bir foydalanuvchining
// natijasi — ism, telefon va tavsiya etilgan yo'nalishlar ro'yxati. Avval bu
// ma'lumot faqat Telegram'ga xabar sifatida yuborilar edi, DB'da umuman
// saqlanmasdi (miscController.js). Endi admin statistikasida "eng ko'p
// tavsiya etilgan fakultetlar" grafigini chizish uchun shu yerda saqlanadi —
// Applications'dagi kabi to'liq (ism+telefon bilan), keyinchalik kerak bo'lsa
// individual natijalarni ham ko'rish/eksport qilish imkoni qoldirilsin deb.
//
// DIQQAT (xavfsizlik): bu — PII (ism+telefon) saqlaydigan yana bir kolleksiya.
// Yozish yo'li (miscController.sortingHatLead) ataylab bo'sh (auth'siz)
// endpoint — formLimiter bilan cheklangan. O'qish faqat admin statistikasi
// endpointlari orqali, ular hammasi `auth` middleware bilan himoyalangan
// (routes/stats.routes.js) — individual yozuvlar hech qachon public javobda
// qaytarilmasin, faqat agregatsiya (fakultet bo'yicha sanoq) qaytariladi.
const SortingHatLeadSchema = new mongoose.Schema({
  name:  { type: String, required: true, maxlength: 200 },
  phone: { type: String, required: true, maxlength: 30 },
  // Frontenddagi qat'iy FACULTIES ro'yxatidan keladi (Data.jsx), lekin bu
  // yerda ham (Application.faculty kabi) erkin matn sifatida saqlanadi —
  // backend frontend ro'yxatiga qattiq bog'lanmasin (u o'zgarsa, bu model
  // o'zgarishga muhtoj bo'lmaydi). Suiiste'moldan himoya uchun uzunlik
  // cheklovlari qo'yilgan.
  faculties: {
    type: [String],
    default: [],
    validate: {
      validator: arr => Array.isArray(arr) && arr.length <= 10 && arr.every(f => typeof f === 'string' && f.length <= 200),
      message: "Yo'nalishlar ro'yxati noto'g'ri formatda",
    },
  },
}, { timestamps: true })

// Admin statistikasi $unwind + $group bilan fakultet bo'yicha agregatsiya
// qiladi va sana oralig'i bo'yicha filtrlashi mumkin — createdAt indeksi shu
// so'rovlarni tezlashtiradi (News/Event/Application'dagi kabi konvensiya).
SortingHatLeadSchema.index({ createdAt: -1 })

module.exports = mongoose.model('SortingHatLead', SortingHatLeadSchema)
