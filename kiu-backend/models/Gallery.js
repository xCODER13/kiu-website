const mongoose = require('mongoose')

// News'dagi eski `image` maydonidan farqli o'laroq (bo'sh/string/JSON-stringified
// massiv gibrid formati — faqat eski frontend bilan orqaga moslik uchun kerak
// edi), Gallery yangi resurs bo'lgani uchun hech qanday legacy consumer yo'q —
// shuning uchun to'g'ridan-to'g'ri massiv maydonidan foydalanamiz. Bu controller
// tomonida parseImages/JSON.stringify hiylalarisiz ishlaydi.
const GallerySchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  desc: { type: String, default: '', maxlength: 500 },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: v => Array.isArray(v) && v.length <= 10,
      message: 'Bitta albomda maksimal 10 ta rasm bo\'lishi mumkin',
    },
  },
}, { timestamps: true })

// GET /api/gallery har doim createdAt bo'yicha sort qiladi — indeks shu so'rovni tezlashtiradi
GallerySchema.index({ createdAt: -1 })

module.exports = mongoose.model('Gallery', GallerySchema)