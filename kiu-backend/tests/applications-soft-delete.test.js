// DELETE /api/applications/:id — soft delete (4.5): ariza shaxsiy ma'lumot saqlaydi, shuning uchun o'chirish
// darhol yo'qotmaydi (xato bosilsa tiklash mumkin), lekin ro'yxat/statistikada ko'rinmaydi va
// TRASH_DAYS kundan keyin TTL indeks butunlay o'chiradi.
const request = require('supertest')
const app = require('../app')
const Application = require('../models/Application')
const { getAuthToken } = require('./helpers')

const auth = () => ({ Authorization: `Bearer ${getAuthToken()}` })
let ipCounter = 0
const nextIp = () => `10.80.0.${++ipCounter}`
const make = (overrides = {}) => Application.create({ name: 'Ali', phone: '+998901234567', faculty: 'Informatika', type: 'admission', ...overrides })
const del = id => request(app).delete(`/api/applications/${id}`).set('X-Forwarded-For', nextIp()).set(auth())
const list = (query = '') => request(app).get(`/api/applications${query}`).set('X-Forwarded-For', nextIp()).set(auth())
const stat = url => request(app).get(url).set('X-Forwarded-For', nextIp()).set(auth())

describe('DELETE — soft delete', () => {
  test('hujjat bazada qoladi, deletedAt belgilanadi; boshqa maydonlar o\'zgarmaydi', async () => {
    const a = await make()
    const before = Date.now()
    const res = await del(a._id)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    const saved = await Application.findById(a._id)
    expect(saved.deletedAt.getTime()).toBeGreaterThanOrEqual(before - 1000)
    expect(saved.name).toBe('Ali')
    expect(saved.phone).toBe('+998901234567')
    expect(saved.status).toBe('new')
  })

  test("takroriy DELETE — 404, deletedAt o'zgarmaydi", async () => {
    const a = await make()
    await del(a._id)
    const first = (await Application.findById(a._id)).deletedAt
    const second = await del(a._id)
    expect(second.status).toBe(404)
    expect((await Application.findById(a._id)).deletedAt).toEqual(first)
  })

  test("faqat nishon ariza o'chadi", async () => {
    const a = await make({ name: 'A' })
    const b = await make({ name: 'B' })
    await del(a._id)
    expect((await Application.findById(b._id)).deletedAt).toBeNull()
  })

  test("eski hujjat (deletedAt maydoni umuman yo'q) ham faol sanaladi va o'chiriladi", async () => {
    const { insertedId } = await Application.collection.insertOne({ name: 'Eski', phone: '+998901234567', type: 'admission', status: 'new', createdAt: new Date(), updatedAt: new Date() })
    expect((await list()).body).toHaveLength(1)
    expect((await del(insertedId)).status).toBe(200)
    expect((await list()).body).toHaveLength(0)
  })
})

describe("o'chirilgan ariza — ko'rinmaydi va o'zgartirib bo'lmaydi", () => {
  test("GET /applications ro'yxatida (barcha filtrlar bilan) yo'q", async () => {
    const adm = await make({ type: 'admission' })
    await make({ type: 'vacancy' })
    await del(adm._id)

    expect((await list()).body).toHaveLength(1)
    expect((await list('?type=admission')).body).toHaveLength(0)
    expect((await list('?type=vacancy')).body).toHaveLength(1)
  })

  test("PUT (holatni o'zgartirish) — 404, holat o'zgarmaydi", async () => {
    const a = await make()
    await del(a._id)
    const res = await request(app).put(`/api/applications/${a._id}`).set('X-Forwarded-For', nextIp()).set(auth()).send({ status: 'accepted' })
    expect(res.status).toBe(404)
    expect((await Application.findById(a._id)).status).toBe('new')
  })
})

describe("statistikada o'chirilganlar sanalmaydi", () => {
  test('/api/stats: appsCount, newApps, vacancyApps', async () => {
    const adm = await make({ type: 'admission' })
    const vac = await make({ type: 'vacancy' })
    await make({ type: 'admission' })
    await del(adm._id)
    await del(vac._id)

    const { body } = await stat('/api/stats')
    expect(body.appsCount).toBe(1)
    expect(body.vacancyApps).toBe(0)
    expect(body.newApps).toBe(1)
  })

  test('/api/stats/applications-trend', async () => {
    const a = await make({ type: 'admission' })
    await make({ type: 'admission' })
    await del(a._id)
    const { body } = await stat('/api/stats/applications-trend')
    expect(body.buckets.reduce((sum, b) => sum + b.admission, 0)).toBe(1)
  })

  test('/api/stats/applications-faculties', async () => {
    const a = await make({ faculty: 'Informatika' })
    await make({ faculty: 'Informatika' })
    await make({ faculty: 'Iqtisodiyot' })
    await del(a._id)
    const { body } = await stat('/api/stats/applications-faculties')
    expect(body.total).toBe(2)
    expect(body.faculties).toEqual([{ faculty: 'Informatika', count: 1 }, { faculty: 'Iqtisodiyot', count: 1 }].sort((x, y) => y.count - x.count || x.faculty.localeCompare(y.faculty)))
  })
})

describe('TTL va telefon chegarasi', () => {
  test("TTL indeks: faqat deletedAt Date bo'lganda, 30 kundan keyin (partial)", async () => {
    await Application.init()
    const idx = (await Application.collection.indexes()).find(i => i.key?.deletedAt === 1)
    expect(idx?.expireAfterSeconds).toBe(Application.TRASH_DAYS * 24 * 60 * 60)
    expect(Application.TRASH_DAYS).toBe(30)
    expect(idx?.partialFilterExpression).toEqual({ deletedAt: { $type: 'date' } })
  })

  test("o'chirilgan arizalar bir raqamdan takroriy ariza chegarasiga (4.3) baribir sanaladi", async () => {
    const created = []
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post('/api/applications').set('X-Forwarded-For', nextIp())
        .send({ name: 'Ali', phone: '+998901234567', faculty: 'Informatika', type: 'admission' })
      expect(res.status).toBe(200)
      created.push(res.body._id)
    }
    for (const id of created) await del(id)

    const again = await request(app).post('/api/applications').set('X-Forwarded-For', nextIp())
      .send({ name: 'Ali', phone: '+998901234567', faculty: 'Informatika', type: 'admission' })
    expect(again.status).toBe(429)
  })
})
