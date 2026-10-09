// POST /api/applications — bir telefon raqamidan takroriy arizani cheklash (4.3):
// oxirgi 24 soatda eng ko'pi bilan 3 ta (turidan qat'i nazar), raqam turlicha yozilsa ham bitta.
// Har so'rov o'z IP'sidan yuboriladi — bu fayl formLimiter (10/15 daq/IP) emas, telefon chegarasini tekshiradi.
const request = require('supertest')
const app = require('../app')
const Application = require('../models/Application')
const { getAuthToken } = require('./helpers')

const URL = '/api/applications'
const PHONE = '+998901234567'
const MAX = 3

let ipCounter = 0
const post = body => request(app).post(URL).set('X-Forwarded-For', `10.50.0.${++ipCounter}`).send(body)
const apply = (overrides = {}) => post({ name: 'Ali Valiyev', phone: PHONE, faculty: 'Informatika', type: 'admission', ...overrides })

async function fillLimit(phone = PHONE) {
  for (let i = 0; i < MAX; i++) expect((await apply({ phone })).status).toBe(200)
}

describe('POST /api/applications — bir raqamdan takroriy ariza', () => {
  test(`bir raqamdan ${MAX} ta ariza o'tadi, keyingisi 429; bazaga yozilmaydi`, async () => {
    await fillLimit()
    const res = await apply()
    expect(res.status).toBe(429)
    expect(res.body.error).toMatch(/juda ko'p ariza/)
    expect(await Application.countDocuments()).toBe(MAX)
  })

  test('tur (qabul/vakansiya) hisobga olinmaydi: chegara umumiy', async () => {
    expect((await apply({ type: 'admission' })).status).toBe(200)
    expect((await apply({ type: 'vacancy', position: 'Dasturchi' })).status).toBe(200)
    expect((await apply({ type: 'vacancy', position: 'Muhandis' })).status).toBe(200)
    expect((await apply({ type: 'admission' })).status).toBe(429)
  })

  test('raqam turlicha yozilsa ham (+, bo\'shliq, defis, 998siz) bitta raqam hisoblanadi', async () => {
    expect((await apply({ phone: '+998901234567' })).status).toBe(200)
    expect((await apply({ phone: '90 123 45 67' })).status).toBe(200)
    expect((await apply({ phone: '998-90-123-45-67' })).status).toBe(200)
    expect((await apply({ phone: '+998 (90) 123 45 67' })).status).toBe(429)
  })

  test("raqamni son sifatida yuborib chegarani aylanib o'tib bo'lmaydi", async () => {
    await fillLimit()
    const res = await apply({ phone: 998901234567 })
    expect(res.status).toBe(429)
  })

  test("boshqa raqamga ta'sir qilmaydi", async () => {
    await fillLimit()
    expect((await apply({ phone: '+998909876543' })).status).toBe(200)
  })

  test("24 soatdan eski arizalar hisobga kirmaydi", async () => {
    const old = new Date(Date.now() - 25 * 60 * 60 * 1000)
    await Application.collection.insertMany(
      Array.from({ length: MAX }, () => ({
        name: 'Eski', phone: PHONE, phoneKey: '998901234567', type: 'admission', status: 'new', createdAt: old, updatedAt: old,
      }))
    )
    await fillLimit() // eski 3 ta sanalmaydi — yangi 3 ta o'tadi
    expect((await apply()).status).toBe(429)
  })

  test("yaroqsiz telefon 400 beradi (429 emas) va hisobga kirmaydi", async () => {
    for (let i = 0; i < MAX + 2; i++) expect((await apply({ phone: '123' })).status).toBe(400)
    expect(await Application.countDocuments()).toBe(0)
    expect((await apply()).status).toBe(200)
  })

  test("429 bo'lganda Telegram'ga xabar ketmaydi", async () => {
    process.env.BOT_TOKEN = 'test-bot-token'
    process.env.TELEGRAM_CHAT_ID = '12345'
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    try {
      await fillLimit()
      expect(fetchSpy).toHaveBeenCalledTimes(MAX)
      expect((await apply()).status).toBe(429)
      expect(fetchSpy).toHaveBeenCalledTimes(MAX)
    } finally {
      fetchSpy.mockRestore()
      delete process.env.BOT_TOKEN
      delete process.env.TELEGRAM_CHAT_ID
    }
  })
})

describe('phoneKey — texnik maydon', () => {
  test('bazada normallashtirilgan raqam saqlanadi', async () => {
    await apply({ phone: '90 123 45 67' })
    const saved = await Application.findOne().select('+phoneKey').lean()
    expect(saved.phone).toBe('90 123 45 67') // foydalanuvchi kiritgani o'zgarmaydi
    expect(saved.phoneKey).toBe('998901234567')
  })

  test("POST javobida ham, admin ro'yxatida ham ko'rinmaydi", async () => {
    const created = await apply()
    expect(created.status).toBe(200)
    expect(created.body).not.toHaveProperty('phoneKey')

    const list = await request(app).get(URL).set('Authorization', `Bearer ${getAuthToken()}`)
    expect(list.status).toBe(200)
    expect(list.body).toHaveLength(1)
    expect(list.body[0]).not.toHaveProperty('phoneKey')
    expect(list.body[0].phone).toBe(PHONE)
  })
})
