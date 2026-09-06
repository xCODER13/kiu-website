const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  date: { type: String, required: true },
  month: { type: String, required: true },
  type: { type: String, default: 'general' },
  image: { type: String, default: '' },
}, { timestamps: true })

// GET /api/events har doim createdAt bo'yicha sort qiladi — indeks shu so'rovni tezlashtiradi
EventSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Event', EventSchema)