const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const { getAuthToken } = require('./helpers')

// /api/stats — auth bilan himoyalangan, oddiy GET route, shuning uchun
// auth middleware'ni sinash uchun qulay "nishon" sifatida ishlatiladi.
describe('auth middleware', () => {
  test('token berilmasa 401 qaytaradi', async () => {
    const res = await request(app).get('/api/stats')
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/token/i)
  })

  test("noto'g'ri formatdagi token bilan 401 qaytaradi", async () => {
    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', 'Bearer bu-haqiqiy-token-emas')
    expect(res.status).toBe(401)
  })

  test("boshqa sir bilan imzolangan token bilan 401 qaytaradi", async () => {
    const badToken = jwt.sign({ username: 'admin' }, 'notogri_sir', { expiresIn: '1h' })
    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${badToken}`)
    expect(res.status).toBe(401)
  })

  test("muddati tugagan token bilan 401 qaytaradi", async () => {
    // expiresIn manfiy qiymat bilan emas, iat'ni orqaga surib hosil qilinadi —
    // bu jwt.verify tomonidan rasman hujjatlangan, kutubxona versiyasiga
    // bog'liq bo'lmagan usul.
    const expiredToken = jwt.sign(
      { username: 'admin', iat: Math.floor(Date.now() / 1000) - 7200 },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${expiredToken}`)
    expect(res.status).toBe(401)
  })

  test("to'g'ri token bilan so'rov o'tkaziladi (401 emas)", async () => {
    const token = getAuthToken()
    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)
    // Auth muvaffaqiyatli o'tgani muhim — statusning o'zi 200 (route ichki
    // logikasi to'g'ri ishlasa) bo'ladi, lekin bu yerda faqat 401 EMASLIGI tekshiriladi
    expect(res.status).not.toBe(401)
  })
})