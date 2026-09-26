const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

function getAuthToken(username = 'admin') {
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

async function setAdminPassword(plainPassword) {
  const hash = await bcrypt.hash(plainPassword, 10)
  await mongoose.connection.db.collection('settings').updateOne(
    { key: 'admin_password_hash' },
    { $set: { value: hash } },
    { upsert: true }
  )
  // Har bir test o'z holatini nol nuqtadan boshlashi uchun — aks holda oldingi
  // testda o'rnatilgan ADMIN_PASSWORD_CHANGED_AT shu testga ta'sir qilishi mumkin.
  await mongoose.connection.db.collection('settings').deleteOne({ key: 'admin_password_changed_at' })
  process.env.ADMIN_PASSWORD_HASH = hash
  delete process.env.ADMIN_PASSWORD_CHANGED_AT
  return hash
}

module.exports = { getAuthToken, setAdminPassword }