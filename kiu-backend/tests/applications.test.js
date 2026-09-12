const request = require('supertest')
const app = require('../app')
const Application = require('../models/Application')
const { getAuthToken } = require('./helpers')

describe('POST /api/applications (ochiq, autentifikatsiyasiz forma)', () => {
  test("to'g'ri ma'lumotlar bilan ariza yaratiladi, status har doim 'new' bo'ladi", async () => {
    const res = await request(app).post('/api/applications').send({
      name: 'Test Foydalanuvchi',
      phone: '+998901234567',
      faculty: 'Dasturiy injiniring',
      type: 'admission',
    })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('new')
  })

  test("client 'status' maydonini yuborsa ham e'tiborga olinmaydi", async () => {
    const res = await request(app).post('/api/applications').send({
      name: 'Yovuz Foydalanuvchi',
      phone: '+998901234567',
      status: 'accepted',
    })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('new')
    expect(res.body.status).not.toBe('accepted')

    const saved = await Application.findById(res.body._id)
    expect(saved.status).toBe('new')
  })

  test("whitelist'da yo'q qo'shimcha maydonlar e'tiborga olinmaydi", async () => {
    const res = await request(app).post('/api/applications').send({
      name: 'Test',
      phone: '+998901234567',
      isAdmin: true,
      _id: '000000000000000000000000',
    })
    expect(res.status).toBe(200)
    expect(res.body._id).not.toBe('000000000000000000000000')
  })

  test("noto'g'ri formatdagi telefon raqami bilan 400 qaytaradi", async () => {
    const res = await request(app).post('/api/applications').send({
      name: 'Test',
      phone: '12345',
    })
    expect(res.status).toBe(400)
  })

  test("noto'g'ri formatdagi email bilan 400 qaytaradi", async () => {
    const res = await request(app).post('/api/applications').send({
      name: 'Test',
      phone: '+998901234567',
      email: 'bu-email-emas',
    })
    expect(res.status).toBe(400)
  })

  test("type noto'g'ri qiymat bo'lsa, standart 'admission'ga tushadi", async () => {
    const res = await request(app).post('/api/applications').send({
      name: 'Test',
      phone: '+998901234567',
      type: 'notogri-qiymat',
    })
    expect(res.status).toBe(200)
    expect(res.body.type).toBe('admission')
  })
})

describe('GET /api/applications (admin, auth talab qiladi)', () => {
  test("auth'siz 401 qaytaradi", async () => {
    const res = await request(app).get('/api/applications')
    expect(res.status).toBe(401)
  })

  test("auth bilan ro'yxatni qaytaradi va type bo'yicha filtrlaydi", async () => {
    await Application.create({ name: 'A', phone: '+998901234567', type: 'admission' })
    await Application.create({ name: 'B', phone: '+998901234567', type: 'vacancy' })

    const token = getAuthToken()
    const res = await request(app)
      .get('/api/applications?type=vacancy')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].type).toBe('vacancy')
  })
})

describe('DELETE /api/applications/:id', () => {
  test("auth'siz 401 qaytaradi", async () => {
    const app1 = await Application.create({ name: 'A', phone: '+998901234567' })
    const res = await request(app).delete(`/api/applications/${app1._id}`)
    expect(res.status).toBe(401)
  })

  test("auth bilan arizani o'chiradi", async () => {
    const app1 = await Application.create({ name: 'A', phone: '+998901234567' })
    const token = getAuthToken()
    const res = await request(app)
      .delete(`/api/applications/${app1._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    const found = await Application.findById(app1._id)
    expect(found).toBeNull()
  })
})