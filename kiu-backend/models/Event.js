const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  date: { type: String, required: true },
  month: { type: String, required: true },
  type: { type: String, default: 'general' },
}, { timestamps: true })

module.exports = mongoose.model('Event', EventSchema)