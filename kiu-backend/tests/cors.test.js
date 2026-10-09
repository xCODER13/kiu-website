// config/cors.js — qaysi frontend domenlar API'ga murojaat qila olishini belgilaydi.
// Xavf: regex/taqqoslashdagi xato tufayli begona sayt (masalan, "kiu-website-x-xcoder13s-projects
// .vercel.app.evil.com") ruxsat olib, adminning brauzeri orqali API'ga so'rov yuborishi.
// FRONTEND_URL config modul yuklanganda o'qiladi, shuning uchun app'dan OLDIN o'rnatiladi.
process.env.FRONTEND_URL = 'https://kiu.test'

const request = require('supertest')
const app = require('../app')
const Application = require('../models/Application')

const PROD = 'https://kiu.test'
const PREVIEW = 'https://kiu-website-abc123-xcoder13s-projects.vercel.app'

const get = origin => request(app).get('/health').set('Origin', origin)

describe('CORS — ruxsat etilgan originlar', () => {
  test.each([
    ['production (FRONTEND_URL)', PROD],
    ['Vercel preview deploy', PREVIEW],
  ])('%s: 200, Access-Control-Allow-Origin shu origin, credentials yoqilgan', async (_label, origin) => {
    const res = await get(origin)
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe(origin)
    expect(res.headers['access-control-allow-credentials']).toBe('true')
  })

  test("javob Origin bo'yicha o'zgaradi (Vary: Origin) — keshda origin'lar aralashib ketmasin", async () => {
    const res = await get(PROD)
    expect(res.headers.vary).toMatch(/Origin/i)
  })

  // 3.5: cross-origin'da brauzer faqat «xavfsiz» sarlavhalarni JS'ga beradi; Profil «N urinish qoldi» uchun shular kerak
  test('RateLimit-* va Retry-After sarlavhalari frontend JS uchun ochiq (Access-Control-Expose-Headers)', async () => {
    const res = await get(PROD)
    const exposed = (res.headers['access-control-expose-headers'] || '').split(',').map(h => h.trim().toLowerCase())
    expect(exposed).toEqual(expect.arrayContaining(['ratelimit-remaining', 'ratelimit-reset', 'retry-after']))
  })

  test("Origin sarlavhasi yo'q (curl, server-to-server, health-check): ruxsat, CORS sarlavhalarisiz", async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('CORS — ruxsat etilmagan originlar', () => {
  test.each([
    ['begona domen', 'https://evil.example'],
    ["preview domeniga o'xshash, oxiriga begona qo'shilgan", `${PREVIEW}.evil.com`],
    ["preview domeni boshiga begona qo'shilgan", `https://evil.com/${PREVIEW}`],
    ["boshqa foydalanuvchining Vercel loyihasi", 'https://kiu-website-abc123-boshqa-projects.vercel.app'],
    ['production domeniga o\'xshash (suffix)', `${PROD}.evil.com`],
    ['production domeniga o\'xshash (prefix)', 'https://xkiu.test'],
    ["http (https emas)", 'http://kiu.test'],
    ["boshqa port", 'https://kiu.test:8443'],
    ["'null' origin (file://, sandbox iframe)", 'null'],
  ])('%s → 403 va CORS sarlavhasiz', async (_label, origin) => {
    const res = await get(origin)
    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Ruxsat etilmagan manba (CORS)' })
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  test("begona origin'dan kelgan yozuvchi so'rov route'ga umuman yetib bormaydi (ariza yaratilmaydi)", async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Origin', 'https://evil.example')
      .send({ name: 'Ali', phone: '+998901234567' })

    expect(res.status).toBe(403)
    expect(await Application.countDocuments()).toBe(0)
  })
})

describe('CORS — preflight (OPTIONS)', () => {
  test("ruxsat etilgan origin: 204 va ruxsat sarlavhalari", async () => {
    const res = await request(app)
      .options('/api/applications')
      .set('Origin', PROD)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type,authorization')

    expect(res.status).toBe(204)
    expect(res.headers['access-control-allow-origin']).toBe(PROD)
    expect(res.headers['access-control-allow-methods']).toMatch(/POST/)
    expect(res.headers['access-control-allow-headers']).toMatch(/authorization/i)
  })

  test("begona origin: preflight ham 403", async () => {
    const res = await request(app)
      .options('/api/applications')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST')

    expect(res.status).toBe(403)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })
})