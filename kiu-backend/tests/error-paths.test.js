// DB xatosi (5.3): har endpoint `catch` shoxi mijozga FAQAT umumiy xabar qaytaradi — ichki xato matni
// (ulanish satri, kolleksiya, so'rov tafsiloti) javobga sizib chiqmasligi kerak. Mongoose so'rovlarining
// bajarilishi (`Query.exec` / `Aggregate.exec`) rad etiladi — shu tufayli bu testlar haqiqiy DB'siz ham ishlaydi.
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const { getAuthToken } = require('./helpers')

const SECRET = 'mongodb://user:PAROL@ichki-host:27017/prod — ulanish xatosi'
const id = () => new mongoose.Types.ObjectId().toString()
const GENERIC_500 = "Server xatosi yuz berdi. Birozdan so'ng qayta urinib ko'ring."
const GENERIC_400 = "So'rovda xatolik bor. Ma'lumotlarni tekshirib qayta yuboring."

let n = 0
const nextIp = () => `10.70.${Math.floor(++n / 250)}.${n % 250}`

let execSpy
let aggSpy
beforeEach(() => {
  execSpy = jest.spyOn(mongoose.Query.prototype, 'exec').mockRejectedValue(new Error(SECRET))
  aggSpy = jest.spyOn(mongoose.Aggregate.prototype, 'exec').mockRejectedValue(new Error(SECRET))
})
afterEach(() => {
  execSpy.mockRestore()
  aggSpy.mockRestore()
})

const call = (method, url, { auth = false, body } = {}) => {
  let r = request(app)[method](url).set('X-Forwarded-For', nextIp())
  if (auth) r = r.set('Authorization', `Bearer ${getAuthToken()}`)
  return body ? r.send(body) : r
}

describe('DB xatosi -> 500: umumiy xabar, ichki tafsilot sizmaydi', () => {
  // Har qator 3 elementli bo'lishi shart: jest-each qisqa qatorda uchinchi argumentga `done` callback beradi.
  const rows = [
    // ochiq o'qish
    ['get', '/api/gallery'],
    ['get', '/api/events'],
    ['get', '/api/news'],
    ['get', `/api/news/${id()}`],
    ['get', '/api/teachers'],
    // ochiq "ko'rish" hisoblagichlari
    ['put', `/api/news/${id()}/view`],
    ['put', `/api/events/${id()}/view`],
    // admin: o'chirish
    ['delete', `/api/gallery/${id()}`, { auth: true }],
    ['delete', `/api/events/${id()}`, { auth: true }],
    ['delete', `/api/news/${id()}`, { auth: true }],
    ['delete', `/api/teachers/${id()}`, { auth: true }],
    // admin: statistika
    ['get', '/api/stats', { auth: true }],
    ['get', '/api/stats/applications-trend', { auth: true }],
    ['get', '/api/stats/top-news', { auth: true }],
    ['get', '/api/stats/top-events', { auth: true }],
    ['get', '/api/stats/sortinghat-faculties', { auth: true }],
    ['get', '/api/stats/applications-faculties', { auth: true }],
  ]

  const cases = rows.map(([method, url, opts = {}]) => [method, url, opts])

  test.each(cases)('%s %s', async (method, url, opts) => {
    const res = await call(method, url, opts)
    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: GENERIC_500 })
    expect(res.text).not.toContain('PAROL')
    expect(res.text).not.toContain('ichki-host')
  })
})

describe('DB xatosi -> 400 (yozish: kiritilgan ma\'lumot xatosi sifatida), baribir umumiy xabar', () => {
  test('PUT /api/gallery/:id: mavjud albomni o\'qib bo\'lmasa', async () => {
    const res = await call('put', `/api/gallery/${id()}`, { auth: true, body: { title: 'x', existingImages: '[]' } })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: GENERIC_400 })
    expect(res.text).not.toContain('PAROL')
  })
})
