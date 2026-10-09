// PUT /api/news/:id/view va /api/events/:id/view — takrorlashdan himoya (4.6):
// bir tashrifchi (IP) bir resursni 24 soatda bir marta sanaydi. «Eng ko'p ko'rilgan» statistikasi shunga tayanadi.
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const News = require('../models/News')
const Event = require('../models/Event')
const ViewLog = require('../models/ViewLog')
const { viewKey } = require('../services/viewDedupe')

let ipCounter = 0
const nextIp = () => `10.70.0.${++ipCounter}`
const view = (resource, id, ip) => request(app).put(`/api/${resource}/${id}/view`).set('X-Forwarded-For', ip)
const ghostId = () => new mongoose.Types.ObjectId().toString()

beforeAll(async () => { await ViewLog.init() }) // unique/TTL indekslar tayyor bo'lsin

describe.each([
  ['news', () => News.create({ title: 'Yangilik' }), News],
  ['events', () => Event.create({ title: 'Tadbir', eventDate: '2026-01-01' }), Event],
])('%s view', (resource, make, Model) => {
  test("bir IP'dan takroriy so'rovlar sanalmaydi, lekin har doim 200 {success:true}", async () => {
    const item = await make()
    const ip = nextIp()
    for (let i = 0; i < 5; i++) {
      const res = await view(resource, item._id, ip)
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ success: true })
    }
    expect((await Model.findById(item._id)).views).toBe(1)
  })

  test("turli IP'lar alohida sanaladi", async () => {
    const item = await make()
    for (let i = 0; i < 3; i++) await view(resource, item._id, nextIp())
    expect((await Model.findById(item._id)).views).toBe(3)
  })

  test("bir IP turli resurslarni alohida sanaydi", async () => {
    const a = await make()
    const b = await make()
    const ip = nextIp()
    await view(resource, a._id, ip)
    await view(resource, b._id, ip)
    await view(resource, a._id, ip)
    expect((await Model.findById(a._id)).views).toBe(1)
    expect((await Model.findById(b._id)).views).toBe(1)
  })

  test("parallel so'rovlar ham bir marta sanaladi (unique indeks)", async () => {
    const item = await make()
    const ip = nextIp()
    await Promise.all(Array.from({ length: 8 }, () => view(resource, item._id, ip)))
    expect((await Model.findById(item._id)).views).toBe(1)
  })

  test("bazada yo'q id: 200, hisoblagich ham, jurnal yozuvi ham yaratilmaydi", async () => {
    const res = await view(resource, ghostId(), nextIp())
    expect(res.status).toBe(200)
    expect(await ViewLog.countDocuments()).toBe(0)
  })

  test("jurnal yozuvi o'chib ketgach (24 soatdan keyin TTL) yana sanaladi", async () => {
    const item = await make()
    const ip = nextIp()
    await view(resource, item._id, ip)
    await ViewLog.deleteMany({}) // TTL monitor ishi o'rnida
    await view(resource, item._id, ip)
    expect((await Model.findById(item._id)).views).toBe(2)
  })
})

describe('ViewLog: maxfiylik va indekslar', () => {
  test("bazada xom IP saqlanmaydi — faqat HMAC kalit", async () => {
    const item = await News.create({ title: 'Yangilik' })
    const ip = '203.0.113.77'
    await view('news', item._id, ip)

    const rows = await ViewLog.find().lean()
    expect(rows).toHaveLength(1)
    expect(rows[0].key).toBe(viewKey('news', String(item._id), ip))
    expect(rows[0].key).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(rows)).not.toContain(ip)
  })

  test('TTL indeks 24 soat, key bo\'yicha unique indeks mavjud', async () => {
    const indexes = await ViewLog.collection.indexes()
    const ttl = indexes.find(i => i.key?.createdAt === 1)
    expect(ttl?.expireAfterSeconds).toBe(ViewLog.VIEW_DEDUPE_HOURS * 60 * 60)
    expect(indexes.find(i => i.key?.key === 1)?.unique).toBe(true)
  })

  test("kalit resurs, id va IP ga bog'liq (turli kirishlarda turlicha)", () => {
    const base = viewKey('news', 'a', '1.1.1.1')
    expect(viewKey('events', 'a', '1.1.1.1')).not.toBe(base)
    expect(viewKey('news', 'b', '1.1.1.1')).not.toBe(base)
    expect(viewKey('news', 'a', '2.2.2.2')).not.toBe(base)
    expect(viewKey('news', 'a', '1.1.1.1')).toBe(base)
  })
})
