// POST /api/applications — ochiq forma, Telegram'ga xabar yuboradi.
// Asosiy xavf: arizachi ism/xabar maydoniga HTML yozib, adminning Telegram kanaliga
// soxta (bosiladigan) link yuborishi (parse_mode: 'HTML'). Shu sababli escape, xabar
// formati va Telegram ishlamay qolganda ariza yo'qolmasligi tekshiriladi.
//
// Telegram'ga HAQIQIY so'rov ketmaydi: global fetch mock qilinadi.
// Diqqat: formLimiter 10 so'rov/15 daqiqa/IP. Fayl ichida umumiy hisoblanadi, shuning
// uchun rate limit testi ENG OXIRDA turadi va undan oldin 9 tadan ko'p POST yuborilmaydi.
const request = require('supertest')
const app = require('../app')
const Application = require('../models/Application')

const URL = '/api/applications'
const ADMISSION = { name: 'Ali Valiyev', phone: '+998901234567', faculty: 'Informatika', type: 'admission' }

let fetchSpy

function sent() {
  const [url, options] = fetchSpy.mock.calls[0]
  return { url, payload: JSON.parse(options.body) }
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

describe('POST /api/applications — Telegram xabari', () => {
  test("qabul arizasi: Telegram'ga bitta xabar ketadi (to'g'ri chat, HTML rejim, ma'lumotlar bilan)", async () => {
    const res = await request(app).post(URL).send({ ...ADMISSION, email: 'ali@example.com', message: 'Salom' })
    expect(res.status).toBe(200)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const { url, payload } = sent()
    expect(url).toBe('https://api.telegram.org/bottest-bot-token/sendMessage')
    expect(payload.chat_id).toBe('12345')
    expect(payload.parse_mode).toBe('HTML')
    expect(payload.text).toContain('Qabul arizasi')
    expect(payload.text).toContain('Ali Valiyev')
    expect(payload.text).toContain('+998901234567')
    expect(payload.text).toContain('ali@example.com')
    expect(payload.text).toContain('Informatika')
    expect(payload.text).toContain('Salom')
  })

  test("vakansiya arizasi: boshqa shablon, lavozim/ta'lim/tajriba maydonlari bilan", async () => {
    const res = await request(app).post(URL).send({
      name: 'Vali', phone: '+998901234567', type: 'vacancy',
      position: 'Dasturchi', education: 'Oliy', experience: '3 yil',
    })
    expect(res.status).toBe(200)

    const { payload } = sent()
    expect(payload.text).toContain('Vakansiya arizasi')
    expect(payload.text).not.toContain('Qabul arizasi')
    expect(payload.text).toContain('Dasturchi')
    expect(payload.text).toContain('Oliy')
    expect(payload.text).toContain('3 yil')
  })

  test("bo'sh ixtiyoriy maydonlar xabarga qo'shilmaydi", async () => {
    await request(app).post(URL).send({ name: 'Ali', phone: '+998901234567' })

    const { payload } = sent()
    expect(payload.text).not.toContain('undefined')
    expect(payload.text).not.toContain('null')
    // Faqat sarlavha + ism + telefon: ikkita "\n\n"/"\n" bo'lagi, ortiqcha qator yo'q
    expect(payload.text.split('\n').filter(Boolean)).toHaveLength(3)
  })

  test("XSS/HTML in'ektsiya: ism va xabar ichidagi teg'lar escape qilinadi (Telegram link'i yasalmaydi)", async () => {
    const res = await request(app).post(URL).send({
      name: '<a href="https://evil.example">Bosing</a> & Ko',
      phone: '+998901234567',
      message: '<b>qalin</b> <script>alert(1)</script>',
    })
    expect(res.status).toBe(200)

    const { payload } = sent()
    expect(payload.text).not.toMatch(/<a\s|<\/a>|<b>|<script/i)
    expect(payload.text).toContain('&lt;a href="https://evil.example"&gt;Bosing&lt;/a&gt; &amp; Ko')
    expect(payload.text).toContain('&lt;b&gt;qalin&lt;/b&gt;')
    // & ikki marta escape qilinmasligi kerak (&amp;lt; emas)
    expect(payload.text).not.toContain('&amp;lt;')
  })

  test("xabar matni 200 belgigacha qisqartiriladi (Telegram'ning 4096 limitidan himoya)", async () => {
    await request(app).post(URL).send({ ...ADMISSION, message: 'x'.repeat(3000) })

    const { payload } = sent()
    expect(payload.text).toContain('x'.repeat(200))
    expect(payload.text).not.toContain('x'.repeat(201))
  })

  test("BOT_TOKEN yo'q bo'lsa: Telegram'ga murojaat qilinmaydi, lekin ariza saqlanadi (200)", async () => {
    delete process.env.BOT_TOKEN
    const res = await request(app).post(URL).send(ADMISSION)

    expect(res.status).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(await Application.countDocuments()).toBe(1)
  })

  test("Telegram ishlamasa (tarmoq xatosi): ariza baribir saqlanadi va foydalanuvchi 200 oladi", async () => {
    fetchSpy.mockRejectedValue(new Error('ETIMEDOUT'))
    const res = await request(app).post(URL).send(ADMISSION)

    expect(res.status).toBe(200)
    expect(await Application.countDocuments()).toBe(1)
  })

  test("validatsiyadan o'tmagan ariza (noto'g'ri telefon): 400, saqlanmaydi, Telegram'ga ketmaydi", async () => {
    const res = await request(app).post(URL).send({ name: 'Ali', phone: '123' })

    expect(res.status).toBe(400)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(await Application.countDocuments()).toBe(0)
  })

  test("body umuman yuborilmasa: 5xx emas, 400 qaytadi", async () => {
    const res = await request(app).post(URL)

    expect(res.status).toBe(400)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

// ENG OXIRDA: formLimiter byudjetini (10/15 daqiqa) sarflaydi.
describe('POST /api/applications — formLimiter', () => {
  test("ketma-ket ko'p so'rov (spam) 429 bilan to'xtatiladi", async () => {
    let blockedAt = null
    for (let i = 1; i <= 12; i++) {
      const res = await request(app).post(URL).send(ADMISSION)
      if (res.status === 429) { blockedAt = i; break }
    }
    expect(blockedAt).not.toBeNull()
    // Fayl boshida yuborilgan 9 ta so'rov ham hisobga kiradi, shuning uchun juda tez to'xtaydi
    expect(blockedAt).toBeLessThanOrEqual(3)
  })
})