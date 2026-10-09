// Global error handler (5.3): body-parser xatolari mijozga umumiy, qiymatsiz xabar bilan qaytadi.
// Muhim: noto'g'ri JSON xabari kiritilgan matnni (parol bo'lishi mumkin) javobda aks ettirmasligi kerak.
const request = require('supertest')
const app = require('../app')

let n = 0
const nextIp = () => `10.71.${Math.floor(++n / 250)}.${n % 250}`
const post = () => request(app).post('/api/sorting-hat-lead').set('X-Forwarded-For', nextIp())

describe('body-parser xatolari', () => {
  test("buzilgan JSON -> 400, javobda kiritilgan matn yo'q", async () => {
    const res = await post().set('Content-Type', 'application/json').send('{"name": "Maxfiy-Parol-123", ')
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "So'rov tanasi (JSON) noto'g'ri formatda" })
    expect(res.text).not.toContain('Maxfiy-Parol-123')
  })

  test("100 KB dan katta JSON -> 413, umumiy xabar", async () => {
    const res = await post().set('Content-Type', 'application/json').send(JSON.stringify({ name: 'x'.repeat(120 * 1024), phone: '1' }))
    expect(res.status).toBe(413)
    expect(res.body.error).toMatch(/hajmi juda katta/)
  })

  test("JSON emas, lekin yaroqli so'rov (text/plain, tana yo'q) 500 bermaydi", async () => {
    const res = await post().set('Content-Type', 'text/plain').send('salom')
    expect(res.status).toBe(400)
  })
})

// changePassword: DB'dan sozlamalarni yangilab bo'lmasa (logger.warn) va ADMIN_PASSWORD_HASH umuman yo'q bo'lsa —
// 500 va aniq xabar (bcrypt'ga `undefined` bilan yetib bormaydi). Haqiqiy DB bor muhitda (CI) `collection` uzib qo'yiladi.
// DIQQAT: soxta `collection` testning O'ZIDA (finally) tiklanadi, afterEach'da emas: tests/setup.js ning afterEach'i
// (u har doim OLDIN ishlaydi) `db.collection('settings')` ni chaqiradi va soxta xato bilan yiqilardi.
describe('POST /api/admin/change-password: admin paroli sozlanmagan', () => {
  const mongoose = require('mongoose')
  const { getAuthToken } = require('./helpers')

  test('hash topilmasa 500 (login bilan bir xil xabar), parol tekshirilmaydi', async () => {
    const savedHash = process.env.ADMIN_PASSWORD_HASH
    delete process.env.ADMIN_PASSWORD_HASH
    const spy = mongoose.connection.db
      ? jest.spyOn(mongoose.connection.db, 'collection').mockImplementation(() => { throw new Error('db down') })
      : null
    try {
      const res = await request(app)
        .post('/api/admin/change-password')
        .set('X-Forwarded-For', nextIp())
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ currentPassword: 'joriy-parol-123', newPassword: 'butunlay-yangi-parol-77' })
      expect(res.status).toBe(500)
      expect(res.body.error).toMatch(/Admin paroli sozlanmagan/)
    } finally {
      if (spy) spy.mockRestore()
      if (savedHash !== undefined) process.env.ADMIN_PASSWORD_HASH = savedHash
    }
  })
})
