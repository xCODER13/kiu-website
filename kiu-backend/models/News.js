const mongoose = require('mongoose')
const { NEWS_CATEGORIES } = require('../utils/newsCategories')

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 300 },
  content: { type: String, default: '', maxlength: 50000 },
  // Kichik harfga keltiriladi ("Umumiy" → "umumiy") va ro'yxatdan tashqari qiymat rad etiladi (10.4).
  // Eski hujjatlardagi boshqa qiymatlar o'qishga ta'sir qilmaydi — tekshiruv faqat yozishda.
  category: { type: String, default: 'umumiy', trim: true, lowercase: true, enum: { values: NEWS_CATEGORIES, message: "Noma'lum kategoriya" } },
  image: { type: String, default: '', maxlength: 5000 },
  shortsUrl: { type: String, default: '', maxlength: 500 },
  // Ommaviy sahifada `youtube.com/embed/${videoId}` ga qo'yiladi — faqat 11 belgili YouTube ID (yoki bo'sh).
  videoId: {
    type: String,
    default: '',
    validate: { validator: v => !v || /^[\w-]{11}$/.test(v), message: "videoId noto'g'ri formatda (11 belgili YouTube ID kerak)" },
  },
  views: { type: Number, default: 0 },
}, { timestamps: true })

// GET /api/news har doim createdAt bo'yicha sort qiladi — indeks shu so'rovni tezlashtiradi
NewsSchema.index({ createdAt: -1 })

module.exports = mongoose.model('News', NewsSchema)