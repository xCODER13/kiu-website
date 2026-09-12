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

  test("POST /api/teachers — noto'g'ri email bilan 400 qaytaradi", async () => {
    const token = getAuthToken()
    const res = await request(app)
      .post('/api/teachers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ism Familiya', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi', email: 'notogri' })
    expect(res.status).toBe(400)
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