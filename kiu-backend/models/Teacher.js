const mongoose = require('mongoose')

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 200 },
  role: { type: String, required: true, maxlength: 200 },
  dept: { type: String, required: true, maxlength: 200 },
  avatar: { type: String, default: '', maxlength: 20 },
  email: {
    type: String,
    default: '',
    maxlength: 200,
    validate: { validator: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Email manzil noto'g'ri formatda" },
  },
  image: { type: String, default: '', maxlength: 1000 },
}, { timestamps: true })

module.exports = mongoose.model('Teacher', TeacherSchema)