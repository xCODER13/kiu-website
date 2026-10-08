const mongoose = require('mongoose')
const { DEPARTMENTS } = require('../utils/departments')

// Eslatma: `email` maydoni ataylab olib tashlangan (shaxsiy ma'lumot — ommaviy API'da bo'lmasligi kerak).
// Eski hujjatlarda qolgan bo'lsa, controller `.select(PUBLIC_FIELDS_EXCLUDE)` bilan javobdan chiqarib tashlaydi.
const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 200 },
  role: { type: String, required: true, maxlength: 200 },
  dept: { type: String, required: true, trim: true, enum: DEPARTMENTS },
  // Bosh harflar (qo'lda kiritiladi): frontend `TEACHER_AVATAR_MAX = 2` bilan bir xil (1.5)
  avatar: { type: String, default: '', maxlength: 2 },
  image: { type: String, default: '', maxlength: 1000 },
}, { timestamps: true })

module.exports = mongoose.model('Teacher', TeacherSchema)