const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const logger = require('../logger')
const { fail } = require('../middleware/errorHandler')

// Login javob vaqtini konstant qilish uchun — haqiqiy ADMIN_PASSWORD_HASH bilan
// bir xil "shakl"dagi (bcrypt, cost 12) dummy hash. Bu faqat vaqt o'lchamini bir
// xillashtirish uchun ishlatiladi, hech qanday haqiqiy parolga mos kelmaydi.
// Modul yuklanganda bir marta hisoblanadi (har so'rovda emas) — aks holda o'zi
// qo'shimcha kechikish qo'shib, foydasiz bo'lib qolardi.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-constant-time-compare', 12)

// server.js/config/db.js serverni ishga tushirishda ADMIN_PASSWORD_HASH'ni
// process.env'ga bir marta yuklaydi — bu tez, lekin agar bir nechta server
// instance ishlasa (masalan Render'da scaling yoqilsa), parol shu instance'da
// o'zgartirilsa, boshqa instance'lar eski qiymatni keshda saqlab qoladi va eski
// parolni ham qabul qilishda davom etadi. Login kam-kam chaqiriladigan
// (rate-limit qilingan) amal bo'lgani uchun, har safar DB'dan qayta o'qib kesh
// yangilanadi — bu holatni tuzatadi. `auth` middleware esa (har so'rovda
// ishlaydigan, yuqori chastotali) hamon kesh bilan ishlaydi — bu yerdagi
// bir nechta instance holatidagi qoldiq tavakkal pastroq (login kabi kredensial
// tekshiruvi emas, faqat eski token muddati tekshiruvi).
async function refreshAdminSettingsFromDb() {
  try {
    const [hashSetting, changedAtSetting] = await Promise.all([
      mongoose.connection.db.collection('settings').findOne({ key: 'admin_password_hash' }),
      mongoose.connection.db.collection('settings').findOne({ key: 'admin_password_changed_at' }),
    ])
    if (hashSetting?.value) process.env.ADMIN_PASSWORD_HASH = hashSetting.value
    if (changedAtSetting?.value) process.env.ADMIN_PASSWORD_CHANGED_AT = changedAtSetting.value
  } catch (e) {
    // DB vaqtincha mavjud bo'lmasa ham, joriy keshlangan qiymat bilan davom etamiz —
    // login butunlay ishlamay qolmasligi kerak faqat shu yangilanish sabab.
    logger.warn({ err: e }, 'Admin sozlamalarini DB\'dan yangilab bo\'lmadi — keshlangan qiymat ishlatilmoqda')
  }
}

async function login(req, res) {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Login va parol kerak' })

  await refreshAdminSettingsFromDb()

  if (!process.env.ADMIN_PASSWORD_HASH) {
    logger.error('[SECURITY] ADMIN_PASSWORD_HASH topilmadi — settings collection tekshirilsin.')
    return res.status(500).json({ error: 'Admin paroli sozlanmagan. Server administratoriga murojaat qiling.' })
  }

  // Diqqat: username noto'g'ri bo'lsa ham bcrypt.compare baribir chaqiriladi
  // (dummy hash bilan) — aks holda javob vaqti orqali ("noto'g'ri username" tezroq,
  // "to'g'ri username + noto'g'ri parol" sekinroq, chunki bcrypt ishlaydi) tashqi
  // kuzatuvchi to'g'ri admin username'ini javob vaqtini o'lchab bilib olishi mumkin edi.
  const usernameOk = username === process.env.ADMIN_USERNAME
  const passwordOk = await bcrypt.compare(password, usernameOk ? process.env.ADMIN_PASSWORD_HASH : DUMMY_HASH)

  if (!usernameOk || !passwordOk) return res.status(401).json({ error: "Login yoki parol noto'g'ri" })

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body
  // currentPassword bo'sh/undefined bo'lsa, bcrypt.compare o'ziga xos "Illegal
  // arguments" xatosi bilan yiqiladi (500 sifatida chiqadi) — shuning uchun
  // bcrypt'ga yetib borishdan oldin aniq 400 bilan rad etamiz.
  if (!currentPassword) return res.status(400).json({ error: 'Joriy parol kerak' })
  if (!newPassword || newPassword.length < 8)
    return res.status(400).json({ error: "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak" })

  await refreshAdminSettingsFromDb()

  if (!process.env.ADMIN_PASSWORD_HASH) {
    return res.status(500).json({ error: 'Admin paroli sozlanmagan. Server administratoriga murojaat qiling.' })
  }
  const currentOk = await bcrypt.compare(currentPassword, process.env.ADMIN_PASSWORD_HASH)

  if (!currentOk) return res.status(401).json({ error: "Joriy parol noto'g'ri" })

  try {
    const hash = await bcrypt.hash(newPassword, 12)
    const changedAt = new Date().toISOString()

    await mongoose.connection.db.collection('settings').bulkWrite([
      { updateOne: { filter: { key: 'admin_password_hash' }, update: { $set: { value: hash } }, upsert: true } },
      { updateOne: { filter: { key: 'admin_password_changed_at' }, update: { $set: { value: changedAt } }, upsert: true } },
    ])

    process.env.ADMIN_PASSWORD_HASH = hash
    // Parol o'zgartirilgan vaqtdan OLDIN chiqarilgan JWT tokenlar `auth`
    // middleware tomonidan endi rad etiladi (iat < passwordChangedAt) — aks
    // holda eski tokenlar muddati (7 kun) tugagunga qadar ishlashda davom
    // etardi, hatto parol o'zgartirilgandan keyin ham.
    process.env.ADMIN_PASSWORD_CHANGED_AT = changedAt

    res.json({ success: true })
  } catch (e) {
    fail(req, res, 500, e)
  }
}

module.exports = { login, changePassword }