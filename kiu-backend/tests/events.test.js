const request = require('supertest')
const app = require('../app')
const Event = require('../models/Event')
const { getAuthToken } = require('./helpers')

describe('Events CRUD', () => {
  test('GET /api/events — auth talab qilmaydi', async () => {
    const res = await request(app).get('/api/events')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test("POST /api/events — auth'siz 401 qaytaradi", async () => {
    const res = await request(app).post('/api/events').send({ title: 'Test' })
    expect(res.status).toBe(401)
  })

  test('POST /api/events — majburiy maydonlar (title, date, month) yo\'q bo\'lsa 400', async () => {
    const token = getAuthToken()
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Faqat sarlavha' })
    expect(res.status).toBe(400)
  })

  test('POST /api/events — auth bilan tadbir yaratadi', async () => {
    const token = getAuthToken()
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ochiq eshiklar kuni', date: '28 mart', month: 'mart' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Ochiq eshiklar kuni')
  })

  test('PUT /api/events/:id — auth bilan yangilaydi', async () => {
    const event = await Event.create({ title: 'Eski', date: '1 yanvar', month: 'yanvar' })
    const token = getAuthToken()
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Yangilangan' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Yangilangan')
  })

  test('DELETE /api/events/:id — auth bilan o\'chiradi', async () => {
    const event = await Event.create({ title: 'Test', date: '1 yanvar', month: 'yanvar' })
    const token = getAuthToken()
    const res = await request(app)
      .delete(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(await Event.findById(event._id)).toBeNull()
  })
})