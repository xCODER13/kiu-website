const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const logger = require('../logger')
const { fail } = require('../middleware/errorHandler')

async function login(req, res) {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Login va parol kerak' })

  if (username !== process.env.ADMIN_USERNAME)
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" })

  if (!process.env.ADMIN_PASSWORD_HASH) {
    logger.error('[SECURITY] ADMIN_PASSWORD_HASH topilmadi — settings collection tekshirilsin.')
    return res.status(500).json({ error: 'Admin paroli sozlanmagan. Server administratoriga murojaat qiling.' })
  }
  const passwordOk = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)

  if (!passwordOk) return res.status(401).json({ error: "Login yoki parol noto'g'ri" })

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body
  if (!newPassword || newPassword.length < 8)
    return res.status(400).json({ error: "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak" })

  if (!process.env.ADMIN_PASSWORD_HASH) {
    return res.status(500).json({ error: 'Admin paroli sozlanmagan. Server administratoriga murojaat qiling.' })
  }
  const currentOk = await bcrypt.compare(currentPassword, process.env.ADMIN_PASSWORD_HASH)

  if (!currentOk) return res.status(401).json({ error: "Joriy parol noto'g'ri" })

  try {
    const hash = await bcrypt.hash(newPassword, 12)

    await mongoose.connection.db.collection('settings').updateOne(
      { key: 'admin_password_hash' },
      { $set: { value: hash } },
      { upsert: true }
    )

    process.env.ADMIN_PASSWORD_HASH = hash

    res.json({ success: true })
  } catch (e) {
    fail(req, res, 500, e)
  }
}

module.exports = { login, changePassword }