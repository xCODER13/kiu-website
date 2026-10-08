// 1.5 (DESIGN.md 10.4): Teacher.dept — 5 kafedradan biri, Teacher.avatar — ko'pi bilan 2 belgi,
// GET /api/teachers/departments — ro'yxatni beradi. Eski qiymatlar o'zgarmasdan qaytsa tahrirlash bloklanmaydi.
const fs = require('fs')
const path = require('path')
const request = require('supertest')
const app = require('../app')
const Teacher = require('../models/Teacher')
const { DEPARTMENTS } = require('../utils/departments')
const { getAuthToken } = require('./helpers')

let auth
beforeAll(() => { auth = { Authorization: `Bearer ${getAuthToken()}` } })

const base = { name: 'Ism Familiya', role: "O'qituvchi", dept: DEPARTMENTS[0] }
const post = body => request(app).post('/api/teachers').set(auth).send({ ...base, ...body })
const put = (id, body) => request(app).put(`/api/teachers/${id}`).set(auth).send({ ...base, ...body })

async function insertLegacy(fields) {
  const ins = await Teacher.collection.insertOne({ name: 'Eski', role: 'R', dept: DEPARTMENTS[0], avatar: '', image: '', createdAt: new Date(), updatedAt: new Date(), ...fields })
  return ins.insertedId
}

describe('GET /api/teachers/departments', () => {
  test("auth talab qilmaydi va ro'yxatni qaytaradi", async () => {
    const res = await request(app).get('/api/teachers/departments')
    expect(res.status).toBe(200)
    expect(res.body).toEqual(DEPARTMENTS)
    expect(res.body).toHaveLength(5)
  })

  test("`/departments` ID sifatida talqin qilinmaydi (GET / bilan to'qnashmaydi)", async () => {
    await Teacher.create({ ...base })
    expect((await request(app).get('/api/teachers')).body).toHaveLength(1)
  })

  test("ro'yxat frontend `KAFEDRALAR` bilan bir xil (tartibi ham)", () => {
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'pages', 'admin', 'shared', 'constants.js'), 'utf8')
    const block = src.match(/export const KAFEDRALAR = \[([\s\S]*?)\n\]/)[1]
    const values = [...block.matchAll(/'([^']+)'|"([^"]+)"/g)].map(m => m[1] || m[2])
    expect(values).toEqual(DEPARTMENTS)
  })
})

describe('Teacher.dept', () => {
  test('har bir kafedra qabul qilinadi', async () => {
    for (const dept of DEPARTMENTS) {
      const res = await post({ dept })
      expect(res.status).toBe(200)
      expect(res.body.dept).toBe(dept)
    }
  })

  test("POST: ro'yxatda yo'q kafedra 400, o'qituvchi yaratilmaydi", async () => {
    expect((await post({ dept: 'Informatika' })).status).toBe(400)
    expect((await post({ dept: '' })).status).toBe(400)
    expect(await Teacher.countDocuments()).toBe(0)
  })

  test("PUT: noto'g'ri kafedra 400, hujjat o'zgarmaydi", async () => {
    const t = await Teacher.create({ ...base })
    expect((await put(t._id, { name: 'Yangi', dept: 'Informatika' })).status).toBe(400)
    const after = await Teacher.findById(t._id)
    expect(after.name).toBe('Ism Familiya')
    expect(after.dept).toBe(DEPARTMENTS[0])
  })

  test("PUT: eski kafedra o'zgarmasdan qaytsa — tahrirlash o'tadi; o'zgartirilsa tekshiriladi", async () => {
    const id = await insertLegacy({ dept: 'Informatika' })
    const same = await put(id, { name: 'Yangilandi', dept: 'Informatika' })
    expect(same.status).toBe(200)
    expect(same.body.dept).toBe('Informatika')
    expect((await put(id, { dept: 'Boshqa' })).status).toBe(400)
    const fixed = await put(id, { dept: DEPARTMENTS[1] })
    expect(fixed.status).toBe(200)
    expect(fixed.body.dept).toBe(DEPARTMENTS[1])
  })
})

describe('Teacher.avatar', () => {
  test('1–2 belgi va bo\'sh qabul qilinadi', async () => {
    expect((await post({ avatar: 'AB' })).status).toBe(200)
    expect((await post({ avatar: 'A' })).status).toBe(200)
    expect((await post({ avatar: '' })).status).toBe(200)
    expect((await post({})).body.avatar).toBe('')
  })

  test('POST: 3 belgi 400 beradi', async () => {
    expect((await post({ avatar: 'ABC' })).status).toBe(400)
    expect(await Teacher.countDocuments()).toBe(0)
  })

  test("PUT: eski uzun avatar o'zgarmasdan qaytsa 200; o'zgartirilgan uzun qiymat 400", async () => {
    const id = await insertLegacy({ avatar: 'ABCDEFGHIJ' })
    const same = await put(id, { name: 'Yangilandi', avatar: 'ABCDEFGHIJ' })
    expect(same.status).toBe(200)
    expect(same.body.avatar).toBe('ABCDEFGHIJ')
    expect((await put(id, { avatar: 'XYZ' })).status).toBe(400)
    expect((await put(id, { avatar: 'XY' })).status).toBe(200)
  })
})
