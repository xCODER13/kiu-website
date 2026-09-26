const request = require('supertest')
const app = require('../app')
const { getAuthToken, setAdminPassword } = require('./helpers')

describe('POST /api/admin/change-password', () => {
  test('token berilmasa 401 qaytaradi', async () => {
    const res = await request(app)
      .post('/api/admin/change-password')
      .send({ currentPassword: 'x', newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(401)
  })

  test('currentPassword berilmasa 400 qaytaradi (500 emas)', async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/joriy parol/i)
  })

  test('newPassword berilmasa 400 qaytaradi', async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'joriy_parol_123' })
    expect(res.status).toBe(400)
  })

  test("newPassword 8 ta belgidan qisqa bo'lsa 400 qaytaradi", async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'joriy_parol_123', newPassword: 'qisqa' })
    expect(res.status).toBe(400)
  })

  test("noto'g'ri currentPassword bilan 401 qaytaradi", async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'notogri_parol', newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(401)
  })

  test("to'g'ri ma'lumotlar bilan parolni almashtiradi (200, success:true)", async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'joriy_parol_123', newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  test('parol almashtirilgach, ESKI parol bilan login endi ishlamaydi', async () => {
    await setAdminPassword('eski_parol_123')
    await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'eski_parol_123', newPassword: 'yangi_parol_456' })

    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: process.env.ADMIN_USERNAME, password: 'eski_parol_123' })
    expect(res.status).toBe(401)
  })

  test('parol almashtirilgach, YANGI parol bilan login ishlaydi', async () => {
    await setAdminPassword('eski_parol_123')
    await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'eski_parol_123', newPassword: 'yangi_parol_456' })

    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: process.env.ADMIN_USERNAME, password: 'yangi_parol_456' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  test('parol almashtirilgandan OLDIN chiqarilgan token endi rad etiladi', async () => {
    await setAdminPassword('eski_parol_123')
    // Bu token parol o'zgarishidan oldin "chiqarilgan" — iat joriy vaqt
    const oldToken = getAuthToken()

    await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${oldToken}`)
      .send({ currentPassword: 'eski_parol_123', newPassword: 'yangi_parol_456' })

    // Shu (parol o'zgarishidan oldingi) token bilan boshqa himoyalangan
    // endpointga so'rov — endi rad etilishi kerak
    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${oldToken}`)
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/sessiya|eskirgan/i)
  })

  test('parol almashtirilgandan KEYIN chiqarilgan token ishlashda davom etadi', async () => {
    await setAdminPassword('eski_parol_123')
    await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'eski_parol_123', newPassword: 'yangi_parol_456' })

    // Parol o'zgargandan KEYIN olingan yangi token
    const newLoginRes = await request(app)
      .post('/api/admin/login')
      .send({ username: process.env.ADMIN_USERNAME, password: 'yangi_parol_456' })
    const freshToken = newLoginRes.body.token

    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${freshToken}`)
    expect(res.status).not.toBe(401)
  })

  test("ortiqcha urinishlardan keyin rate limiter 429 qaytaradi", async () => {
    await setAdminPassword('joriy_parol_123')
    const token = getAuthToken()
    let lastStatus
    for (let i = 0; i < 6; i++) {
      const res = await request(app)
        .post('/api/admin/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'notogri', newPassword: 'yangi_parol_123' })
      lastStatus = res.status
    }
    expect(lastStatus).toBe(429)
  })
})