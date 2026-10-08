const path = require('path')
const mongoose = require('mongoose')
const { assertSafeTestUri } = require('./testDbGuard')
const { resetCache: resetAdminSessionsCache } = require('../services/adminSessions')

// `.env.test` (agar mavjud bo'lsa) — faqat TEST_MONGODB_URI uchun. Mavjud env
// o'zgaruvchilarni (masalan CI'da berilganini) bosib o'tmaydi. `quiet` — dotenv shovqinsiz.
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test'), quiet: true })

jest.setTimeout(60000)

process.env.LOG_LEVEL = 'silent' // testlarda loglarni ko'rmaslik uchun
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-kamida-64-belgili-boo-boo-boo-boo-boo-boo-boo'
process.env.ADMIN_USERNAME = 'testadmin'

// Ataylab TEST_MONGODB_URI (MONGODB_URI emas): shell'da production URI eksport
// qilingan bo'lsa ham testlar unga tasodifan ulanmasin. Guard — yana bir himoya.
const TEST_MONGODB_URI = assertSafeTestUri(
  process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27018/kiu-test'
)

async function connectWithRetry(uri, retries = 10, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      // runtimeAdapters: mongodb@7.6.0 Jest ichida `await import('os')` ni bajara olmaydi va
      // handshake'da `driver` bo'limi tushib qoladi (NODE-7832) — `os` ni o'zimiz beramiz.
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000, runtimeAdapters: { os: require('os') } })
      return
    } catch (err) {
      if (i === retries - 1) throw err
      // Har urinishdan keyin ulanishni to'liq yopamiz — aks holda Mongo hali
      // ishga tushmagan paytdagi tez-tez qayta urinishlar driver metadata'sini
      // buzadi ("Missing required sub-document 'driver'").
      await mongoose.disconnect().catch(() => {})
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
}

beforeAll(async () => {
  process.env.MONGODB_URI = TEST_MONGODB_URI
  await connectWithRetry(TEST_MONGODB_URI)
})

afterEach(async () => {
  // `auth` DB'dagi chegaralarni 30 soniya keshlaydi — testlar orasida qolib ketmasin.
  resetAdminSessionsCache()
  delete process.env.ADMIN_PASSWORD_HASH
  delete process.env.ADMIN_PASSWORD_CHANGED_AT
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
  // `settings` kolleksiyasining Mongoose modeli yo'q (controller/helper uni raw
  // `db.collection()` orqali ishlatadi), shuning uchun yuqoridagi sikl uni tozalamaydi.
  // Tozalanmasa oldingi testda yozilgan admin parol hash'i keyingi testga o'tib,
  // login'dagi DB'dan qayta yuklash (refreshAdminSettingsFromDb) uni tiklab yuboradi.
  await mongoose.connection.db.collection('settings').deleteMany({})
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})