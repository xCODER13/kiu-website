// viewLimiter (60/daqiqa) va mutationLimiter (30/15 daqiqa). Ikkalasi ham IP bo'yicha ishlaydi,
// hisoblagich BIR NECHTA route o'rtasida umumiy (bitta limiter obyekti). Har test o'z IP'sidan
// foydalanadi (X-Forwarded-For; app 'trust proxy' yoqilgan) — byudjetlar aralashmaydi.
// loginLimiter -> auth-hardening.test.js; formLimiter -> applications-telegram/sorting-hat.
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const News = require('../models/News')
const { getAuthToken } = require('./helpers')

let n = 0
const nextIp = () => `10.40.${Math.floor(++n / 250)}.${n % 250}`
const ghostId = () => new mongoose.Types.ObjectId().toString()

describe('viewLimiter — ochiq GET/view endpointlari (60 so\'rov / daqiqa / IP)', () => {
  test("61-so'rov 429; javobda ratelimit sarlavhalari va Retry-After bor", async () => {
    const ip = nextIp()
    const first = await request(app).get('/api/news').set('X-Forwarded-For', ip)
    expect(first.status).toBe(200)
    expect(first.headers['ratelimit-limit']).toBe('60')
    expect(first.headers['ratelimit-remaining']).toBe('59')

    for (let i = 0; i < 59; i++) expect((await request(app).get('/api/news').set('X-Forwarded-For', ip)).status).toBe(200)

    const blocked = await request(app).get('/api/news').set('X-Forwarded-For', ip)
    expect(blocked.status).toBe(429)
    expect(blocked.body.error).toBeDefined()
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0)
  })

  test("hisoblagich news, events va teachers o'rtasida umumiy", async () => {
    const ip = nextIp()
    const hit = path => request(app).get(path).set('X-Forwarded-For', ip)
    for (let i = 0; i < 20; i++) await hit('/api/news')
    for (let i = 0; i < 20; i++) await hit('/api/events')
    for (let i = 0; i < 20; i++) await hit('/api/teachers')

    expect((await hit('/api/news')).status).toBe(429)
    expect((await hit('/api/events')).status).toBe(429)
  })

  test("bir IP bloklansa, boshqa IP ta'sirlanmaydi", async () => {
    const ip = nextIp()
    for (let i = 0; i < 61; i++) await request(app).get('/api/news').set('X-Forwarded-For', ip)
    expect((await request(app).get('/api/news').set('X-Forwarded-For', ip)).status).toBe(429)

    expect((await request(app).get('/api/news').set('X-Forwarded-For', nextIp())).status).toBe(200)
  })

  test("PUT /api/news/:id/view (auth'siz) ham cheklanadi: bitta IP daqiqasiga eng ko'pi bilan 60 ta ko'rish qo'sha oladi", async () => {
    // Bir IP bir yangilikni 24 soatda bir marta sanaydi (4.6) — shuning uchun 60 ta turli yangilik
    const items = await News.create(Array.from({ length: 61 }, (_, i) => ({ title: `Ko'rishlar ${i}` })))
    const ip = nextIp()
    const view = item => request(app).put(`/api/news/${item._id}/view`).set('X-Forwarded-For', ip)

    for (let i = 0; i < 60; i++) expect((await view(items[i])).status).toBe(200)
    expect((await view(items[60])).status).toBe(429)

    expect((await News.countDocuments({ views: 1 }))).toBe(60)
    expect((await News.findById(items[60]._id)).views).toBe(0) // 429 olgan so'rov hisobga kirmagan
  })

  test("/health va /api/stats viewLimiter ostida emas", async () => {
    const ip = nextIp()
    for (let i = 0; i < 70; i++) expect((await request(app).get('/health').set('X-Forwarded-For', ip)).status).toBe(200)
  })
})

describe("mutationLimiter — admin yozuvlari (30 so'rov / 15 daqiqa / IP)", () => {
  const authed = (method, path, ip) =>
    request(app)[method](path).set('Authorization', `Bearer ${getAuthToken()}`).set('X-Forwarded-For', ip)

  test("auth'siz so'rovlar byudjetni sarflamaydi (auth limiterdan oldin): 40 ta 401 dan keyin admin hali ishlay oladi", async () => {
    const ip = nextIp()
    for (let i = 0; i < 40; i++) {
      expect((await request(app).delete(`/api/news/${ghostId()}`).set('X-Forwarded-For', ip)).status).toBe(401)
    }
    expect((await authed('delete', `/api/news/${ghostId()}`, ip)).status).toBe(404)
  })

  test("31-avtorizatsiyalangan so'rov 429; bloklangan so'rov bajarilmaydi (yangilik yaratilmaydi)", async () => {
    const ip = nextIp()
    for (let i = 0; i < 30; i++) expect((await authed('delete', `/api/news/${ghostId()}`, ip)).status).toBe(404)

    const blocked = await authed('post', '/api/news', ip).field('title', 'Bloklangan')
    expect(blocked.status).toBe(429)
    expect(await News.countDocuments()).toBe(0)
  })

  test("hisoblagich news, events va teachers yozuvlari o'rtasida umumiy", async () => {
    const ip = nextIp()
    for (let i = 0; i < 10; i++) await authed('delete', `/api/news/${ghostId()}`, ip)
    for (let i = 0; i < 10; i++) await authed('delete', `/api/events/${ghostId()}`, ip)
    for (let i = 0; i < 10; i++) await authed('delete', `/api/teachers/${ghostId()}`, ip)

    expect((await authed('delete', `/api/teachers/${ghostId()}`, ip)).status).toBe(429)
    expect((await authed('delete', `/api/news/${ghostId()}`, ip)).status).toBe(429)
  })

  test("blok IP bo'yicha: boshqa IP'dan admin ishlay oladi", async () => {
    const ip = nextIp()
    for (let i = 0; i < 31; i++) await authed('delete', `/api/news/${ghostId()}`, ip)
    expect((await authed('delete', `/api/news/${ghostId()}`, ip)).status).toBe(429)

    expect((await authed('delete', `/api/news/${ghostId()}`, nextIp())).status).toBe(404)
  })

  test("mutationLimiter GET so'rovlarni cheklamaydi (viewLimiter alohida)", async () => {
    const ip = nextIp()
    for (let i = 0; i < 31; i++) await authed('delete', `/api/news/${ghostId()}`, ip)
    expect((await request(app).get('/api/news').set('X-Forwarded-For', ip)).status).toBe(200)
  })
})

describe("statsLimiter — admin statistikasi (60 so'rov / daqiqa / IP)", () => {
  const stats = (ip, authed = true) => {
    const r = request(app).get('/api/stats/top-news').set('X-Forwarded-For', ip)
    return authed ? r.set('Authorization', `Bearer ${getAuthToken()}`) : r
  }

  test("61-so'rov 429; Retry-After bor; tokensiz so'rovlar byudjetni sarflamaydi (auth limiterdan oldin)", async () => {
    const ip = nextIp()
    for (let i = 0; i < 40; i++) expect((await stats(ip, false)).status).toBe(401)

    const first = await stats(ip)
    expect(first.status).toBe(200)
    expect(first.headers['ratelimit-limit']).toBe('60')
    expect(first.headers['ratelimit-remaining']).toBe('59') // 40 ta 401 sanalmagan

    for (let i = 0; i < 59; i++) expect((await stats(ip)).status).toBe(200)
    const blocked = await stats(ip)
    expect(blocked.status).toBe(429)
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0)
    expect(blocked.headers['cache-control']).toBeUndefined() // 429 keshlanmasin
  })

  test("viewLimiter bilan umumiy emas: stats byudjeti tugasa ham ochiq GET ishlaydi", async () => {
    const ip = nextIp()
    for (let i = 0; i < 61; i++) await stats(ip)
    expect((await stats(ip)).status).toBe(429)
    expect((await request(app).get('/api/news').set('X-Forwarded-For', ip)).status).toBe(200)
  })
})
