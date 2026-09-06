const mongoose = require('mongoose')

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  category: { type: String, default: 'umumiy' },
  image: { type: String, default: '' },
  shortsUrl: { type: String, default: '' },
  videoId: { type: String, default: '' },
  views: { type: Number, default: 0 },
}, { timestamps: true })

// GET /api/news har doim createdAt bo'yicha sort qiladi — indeks shu so'rovni tezlashtiradi
NewsSchema.index({ createdAt: -1 })

module.exports = mongoose.model('News', NewsSchema)