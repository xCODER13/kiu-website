const request = require('supertest')
const app = require('../app')
const News = require('../models/News')
const { getAuthToken } = require('./helpers')

describe('News CRUD', () => {
  test("GET /api/news — auth talab qilmaydi, bo'sh ro'yxat qaytaradi", async () => {
    const res = await request(app).get('/api/news')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test("GET /api/news — createdAt bo'yicha kamayish tartibida saralaydi", async () => {
    const older = await News.create({ title: 'Eski' })
    const newer = await News.create({ title: 'Yangi' })
    const res = await request(app).get('/api/news')
    expect(res.body[0]._id).toBe(newer._id.toString())
    expect(res.body[1]._id).toBe(older._id.toString())
  })

  test('GET /api/news?limit= — berilsa, natijalar cheklanadi', async () => {
    for (let i = 0; i < 5; i++) await News.create({ title: `Yangilik ${i}` })
    const res = await request(app).get('/api/news?limit=2')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  test('GET /api/news?limit=&page= — ikkinchi sahifani qaytaradi', async () => {
    for (let i = 0; i < 5; i++) await News.create({ title: `Yangilik ${i}` })
    const page1 = await request(app).get('/api/news?limit=2&page=1')
    const page2 = await request(app).get('/api/news?limit=2&page=2')
    expect(page1.body).toHaveLength(2)
    expect(page2.body).toHaveLength(2)
    expect(page1.body[0]._id).not.toBe(page2.body[0]._id)
  })

  test('GET /api/news?limit=999 — 100 dan oshsa 100 ga cheklanadi', async () => {
    for (let i = 0; i < 5; i++) await News.create({ title: `Yangilik ${i}` })
    const res = await request(app).get('/api/news?limit=999')
    expect(res.body).toHaveLength(5) // umumiy son 100dan kam, shuning uchun hammasi qaytadi
  })

  test('GET /api/news?limit=0 — 0 falsy bo\'lgani uchun pagination qo\'llanmaydi', async () => {
    for (let i = 0; i < 3; i++) await News.create({ title: `Yangilik ${i}` })
    const res = await request(app).get('/api/news?limit=0')
    expect(res.body).toHaveLength(3) // limit e'tiborsiz qoldirilgani uchun hammasi qaytadi
  })

  test("POST /api/news — auth'siz 401 qaytaradi", async () => {
    const res = await request(app).post('/api/news').send({ title: 'Test' })
    expect(res.status).toBe(401)
  })

  test(
    "POST /api/news — rasm fayli YO'Q holatda ham ishlaydi (SUPABASE_URL sozlanmagan bo'lsada). " +
    "supabaseUpload.js'dagi lazy-init tuzatishining regressiya testi.",
    async () => {
      const token = getAuthToken()
      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test yangilik', content: 'Matn', category: 'umumiy' })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Test yangilik')
      expect(res.body.image).toBe('')
    }
  )

  test('POST /api/news — videoId va shortsUrl saqlanadi', async () => {
    const token = getAuthToken()
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Video', shortsUrl: 'https://youtube.com/shorts/abc', videoId: 'abc' })
    expect(res.status).toBe(200)
    expect(res.body.videoId).toBe('abc')
    expect(res.body.shortsUrl).toBe('https://youtube.com/shorts/abc')
  })

  test('PUT /api/news/:id — mavjud yangilikni yangilaydi', async () => {
    const token = getAuthToken()
    const news = await News.create({ title: 'Eski', content: 'eski matn', category: 'umumiy' })
    const res = await request(app)
      .put(`/api/news/${news._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Yangilangan', content: 'yangi matn', category: 'sport' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Yangilangan')
    expect(res.body.category).toBe('sport')
  })

  test('PUT /api/news/:id/view — ko\'rishlar sonini oshiradi', async () => {
    const news = await News.create({ title: 'Test', views: 5 })
    const res = await request(app).put(`/api/news/${news._id}/view`)
    expect(res.status).toBe(200)
    const updated = await News.findById(news._id)
    expect(updated.views).toBe(6)
  })

  test("GET /api/news/:id — mavjud bo'lmagan ID uchun 404 qaytaradi", async () => {
    const res = await request(app).get('/api/news/507f1f77bcf86cd799439011')
    expect(res.status).toBe(404)
  })

  test('GET /api/news/:id — mavjud hujjatni qaytaradi', async () => {
    const news = await News.create({ title: 'Topiladigan' })
    const res = await request(app).get(`/api/news/${news._id}`)
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Topiladigan')
  })

  test("DELETE /api/news/:id — auth'siz 401 qaytaradi", async () => {
    const news = await News.create({ title: 'Test' })
    const res = await request(app).delete(`/api/news/${news._id}`)
    expect(res.status).toBe(401)
  })

  test("DELETE /api/news/:id — auth bilan o'chiradi", async () => {
    const token = getAuthToken()
    const news = await News.create({ title: "O'chiriladigan" })
    const res = await request(app)
      .delete(`/api/news/${news._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(await News.findById(news._id)).toBeNull()
  })
})