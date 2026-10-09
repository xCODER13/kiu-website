// GET /api/applications — serverda filtr (type/status), sahifalash va holatlar sanog'i (4.4).
// Ariza shaxsiy ma'lumot (ism, telefon) saqlaydi: ro'yxat auth ortida, sahifalab qaytadi, o'chirilganlar (4.5) ko'rinmaydi.
const request = require('supertest')
const app = require('../app')
const Application = require('../models/Application')
const { getAuthToken } = require('./helpers')
const { backfillApplicationType } = require('../scripts/backfill-application-type')

const PHONE = '+998901234567'
let ipCounter = 0
const get = (query = '') => request(app).get(`/api/applications${query}`).set('X-Forwarded-For', `10.90.0.${++ipCounter}`).set('Authorization', `Bearer ${getAuthToken()}`)
const make = (overrides = {}) => Application.create({ name: 'Ali', phone: PHONE, type: 'admission', ...overrides })
const raw = (docs) => {
  const now = new Date()
  return Application.collection.insertMany(docs.map(d => ({ phone: PHONE, status: 'new', createdAt: now, updatedAt: now, ...d })))
}

describe('GET /api/applications — kirish va eski format', () => {
  test("auth'siz 401", async () => {
    expect((await request(app).get('/api/applications?page=1')).status).toBe(401)
  })

  test('page/limit yo\'q — eski format (oddiy massiv), hamma tur', async () => {
    await make({ type: 'admission' })
    await make({ type: 'vacancy' })
    const res = await get()
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })

  test('maydonlar: __v, deletedAt va phoneKey chiqmaydi (ikkala formatda)', async () => {
    await make()
    for (const q of ['', '?page=1']) {
      const res = await get(q)
      const item = Array.isArray(res.body) ? res.body[0] : res.body.items[0]
      expect(item).not.toHaveProperty('__v')
      expect(item).not.toHaveProperty('deletedAt')
      expect(item).not.toHaveProperty('phoneKey')
      expect(item.phone).toBe(PHONE)
    }
  })
})

describe('GET /api/applications?page=&limit= — sahifalash', () => {
  test("konvert: items, total, page, limit, counts; standart hajm 20", async () => {
    await Application.insertMany(Array.from({ length: 25 }, (_, i) => ({ name: `A${i}`, phone: PHONE, type: 'admission' })))
    const res = await get('?page=1')
    expect(res.status).toBe(200)
    expect(Object.keys(res.body).sort()).toEqual(['counts', 'items', 'limit', 'page', 'total'])
    expect(res.body.items).toHaveLength(20)
    expect(res.body).toMatchObject({ total: 25, page: 1, limit: 20 })
  })

  test('limit 50 dan oshmaydi; noto\'g\'ri qiymatlar standartga tushadi', async () => {
    await Application.insertMany(Array.from({ length: 55 }, (_, i) => ({ name: `A${i}`, phone: PHONE, type: 'admission' })))
    expect((await get('?limit=999')).body).toMatchObject({ limit: 50 })
    expect((await get('?limit=999')).body.items).toHaveLength(50)
    expect((await get('?limit=abc&page=-3')).body).toMatchObject({ limit: 20, page: 1 })
    expect((await get('?limit=0')).body.limit).toBe(20)
    expect((await get('?limit=-5')).body.limit).toBe(1)
  })

  test("sahifalar takrorsiz va aniq tartibda (createdAt teng bo'lsa ham)", async () => {
    await raw(Array.from({ length: 5 }, (_, i) => ({ name: `T${i}`, type: 'admission' }))) // createdAt bir xil
    const ids = []
    for (const page of [1, 2, 3]) ids.push(...(await get(`?limit=2&page=${page}`)).body.items.map(a => a._id))
    expect(ids).toHaveLength(5)
    expect(new Set(ids).size).toBe(5)
    expect(ids).toEqual([...ids].sort().reverse())
  })

  test("yangisi birinchi (createdAt kamayish tartibida)", async () => {
    const old = await raw([{ name: 'Eski', type: 'admission', createdAt: new Date('2026-01-01') }])
    const fresh = await make({ name: 'Yangi' })
    expect(old.insertedCount).toBe(1)
    const res = await get('?page=1')
    expect(res.body.items.map(a => a.name)).toEqual(['Yangi', 'Eski'])
    expect(res.body.items[0]._id).toBe(String(fresh._id))
  })

  test("oxirgi sahifadan keyingi so'rov: items bo'sh, total saqlanadi", async () => {
    await make()
    const res = await get('?page=5&limit=10')
    expect(res.body.items).toEqual([])
    expect(res.body.total).toBe(1)
  })
})

describe('serverda filtr: type va status', () => {
  beforeEach(async () => {
    await make({ type: 'admission', status: 'new' })
    await make({ type: 'admission', status: 'accepted' })
    await make({ type: 'vacancy', status: 'new' })
    await make({ type: 'vacancy', status: 'rejected' })
  })

  test('?type= faqat shu turni qaytaradi', async () => {
    const adm = await get('?type=admission&page=1')
    expect(adm.body.items.map(a => a.type)).toEqual(['admission', 'admission'])
    expect(adm.body.total).toBe(2)
    expect((await get('?type=vacancy&page=1')).body.total).toBe(2)
  })

  test('?status= filtr; total — filtr bo\'yicha, counts — faqat type bo\'yicha', async () => {
    const res = await get('?type=admission&status=new&page=1')
    expect(res.body.items).toHaveLength(1)
    expect(res.body.total).toBe(1)
    expect(res.body.counts).toEqual({ all: 2, new: 1, reviewed: 0, accepted: 1, rejected: 0 })
  })

  test("type'siz so'rov — counts hamma tur bo'yicha", async () => {
    expect((await get('?page=1')).body.counts).toEqual({ all: 4, new: 2, reviewed: 0, accepted: 1, rejected: 1 })
  })

  test("noto'g'ri status — 400 (obyekt/qator filtrga o'tmaydi)", async () => {
    for (const bad of ['xato', '%7B%22%24ne%22%3Anull%7D', 'new&status=accepted']) {
      expect((await get(`?status=${bad}&page=1`)).status).toBe(400)
    }
  })

  test("noma'lum type e'tiborsiz qoldiriladi (eski xatti-harakat)", async () => {
    expect((await get('?type=xyz&page=1')).body.total).toBe(4)
  })
})

describe("eski (type'siz) hujjatlar va o'chirilganlar", () => {
  test("type'siz hujjat (maydon yo'q yoki null) qabul arizasi hisoblanadi — ro'yxatda, total va counts'da; vakansiyada ko'rinmaydi", async () => {
    await raw([{ name: 'Eski-1' }, { name: 'Eski-2', type: null }])
    await make({ type: 'admission' })

    const adm = await get('?type=admission&page=1')
    expect(adm.body.total).toBe(3)
    expect(adm.body.counts.all).toBe(3)
    expect((await get('?type=vacancy&page=1')).body.total).toBe(0)
  })

  test("o'chirilgan (soft delete) ariza items, total va counts'da yo'q", async () => {
    const gone = await make()
    await make()
    await Application.updateOne({ _id: gone._id }, { deletedAt: new Date() })
    const res = await get('?page=1')
    expect(res.body.items).toHaveLength(1)
    expect(res.body.total).toBe(1)
    expect(res.body.counts.all).toBe(1)
  })
})

describe('migratsiya: backfillApplicationType', () => {
  const insertLegacy = () => raw([{ name: 'Eski-1' }, { name: 'Eski-2', type: null }, { name: 'Eski-3', type: '' }, { name: 'Yangi', type: 'vacancy' }])

  test('dry-run: sanaydi, hech narsa yozmaydi', async () => {
    await insertLegacy()
    const res = await backfillApplicationType(Application.collection)
    expect(res).toEqual({ missing: 3, updated: 0 })
    expect(await Application.collection.countDocuments({ type: 'admission' })).toBe(0)
  })

  test("--apply: faqat type'sizlarni 'admission' qiladi; vakansiyaga tegmaydi; updatedAt o'zgarmaydi; idempotent", async () => {
    await insertLegacy()
    const before = await Application.collection.findOne({ name: 'Eski-1' })

    expect(await backfillApplicationType(Application.collection, { apply: true })).toEqual({ missing: 3, updated: 3 })
    expect(await Application.collection.countDocuments({ type: 'admission' })).toBe(3)
    expect((await Application.collection.findOne({ name: 'Yangi' })).type).toBe('vacancy')
    expect((await Application.collection.findOne({ name: 'Eski-1' })).updatedAt).toEqual(before.updatedAt)

    expect(await backfillApplicationType(Application.collection, { apply: true })).toEqual({ missing: 0, updated: 0 })
  })
})
