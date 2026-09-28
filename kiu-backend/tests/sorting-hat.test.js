// POST /api/sorting-hat-lead — ochiq (auth'siz) endpoint, Telegram'ga xabar yuboradi.
// Loyiha xotirasida bu endpoint uchun "hal qilinmagan 500" xatosi qayd etilgan —
// bu fayl uning sababini topish va qayta paydo bo'lishining oldini olish uchun.
//
// Telegram'ga HAQIQIY so'rov ketmaydi: global fetch mock qilinadi.
// Diqqat: formLimiter 10 so'rov/15 daqiqa/IP. Limiter Jest'da har test fayli uchun
// alohida yuklanadi, lekin fayl ichida umumiy — shu sababli bu faylda 10 tadan ko'p
// so'rov yuborilmasin. HOZIRGI HOLAT: bu fayl aynan 10 ta so'rov yuboradi (byudjet
// to'liq band) — yangi test qo'shishdan oldin avval mavjud testlardan birini shu
// so'rov ichida (qo'shimcha assert bilan) qamrab olish mumkinmi, shuni tekshiring.
const request = require('supertest')
const app = require('../app')
const SortingHatLead = require('../models/SortingHatLead')

const URL = '/api/sorting-hat-lead'
const VALID = { name: 'Ali Valiyev', phone: '+998901234567', faculties: ['Informatika', 'Iqtisodiyot'] }

let fetchSpy

// Yuborilgan Telegram xabarining matnini olish
function sentText() {
  const [, options] = fetchSpy.mock.calls[0]
  return JSON.parse(options.body).text
}

beforeEach(() => {
  process.env.BOT_TOKEN = 'test-bot-token'
  process.env.TELEGRAM_CHAT_ID = '12345'
  fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
})

afterEach(() => {
  fetchSpy.mockRestore()
  delete process.env.BOT_TOKEN
  delete process.env.TELEGRAM_CHAT_ID
})

describe('POST /api/sorting-hat-lead', () => {
  test('ism yoki telefon bo\'lmasa 400 qaytaradi va Telegram\'ga yubormaydi', async () => {
    const noName = await request(app).post(URL).send({ phone: VALID.phone })
    expect(noName.status).toBe(400)
    const noPhone = await request(app).post(URL).send({ name: VALID.name })
    expect(noPhone.status).toBe(400)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test("to'g'ri ma'lumot bilan 200 qaytaradi va Telegram'ga bitta xabar yuboradi", async () => {
    const res = await request(app).post(URL).send(VALID)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.telegram.org/bottest-bot-token/sendMessage')
    const payload = JSON.parse(options.body)
    expect(payload.chat_id).toBe('12345')
    expect(payload.parse_mode).toBe('HTML')
    expect(payload.text).toContain('Ali Valiyev')
    expect(payload.text).toContain('1. Informatika')
    expect(payload.text).toContain('2. Iqtisodiyot')

    // Band 6 (admin statistika dashboard'i) uchun qo'shilgan: natija endi
    // Telegram'ga qo'shimcha ravishda DB'ga (SortingHatLead) ham yoziladi —
    // shu SO'ROVNING o'zidan foydalanamiz (formLimiter byudjetini tejash uchun,
    // pastdagi izohga qarang).
    const saved = await SortingHatLead.findOne({ name: VALID.name })
    expect(saved).not.toBeNull()
    expect(saved.phone).toBe(VALID.phone)
    expect(saved.faculties).toEqual(VALID.faculties)
  })

  test("body umuman yuborilmasa (Content-Type yo'q) 500 emas, 400 qaytaradi", async () => {
    // Express 5'da JSON parser ishlamagan so'rovda req.body === undefined bo'ladi.
    // `const { name } = req.body` bunda TypeError beradi.
    const res = await request(app).post(URL)
    expect(res.status).toBe(400)
  })

  test("faculties massiv bo'lmasa ham xabar yuboriladi (bo'sh ro'yxat bilan), 500 bermaydi", async () => {
    const res = await request(app).post(URL).send({ ...VALID, faculties: 'Informatika' })
    expect(res.status).toBe(200)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(sentText()).not.toContain('1. ')
  })

  test("name/phone satr bo'lmasa (obyekt) server yiqilmaydi (5xx bermaydi)", async () => {
    const res = await request(app).post(URL).send({ name: { a: 1 }, phone: ['x'] })
    expect(res.status).toBeLessThan(500)
  })

  test("Telegram xabaridagi HTML foydalanuvchi kiritganda escape qilinadi (soxta link in'ektsiyasi)", async () => {
    const evil = '<a href="http://evil.example">bosing</a>'
    const res = await request(app).post(URL).send({ name: evil, phone: '&<>', faculties: [evil] })
    expect(res.status).toBe(200)

    const text = sentText()
    expect(text).not.toContain('<a href="http://evil.example">')
    expect(text).toContain('&lt;a href="http://evil.example"&gt;bosing&lt;/a&gt;')
    expect(text).toContain('&amp;&lt;&gt;') // & avval escape qilinadi, ikki marta emas
    // Xabarning o'z (ishonchli) tegi saqlanib qolgan bo'lishi kerak
    expect(text).toContain('<b>Ism:</b>')
  })

  test('Telegram so\'rovi tarmoq xatosi bilan yiqilsa ham foydalanuvchi 200 oladi', async () => {
    fetchSpy.mockRejectedValue(new Error('network down'))
    const res = await request(app).post(URL).send(VALID)
    expect(res.status).toBe(200)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  test("BOT_TOKEN/TELEGRAM_CHAT_ID sozlanmagan bo'lsa Telegram'ga so'rov ketmaydi, lekin 200 qaytadi", async () => {
    delete process.env.BOT_TOKEN
    delete process.env.TELEGRAM_CHAT_ID
    const res = await request(app).post(URL).send(VALID)
    expect(res.status).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  // MUHIM regressiya testi: bu endpoint tarixida "hal qilinmagan 500" xatosi
  // bo'lgan (fayl boshidagi izohga qarang). DB yozish ATAYLAB asosiy oqimdan
  // mustaqil — statistika yozuvi validatsiyadan o'tmasa ham (masalan 10 tadan
  // ortiq fakultet), foydalanuvchi baribir 200 va Telegram xabarini olishi shart.
  test("DB yozish validatsiyadan o'tmasa ham (10 tadan ortiq fakultet) foydalanuvchi baribir 200 va Telegram xabarini oladi", async () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => `Fakultet${i}`)
    const res = await request(app).post(URL).send({ ...VALID, faculties: tooMany })

    expect(res.status).toBe(200)
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    // DB'ga yozilmagan (validatsiya rad etdi), lekin bu asosiy javobga ta'sir qilmadi
    expect(await SortingHatLead.findOne({ name: VALID.name })).toBeNull()
  })
})
