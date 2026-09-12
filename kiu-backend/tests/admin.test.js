const request = require('supertest')
const app = require('../app')
const { setAdminPassword } = require('./helpers')

describe('POST /api/admin/login', () => {
  test('username yoki parol berilmasa 400 qaytaradi', async () => {
    const res = await request(app).post('/api/admin/login').send({})
    expect(res.status).toBe(400)
  })

  test("noto'g'ri username bilan 401 qaytaradi", async () => {
    await setAdminPassword('togri_parol_123')
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'notogri_user', password: 'togri_parol_123' })
    expect(res.status).toBe(401)
  })

  test("noto'g'ri parol bilan 401 qaytaradi", async () => {
    await setAdminPassword('togri_parol_123')
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: process.env.ADMIN_USERNAME, password: 'notogri_parol' })
    expect(res.status).toBe(401)
  })

  test("to'g'ri ma'lumotlar bilan 200 va JWT token qaytaradi", async () => {
    await setAdminPassword('togri_parol_123')
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: process.env.ADMIN_USERNAME, password: 'togri_parol_123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(typeof res.body.token).toBe('string')
  })

  test("ADMIN_PASSWORD_HASH sozlanmagan bo'lsa 500 qaytaradi", async () => {
    const original = process.env.ADMIN_PASSWORD_HASH
    delete process.env.ADMIN_PASSWORD_HASH
    try {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ username: process.env.ADMIN_USERNAME, password: 'har-qanday-parol' })
      expect(res.status).toBe(500)
    } finally {
      process.env.ADMIN_PASSWORD_HASH = original
    }
  })
})