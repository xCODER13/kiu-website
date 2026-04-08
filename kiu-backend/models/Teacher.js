const mongoose = require('mongoose')

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  dept: { type: String, required: true },
  avatar: { type: String, default: '' },
  email: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Teacher', TeacherSchema)