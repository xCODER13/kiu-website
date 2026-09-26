const mongoose = require('mongoose')

jest.setTimeout(60000)

process.env.LOG_LEVEL = 'silent' // testlarda loglarni ko'rmaslik uchun
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-kamida-64-belgili-boo-boo-boo-boo-boo-boo-boo'
process.env.ADMIN_USERNAME = 'testadmin'

async function connectWithRetry(uri, retries = 10, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })
      return
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
}

beforeAll(async () => {
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/kiu-test'
  await connectWithRetry(process.env.MONGODB_URI)
})

afterEach(async () => {
  delete process.env.ADMIN_PASSWORD_HASH
  delete process.env.ADMIN_PASSWORD_CHANGED_AT
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})