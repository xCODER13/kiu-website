const request = require('supertest')
const app = require('../app')
const Teacher = require('../models/Teacher')
const { getAuthToken } = require('./helpers')

describe('Teachers CRUD', () => {
  test('GET /api/teachers — auth talab qilmaydi', async () => {
    const res = await request(app).get('/api/teachers')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test("POST /api/teachers — auth'siz 401 qaytaradi", async () => {
    const res = await request(app).post('/api/teachers').send({ name: 'Test' })
    expect(res.status).toBe(401)
  })

  test("POST /api/teachers — `email` yuborilsa ham saqlanmaydi va javobda yo'q", async () => {
    const token = getAuthToken()
    const res = await request(app)
      .post('/api/teachers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ism Familiya', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi', email: 'ali@kiu.uz' })
    expect(res.status).toBe(200)
    expect(res.body).not.toHaveProperty('email')
    const raw = await Teacher.collection.findOne({ _id: new (require('mongoose').Types.ObjectId)(res.body._id) })
    expect(raw).not.toHaveProperty('email')
  })

  test("GET /api/teachers — bazadagi eski `email` ommaviy javobga chiqmaydi", async () => {
    await Teacher.collection.insertOne({ name: 'Eski', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi', email: 'eski@kiu.uz', createdAt: new Date(), updatedAt: new Date() })
    const res = await request(app).get('/api/teachers')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Eski')
    expect(JSON.stringify(res.body)).not.toContain('eski@kiu.uz')
    expect(res.body[0]).not.toHaveProperty('email')
  })

  test("PUT /api/teachers/:id — eski `email` javobda qaytmaydi, yangi `email` qabul qilinmaydi", async () => {
    const ins = await Teacher.collection.insertOne({ name: 'Eski', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi', email: 'eski@kiu.uz', createdAt: new Date(), updatedAt: new Date() })
    const token = getAuthToken()
    const res = await request(app)
      .put(`/api/teachers/${ins.insertedId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Yangi', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi', email: 'yangi@kiu.uz' })
    expect(res.status).toBe(200)
    expect(res.body).not.toHaveProperty('email')
    expect(JSON.stringify(res.body)).not.toMatch(/@kiu\.uz/)
  })

  test("POST /api/teachers — auth bilan o'qituvchi yaratadi", async () => {
    const token = getAuthToken()
    const res = await request(app)
      .post('/api/teachers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ism Familiya', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Ism Familiya')
  })

  test("DELETE /api/teachers/:id — auth bilan o'chiradi", async () => {
    const teacher = await Teacher.create({ name: 'Test', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi' })
    const token = getAuthToken()
    const res = await request(app)
      .delete(`/api/teachers/${teacher._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(await Teacher.findById(teacher._id)).toBeNull()
  })
})
test("PUT /api/teachers/:id — auth bilan yangilaydi", async () => {
  const teacher = await Teacher.create({ name: 'Eski', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi' })
  const token = getAuthToken()
  const res = await request(app)
    .put(`/api/teachers/${teacher._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Yangilangan' })
  expect(res.status).toBe(200)
  expect(res.body.name).toBe('Yangilangan')
})
