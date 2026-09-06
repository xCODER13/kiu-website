const mongoose = require('mongoose')

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  dept: { type: String, required: true },
  avatar: { type: String, default: '' },
  email: {
    type: String,
    default: '',
    validate: { validator: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Email manzil noto'g'ri formatda" },
  },
  image: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Teacher', TeacherSchema)