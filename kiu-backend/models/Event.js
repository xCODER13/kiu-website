const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 300 },
  desc: { type: String, default: '', maxlength: 3000 },
  date: { type: String, required: true, maxlength: 50 },
  month: { type: String, required: true, maxlength: 50 },
  type: { type: String, default: 'general', maxlength: 50 },
  image: { type: String, default: '', maxlength: 1000 },
}, { timestamps: true })

// GET /api/events har doim createdAt bo'yicha sort qiladi — indeks shu so'rovni tezlashtiradi
EventSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Event', EventSchema)