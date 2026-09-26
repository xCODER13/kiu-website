const mongoose = require('mongoose')

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 300 },
  content: { type: String, default: '', maxlength: 50000 },
  category: { type: String, default: 'umumiy', maxlength: 50 },
  image: { type: String, default: '', maxlength: 5000 },
  shortsUrl: { type: String, default: '', maxlength: 500 },
  videoId: { type: String, default: '', maxlength: 50 },
  views: { type: Number, default: 0 },
}, { timestamps: true })

// GET /api/news har doim createdAt bo'yicha sort qiladi — indeks shu so'rovni tezlashtiradi
NewsSchema.index({ createdAt: -1 })

module.exports = mongoose.model('News', NewsSchema)