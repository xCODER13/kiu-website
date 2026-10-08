// POST /api/admin/logout-all va `auth` middleware'ning DB'dagi chegaralar bilan ishlashi
// (services/adminSessions.js). Chegara «shu vaqtdan oldin chiqarilgan tokenlar yaroqsiz»
// degani; DB'da saqlanadi, shuning uchun bir nechta server instance'ida ham ishlaydi.
//
// Eslatma: bu faylda mutationLimiter byudjeti (30/15 daqiqa, IP bo'yicha) umumiy — auth'li
// so'rovlar sonini 30 dan kam ushlang.
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const sessions = require('../services/adminSessions')
const { getAuthToken } = require('./helpers')

const bearer = token => ({ Authorization: `Bearer ${token}` })
const settings = () => mongoose.connection.db.collection('settings')
const getCutoff = async () => (await settings().findOne({ key: 'admin_tokens_valid_after' }))?.value
const stats = token => request(app).get('/api/stats').set(bearer(token))
const logoutAll = token => request(app).post('/api/admin/logout-all').set(bearer(token))

describe('POST /api/admin/logout-all — kirish nazorati', () => {
  test("token bo'lmasa 401 va chegara yozilmaydi", async () => {
    const res = await request(app).post('/api/admin/logout-all')
    expect(res.status).toBe(401)
    expect(await getCutoff()).toBeUndefined()
  })

  test("yaroqsiz token bilan 401 va chegara yozilmaydi", async () => {
    const res = await logoutAll('yaroqsiz.token.qiymati')
    expect(res.status).toBe(401)
    expect(await getCutoff()).toBeUndefined()
  })

  test("GET ruxsat etilmaydi (faqat POST)", async () => {
    const res = await request(app).get('/api/admin/logout-all').set(bearer(getAuthToken()))
    expect(res.status).toBe(404)
    expect(await getCutoff()).toBeUndefined()
  })
})

describe('POST /api/admin/logout-all — tokenlarni bekor qilish', () => {
  test('200 {success:true} qaytaradi va DB\'ga ISO vaqtni yozadi', async () => {
    const before = Date.now()
    const res = await logoutAll(getAuthToken())

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })
    const cutoff = await getCutoff()
    expect(new Date(cutoff).toISOString()).toBe(cutoff)
    expect(new Date(cutoff).getTime()).toBeGreaterThanOrEqual(before)
  })

  test("so'rovni yuborgan token ham darhol yaroqsiz bo'ladi", async () => {
    const token = getAuthToken()
    expect((await stats(token)).status).toBe(200)

    expect((await logoutAll(token)).status).toBe(200)

    const res = await stats(token)
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/sessiya/i)
  })

  test("avval chiqarilgan HAMMA tokenlar rad etiladi, keyin chiqarilgani qabul qilinadi", async () => {
    const old1 = getAuthToken('admin', { issuedSecondsAgo: 60 })
    const old2 = getAuthToken('admin', { issuedSecondsAgo: 3 })
    expect((await stats(old1)).status).toBe(200)

    await logoutAll(getAuthToken())

    expect((await stats(old1)).status).toBe(401)
    expect((await stats(old2)).status).toBe(401)
    // Chegaradan keyin (kelajak soniyalarida) chiqarilgan token — yangi login ekvivalenti
    expect((await stats(getAuthToken('admin', { issuedSecondsAgo: -5 }))).status).toBe(200)
  })

  test("bekor qilingan token bilan qayta logout-all ham 401 beradi", async () => {
    const token = getAuthToken()
    await logoutAll(token)
    const res = await request(app).post('/api/admin/logout-all').set(bearer(token))
    expect(res.status).toBe(401)
  })

  test("ketma-ket logout-all chegarani orqaga surmaydi (monoton)", async () => {
    await logoutAll(getAuthToken())
    const first = await getCutoff()
    await logoutAll(getAuthToken('admin', { issuedSecondsAgo: -5 }))
    expect(new Date(await getCutoff()).getTime()).toBeGreaterThanOrEqual(new Date(first).getTime())
  })
})

describe('adminSessions — DB va kesh', () => {
  test("DB'dagi chegara (boshqa instance yozgan) kesh yangilangach hisobga olinadi", async () => {
    const token = getAuthToken('admin', { issuedSecondsAgo: 10 })
    expect((await stats(token)).status).toBe(200) // kesh isitildi

    await settings().updateOne({ key: 'admin_tokens_valid_after' }, { $set: { value: new Date().toISOString() } }, { upsert: true })
    sessions.resetCache() // TTL tugashini modellashtiradi

    expect((await stats(token)).status).toBe(401)
  })

  test("kesh TTL ichida DB o'qilmaydi (har so'rovda DB'ga bormaydi)", async () => {
    const first = await sessions.getCutoffs()
    expect(first.tokensValidAfterSec).toBeNull()

    await settings().updateOne({ key: 'admin_tokens_valid_after' }, { $set: { value: new Date().toISOString() } }, { upsert: true })

    expect((await sessions.getCutoffs()).tokensValidAfterSec).toBeNull() // hali keshdan
    sessions.resetCache()
    expect((await sessions.getCutoffs()).tokensValidAfterSec).not.toBeNull()
  })

  test("DB'dagi parol o'zgargan vaqt ham eski tokenlarni rad etadi (env bo'sh bo'lsa ham)", async () => {
    await settings().updateOne({ key: 'admin_password_changed_at' }, { $set: { value: new Date().toISOString() } }, { upsert: true })
    sessions.resetCache()
    expect(process.env.ADMIN_PASSWORD_CHANGED_AT).toBeUndefined()

    expect((await stats(getAuthToken('admin', { issuedSecondsAgo: 30 }))).status).toBe(401)
    // Parol o'zgargan soniyadagi/keyingi token (yangi parol bilan kirish) yaroqli
    expect((await stats(getAuthToken())).status).toBe(200)
  })

  test("revokeAllTokens DB'dagi kattaroq chegarani kichigi bilan almashtirmaydi ($max)", async () => {
    const future = new Date(Date.now() + 3600 * 1000).toISOString()
    await settings().updateOne({ key: 'admin_tokens_valid_after' }, { $set: { value: future } }, { upsert: true })

    await sessions.revokeAllTokens()

    expect(await getCutoff()).toBe(future)
  })

  test("DB o'qilmasa (xato) imzosi to'g'ri token rad etilmaydi va 500 bo'lmaydi", async () => {
    sessions.resetCache()
    const original = mongoose.connection.db.collection.bind(mongoose.connection.db)
    const spy = jest.spyOn(mongoose.connection.db, 'collection').mockImplementation(name => {
      if (name === 'settings') throw new Error('DB vaqtincha mavjud emas')
      return original(name)
    })
    try {
      const res = await stats(getAuthToken())
      expect(res.status).toBe(200)
    } finally {
      spy.mockRestore()
    }
  })
})
