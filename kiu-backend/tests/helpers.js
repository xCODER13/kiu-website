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
  process.env.ADMIN_PASSWORD_HASH = hash
  return hash
}

module.exports = { getAuthToken, setAdminPassword }