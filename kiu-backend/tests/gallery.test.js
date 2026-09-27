const request = require('supertest')
const app = require('../app')
const Gallery = require('../models/Gallery')
const { getAuthToken } = require('./helpers')

describe('Gallery CRUD', () => {
  test("GET /api/gallery — auth talab qilmaydi, bo'sh ro'yxat qaytaradi", async () => {
    const res = await request(app).get('/api/gallery')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test("GET /api/gallery — createdAt bo'yicha kamayish tartibida saralaydi", async () => {
    const older = await Gallery.create({ title: 'Eski', images: ['https://x/1.jpg'] })
    const newer = await Gallery.create({ title: 'Yangi', images: ['https://x/2.jpg'] })
    const res = await request(app).get('/api/gallery')
    expect(res.body[0]._id).toBe(newer._id.toString())
    expect(res.body[1]._id).toBe(older._id.toString())
  })

  test('GET /api/gallery?limit= — berilsa, natijalar cheklanadi', async () => {
    for (let i = 0; i < 5; i++) await Gallery.create({ title: `Albom ${i}`, images: ['https://x/1.jpg'] })
    const res = await request(app).get('/api/gallery?limit=2')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  test("POST /api/gallery — auth'siz 401 qaytaradi", async () => {
    const res = await request(app).post('/api/gallery').send({ title: 'Test' })
    expect(res.status).toBe(401)
  })

  test('POST /api/gallery — rasmsiz 400 qaytaradi (kamida bitta rasm shart)', async () => {
    const token = getAuthToken()
    const res = await request(app)
      .post('/api/gallery')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Rasmsiz albom' })
    expect(res.status).toBe(400)
  })

  test('POST /api/gallery — existingImages orqali bir nechta URL saqlanadi (fayl yuklanmasa ham)', async () => {
    const token = getAuthToken()
    const urls = ['https://cdn.test/gallery/1.jpg', 'https://cdn.test/gallery/2.jpg']
    const res = await request(app)
      .post('/api/gallery')
      .set('Authorization', `Bearer ${token}`)
      .field('title', '1-kampus')
      .field('desc', 'Kampus binosi')
      .field('existingImages', JSON.stringify(urls))
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('1-kampus')
    expect(res.body.images).toEqual(urls)
  })

  test('POST /api/gallery — 10 tadan ortiq rasm rad etiladi (model validatsiyasi)', async () => {
    const token = getAuthToken()
    const urls = Array.from({ length: 11 }, (_, i) => `https://cdn.test/gallery/${i}.jpg`)
    const res = await request(app)
      .post('/api/gallery')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Ko\'p rasmli albom')
      .field('existingImages', JSON.stringify(urls))
    expect(res.status).toBe(400)
  })

  test('PUT /api/gallery/:id — mavjud albomni yangilaydi (title, desc, images)', async () => {
    const token = getAuthToken()
    const item = await Gallery.create({ title: 'Eski', desc: 'eski tavsif', images: ['https://x/1.jpg'] })
    const res = await request(app)
      .put(`/api/gallery/${item._id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Yangilangan')
      .field('desc', 'yangi tavsif')
      .field('existingImages', JSON.stringify(['https://x/1.jpg', 'https://x/2.jpg']))
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Yangilangan')
    expect(res.body.desc).toBe('yangi tavsif')
    expect(res.body.images).toEqual(['https://x/1.jpg', 'https://x/2.jpg'])
  })

  test("PUT /api/gallery/:id — mavjud bo'lmagan ID uchun 404 qaytaradi", async () => {
    const token = getAuthToken()
    const res = await request(app)
      .put('/api/gallery/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'X')
      .field('existingImages', JSON.stringify(['https://x/1.jpg']))
    expect(res.status).toBe(404)
  })

  test("PUT /api/gallery/:id — auth'siz 401 qaytaradi", async () => {
    const item = await Gallery.create({ title: 'Test', images: ['https://x/1.jpg'] })
    const res = await request(app).put(`/api/gallery/${item._id}`).send({ title: 'X' })
    expect(res.status).toBe(401)
  })

  test("DELETE /api/gallery/:id — auth'siz 401 qaytaradi", async () => {
    const item = await Gallery.create({ title: 'Test', images: ['https://x/1.jpg'] })
    const res = await request(app).delete(`/api/gallery/${item._id}`)
    expect(res.status).toBe(401)
  })

  test("DELETE /api/gallery/:id — auth bilan o'chiradi", async () => {
    const token = getAuthToken()
    const item = await Gallery.create({ title: "O'chiriladigan", images: ['https://x/1.jpg'] })
    const res = await request(app)
      .delete(`/api/gallery/${item._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(await Gallery.findById(item._id)).toBeNull()
  })

  test("DELETE /api/gallery/:id — noto'g'ri ID formati 400 qaytaradi", async () => {
    const token = getAuthToken()
    const res = await request(app)
      .delete('/api/gallery/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })
})