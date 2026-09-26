// News / Events / Teachers: :id bilan ishlaydigan endpointlar. Xato ID (format noto'g'ri yoki
// bazada yo'q) 4xx bo'lishi va faqat kerakli hujjatga tegishi kerak. Rate limitlarga
// tushmaslik uchun har so'rov o'z IP'sidan yuboriladi.
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const News = require('../models/News')
const Event = require('../models/Event')
const Teacher = require('../models/Teacher')
const { getAuthToken } = require('./helpers')

let n = 0
const nextIp = () => `10.50.${Math.floor(++n / 250)}.${n % 250}`
const auth = () => ({ Authorization: `Bearer ${getAuthToken()}`, 'X-Forwarded-For': nextIp() })
const ghostId = () => new mongoose.Types.ObjectId().toString()
const BAD_ID = 'bu-id-emas'

const RESOURCES = [
  { name: 'news', path: '/api/news', Model: News, seed: { title: 'Asl' }, update: { title: 'Yangi' }, field: 'title' },
  { name: 'events', path: '/api/events', Model: Event, seed: { title: 'Asl', date: '1', month: 'Yan' }, update: { title: 'Yangi', date: '2', month: 'Fev' }, field: 'title' },
  { name: 'teachers', path: '/api/teachers', Model: Teacher, seed: { name: 'Asl', role: 'R', dept: 'D' }, update: { name: 'Yangi', role: 'R', dept: 'D' }, field: 'name' },
]

describe.each(RESOURCES)('$name — PUT/DELETE /:id', ({ path, Model, seed, update, field }) => {
  test("PUT: faqat nishon hujjat o'zgaradi, boshqasi tegilmaydi", async () => {
    const target = await Model.create(seed)
    const other = await Model.create(seed)

    const res = await request(app).put(`${path}/${target._id}`).set(auth()).send(update)
    expect(res.status).toBe(200)
    expect(res.body[field]).toBe('Yangi')
    expect((await Model.findById(other._id))[field]).toBe('Asl')
  })

  test("DELETE: faqat nishon hujjat o'chadi, boshqasi qoladi", async () => {
    const target = await Model.create(seed)
    const other = await Model.create(seed)

    expect((await request(app).delete(`${path}/${target._id}`).set(auth())).status).toBe(200)
    expect(await Model.findById(target._id)).toBeNull()
    expect(await Model.findById(other._id)).not.toBeNull()
  })

  test("PUT: ObjectId formatida bo'lmagan id 400 (500 emas)", async () => {
    const res = await request(app).put(`${path}/${BAD_ID}`).set(auth()).send(update)
    expect(res.status).toBe(400)
  })

  test("DELETE: bazada yo'q id idempotent — 200, hech narsa buzilmaydi", async () => {
    const keep = await Model.create(seed)
    expect((await request(app).delete(`${path}/${ghostId()}`).set(auth())).status).toBe(200)
    expect(await Model.countDocuments()).toBe(1)
    expect(await Model.findById(keep._id)).not.toBeNull()
  })

  // BILINGAN KAMCHILIKLAR. `.failing` tuzatilgach o'zi xabar beradi — shunda `.failing` ni olib tashlang.
  test("PUT: bazada yo'q id uchun 404 (hozir 200 va `null` qaytadi)", async () => {
    const res = await request(app).put(`${path}/${ghostId()}`).set(auth()).send(update)
    expect(res.status).toBe(404)
  })

  test("DELETE: ObjectId formatida bo'lmagan id 400/404 (hozir 500)", async () => {
    const res = await request(app).delete(`${path}/${BAD_ID}`).set(auth())
    expect([400, 404]).toContain(res.status)
  })
})

describe('news — GET /:id va PUT /:id/view', () => {
  test("PUT /:id/view: faqat nishon yangilikning ko'rishlari oshadi", async () => {
    const target = await News.create({ title: 'A' })
    const other = await News.create({ title: 'B' })
    await request(app).put(`/api/news/${target._id}/view`).set('X-Forwarded-For', nextIp())

    expect((await News.findById(target._id)).views).toBe(1)
    expect((await News.findById(other._id)).views).toBe(0)
  })

  test("PUT /:id/view: bazada yo'q id xato bermaydi (200), hech narsa yaratilmaydi", async () => {
    const res = await request(app).put(`/api/news/${ghostId()}/view`).set('X-Forwarded-For', nextIp())
    expect(res.status).toBe(200)
    expect(await News.countDocuments()).toBe(0)
  })

  test("GET /:id: ObjectId formatida bo'lmagan id 400/404 (hozir 500)", async () => {
    const res = await request(app).get(`/api/news/${BAD_ID}`).set('X-Forwarded-For', nextIp())
    expect([400, 404]).toContain(res.status)
  })

  test("PUT /:id/view: ObjectId formatida bo'lmagan id 400/404 (hozir 500)", async () => {
    const res = await request(app).put(`/api/news/${BAD_ID}/view`).set('X-Forwarded-For', nextIp())
    expect([400, 404]).toContain(res.status)
  })

  test("xato javoblarda ichki tafsilotlar (CastError, stack) mijozga sizib chiqmaydi", async () => {
    const res = await request(app).get(`/api/news/${BAD_ID}`).set('X-Forwarded-For', nextIp())
    expect(JSON.stringify(res.body)).not.toMatch(/CastError|ObjectId|stack|mongoose/i)
  })
})

describe('pagination — noto\'g\'ri qiymatlar (news, events, teachers uchun bir xil util)', () => {
  const at = (path, qs) => request(app).get(`${path}${qs}`).set('X-Forwarded-For', nextIp())

  // createdAt aniq va farqli beriladi: teng vaqtli hujjatlar bilan sort+skip tartibi
  // kafolatlanmaydi, test esa har doim bir xil natija berishi kerak.
  const at5 = i => new Date(Date.UTC(2026, 0, 1 + i))
  beforeEach(async () => {
    await News.collection.insertMany(Array.from({ length: 5 }, (_, i) => ({ title: `n${i}`, createdAt: at5(i) })))
    await Event.collection.insertMany(Array.from({ length: 5 }, (_, i) => ({ title: `e${i}`, date: '1', month: 'Yan', createdAt: at5(i) })))
    await Teacher.collection.insertMany(Array.from({ length: 5 }, (_, i) => ({ name: `t${i}`, role: 'R', dept: 'D', createdAt: at5(i) })))
  })

  test.each(['/api/news', '/api/events', '/api/teachers'])('%s: limit yo\'q bo\'lsa hammasi qaytadi (orqaga moslik)', async path => {
    expect((await at(path, '')).body).toHaveLength(5)
  })

  test.each(['/api/news', '/api/events', '/api/teachers'])('%s: limit=2&page=3 → oxirgi 1 ta; page=4 → bo\'sh', async path => {
    expect((await at(path, '?limit=2&page=3')).body).toHaveLength(1)
    expect((await at(path, '?limit=2&page=4')).body).toHaveLength(0)
  })

  test.each([
    ['limit=abc (son emas) → standart 20', '?limit=abc', 5],
    ['limit=-5 → eng kami 1', '?limit=-5', 1],
    ['limit=0 → standart 20', '?limit=0', 5],
    ['limit=1000 → eng ko\'pi 100 (5 ta bor)', '?limit=1000', 5],
    ['page=abc → 1-sahifa', '?limit=2&page=abc', 2],
    ['page=-3 → 1-sahifa', '?limit=2&page=-3', 2],
    ['limit massiv (?limit=1&limit=2) → xato bermaydi', '?limit=1&limit=2', 1],
    ['limit obyekt (?limit[$gt]=1) → xato bermaydi', '?limit[$gt]=1', 5],
  ])('/api/news: %s', async (_label, qs, expectedCount) => {
    const res = await at('/api/news', qs)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(expectedCount)
  })

  test("limit=1000 haqiqatan 100 ta bilan cheklanadi (100 dan ko'p hujjat bo'lganda)", async () => {
    await News.collection.insertMany(Array.from({ length: 100 }, (_, i) => ({ title: `k${i}`, createdAt: new Date(Date.UTC(2025, 0, 1, 0, 0, i)) })))
    const res = await at('/api/news', '?limit=1000')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(100) // jami 105 ta bor
  })

  test("sahifalar kesishmaydi va tartib createdAt kamayishi bo'yicha (yangisi birinchi)", async () => {
    const titles = async qs => (await at('/api/news', qs)).body.map(x => x.title)
    expect(await titles('?limit=2&page=1')).toEqual(['n4', 'n3'])
    expect(await titles('?limit=2&page=2')).toEqual(['n2', 'n1'])
    expect(await titles('?limit=2&page=3')).toEqual(['n0'])
  })
})
