// GET /api/admin/me — Profil «Hisob» kartasi (DESIGN.md 10.4): { username, passwordChangedAt, sessionExpiresAt }.
// Muhim: javobda parol hash'i, `iat`, token yoki boshqa ichki maydon bo'lmasligi kerak.
const jwt = require('jsonwebtoken')
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const sessions = require('../services/adminSessions')
const { getAuthToken, setAdminPassword } = require('./helpers')

const bearer = token => ({ Authorization: `Bearer ${token}` })
const me = token => request(app).get('/api/admin/me').set(token ? bearer(token) : {})
const settings = () => mongoose.connection.db.collection('settings')

describe('GET /api/admin/me — kirish nazorati', () => {
  test('token bo\'lmasa 401', async () => {
    expect((await me()).status).toBe(401)
  })

  test('yaroqsiz token bilan 401', async () => {
    expect((await me('yaroqsiz.token.qiymati')).status).toBe(401)
  })

  test('boshqa kalit bilan imzolangan token 401', async () => {
    const forged = jwt.sign({ username: process.env.ADMIN_USERNAME }, 'boshqa-kalit', { expiresIn: '1h' })
    expect((await me(forged)).status).toBe(401)
  })

  test('POST ruxsat etilmaydi (faqat GET)', async () => {
    const res = await request(app).post('/api/admin/me').set(bearer(getAuthToken()))
    expect(res.status).toBe(404)
  })

  test("«barcha qurilmalardan chiqish»dan keyin eski token bilan 401", async () => {
    const token = getAuthToken('admin', { issuedSecondsAgo: 5 })
    expect((await me(token)).status).toBe(200)
    await sessions.revokeAllTokens()
    expect((await me(token)).status).toBe(401)
  })
})

describe('GET /api/admin/me — javob', () => {
  test("faqat uchta maydon: username, passwordChangedAt, sessionExpiresAt (hash/iat/token yo'q)", async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await me(getAuthToken())
    expect(res.status).toBe(200)
    expect(Object.keys(res.body).sort()).toEqual(['passwordChangedAt', 'sessionExpiresAt', 'username'])
    const text = JSON.stringify(res.body)
    expect(text).not.toContain(process.env.ADMIN_PASSWORD_HASH)
    expect(text).not.toContain(process.env.JWT_SECRET)
    expect(text).not.toMatch(/iat|hash|token/i)
  })

  test("username tokendan olinadi; sessionExpiresAt = token `exp` (ISO)", async () => {
    await setAdminPassword('joriy_parol_123')
    const token = getAuthToken()
    const { exp } = jwt.decode(token)
    const res = await me(token)
    expect(res.body.username).toBe('admin')
    expect(res.body.sessionExpiresAt).toBe(new Date(exp * 1000).toISOString())
  })

  test("parol hech o'zgartirilmagan bo'lsa passwordChangedAt = null", async () => {
    await setAdminPassword('joriy_parol_123')
    expect((await me(getAuthToken())).body.passwordChangedAt).toBeNull()
  })

  test("DB'dagi `admin_password_changed_at` qaytariladi (ISO)", async () => {
    await setAdminPassword('joriy_parol_123')
    const at = '2026-09-01T10:00:00.000Z'
    await settings().updateOne({ key: 'admin_password_changed_at' }, { $set: { value: at } }, { upsert: true })
    sessions.resetCache()
    expect((await me(getAuthToken())).body.passwordChangedAt).toBe(at)
  })

  test('change-password dan keyin passwordChangedAt hozirgi vaqtga yangilanadi', async () => {
    await setAdminPassword('joriy_parol_123')
    const before = Date.now()
    const change = await request(app)
      .post('/api/admin/change-password')
      .set(bearer(getAuthToken('admin', { issuedSecondsAgo: 5 })))
      .send({ currentPassword: 'joriy_parol_123', newPassword: 'Kuchli-yangi-parol-9' })
    expect(change.status).toBe(200)
    const res = await me(getAuthToken())
    const changedAt = new Date(res.body.passwordChangedAt).getTime()
    expect(changedAt).toBeGreaterThanOrEqual(before - 1000)
    expect(changedAt).toBeLessThanOrEqual(Date.now() + 1000)
  })
})
