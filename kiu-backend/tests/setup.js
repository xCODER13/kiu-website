const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-kamida-64-belgili-boo-boo-boo-boo-boo-boo-boo'
process.env.ADMIN_USERNAME = 'testadmin'
// SUPABASE_URL / SUPABASE_SERVICE_KEY ataylab BERILMAYDI — supabaseUpload.js'ning
// lazy-init tuzatishi shuni tekshiradi: rasm bilan bog'liq bo'lmagan route'lar
// (login, news CRUD matn bilan, va h.k.) baribir ishlashi kerak.
// BOT_TOKEN / CHANNEL_USERNAME ataylab BERILMAYDI — /api/telegram/posts
// sozlamasiz holatda 500 qaytarishini tekshirish uchun.

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  await mongoose.connect(process.env.MONGODB_URI)
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  if (mongod) await mongod.stop()
})
