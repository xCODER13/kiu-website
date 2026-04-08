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

module.exports = mongoose.model('News', NewsSchema)