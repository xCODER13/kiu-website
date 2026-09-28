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

  test('POST /api/events — majburiy maydonlar (title, eventDate) yo\'q bo\'lsa 400', async () => {
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
      .send({ title: 'Ochiq eshiklar kuni', eventDate: '2026-03-28' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Ochiq eshiklar kuni')
  })

  test('PUT /api/events/:id — auth bilan yangilaydi', async () => {
    const event = await Event.create({ title: 'Eski', eventDate: '2026-01-01' })
    const token = getAuthToken()
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Yangilangan' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Yangilangan')
  })

  test('DELETE /api/events/:id — auth bilan o\'chiradi', async () => {
    const event = await Event.create({ title: 'Test', eventDate: '2026-01-01' })
    const token = getAuthToken()
    const res = await request(app)
      .delete(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(await Event.findById(event._id)).toBeNull()
  })

  // Band 6 (admin statistika — "eng ko'p ko'rilgan tadbirlar") uchun qo'shilgan.
  // News'dagi PUT /:id/view bilan bir xil naqsh — auth talab qilmaydi (public
  // tomondan, Events.jsx modal ochilganda chaqiriladi).
  test("PUT /api/events/:id/view — auth'siz ham ko'rishlar sonini oshiradi", async () => {
    const event = await Event.create({ title: 'Test', eventDate: '2026-01-01', views: 3 })
    const res = await request(app).put(`/api/events/${event._id}/view`)
    expect(res.status).toBe(200)
    expect((await Event.findById(event._id)).views).toBe(4)
  })

  test("PUT /api/events/:id/view — yangi tadbirda views standart 0 dan boshlanadi", async () => {
    const event = await Event.create({ title: 'Test2', eventDate: '2026-01-01' })
    expect(event.views).toBe(0)
    await request(app).put(`/api/events/${event._id}/view`)
    expect((await Event.findById(event._id)).views).toBe(1)
  })
})