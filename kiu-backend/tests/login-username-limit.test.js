// 3.6: admin logini bo'yicha umumiy chegara — 30 ta muvaffaqiyatsiz urinish / 15 daqiqa, BARCHA IP'lar bo'yicha.
// IP bo'yicha `loginLimiter` (5/IP) bilan birga ishlaydi; batafsil va trade-off (DoS) — middleware/rateLimiters.js.
// Har IP o'z `loginLimiter` byudjetida (5 ta) qoladi; umumiy hisoblagich testlar orasida setup.js da nolga qaytariladi.
const request = require('supertest')
const app = require('../app')
const { getAuthToken, setAdminPassword } = require('./helpers')

const PASSWORD = 'togri_parol_123'
const USERNAME = () => process.env.ADMIN_USERNAME

let ipCounter = 0
const nextIp = () => `10.50.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`
const login = (body, ip = nextIp()) => request(app).post('/api/admin/login').set('X-Forwarded-For', ip).send(body)
const bad = ip => login({ username: USERNAME(), password: 'notogri_parol' }, ip)
const good = ip => login({ username: USERNAME(), password: PASSWORD }, ip)

// n ta muvaffaqiyatsiz urinish, har biri o'z IP'dan (IP limiti 5 ta — shuning uchun bir IP'dan ko'pi bilan 5 tadan)
async function failFromManyIps(n) {
  let left = n
  while (left > 0) {
    const ip = nextIp()
    for (let i = 0; i < Math.min(5, left); i++) expect((await bad(ip)).status).toBe(401)
    left -= 5
  }
}

beforeEach(async () => { await setAdminPassword(PASSWORD) })

describe('POST /api/admin/login — admin logini bo\'yicha umumiy limit (3.6)', () => {
  test("30 ta muvaffaqiyatsiz urinishdan keyin YANGI IP'dan ham (hatto to'g'ri parol bilan) 429", async () => {
    await failFromManyIps(30)
    const res = await good(nextIp())
    expect(res.status).toBe(429)
    expect(res.body.token).toBeUndefined()
    expect(res.body.error).toMatch(/15 daqiqa/)
  })

  test("29 ta urinishdan keyin hali kirish mumkin (chegara aynan 30)", async () => {
    await failFromManyIps(29)
    expect((await good(nextIp())).status).toBe(200)
  })

  test("javob IP limiti javobi bilan aynan bir xil: matn va sarlavhalar (login to'g'riligi oshkor bo'lmaydi)", async () => {
    // IP limiti bloklagan javob
    const ipA = nextIp()
    for (let i = 0; i < 5; i++) await bad(ipA)
    const byIp = await bad(ipA)
    expect(byIp.status).toBe(429)

    // umumiy limit bloklagan javob
    await failFromManyIps(30)
    const byUsername = await good(nextIp())
    expect(byUsername.status).toBe(429)

    expect(byUsername.body).toEqual(byIp.body)
    // umumiy limit o'zining sarlavhalarini qo'shmaydi (aks holda «30» limiti login mavjudligini ko'rsatardi)
    expect(byUsername.headers['ratelimit-limit']).toBe('5')
  })

  test("boshqa login'lar sanalmaydi va bloklanmaydi (hisoblagich faqat haqiqiy admin logini uchun)", async () => {
    await failFromManyIps(30)
    // admin bloklangan, lekin boshqa kiritilgan matn oddiy 401 oladi (IP limiti ichida)
    const ip = nextIp()
    expect((await login({ username: 'boshqa_foydalanuvchi', password: 'x' }, ip)).status).toBe(401)
    expect((await login({ username: USERNAME().toUpperCase() + 'x', password: 'x' }, ip)).status).toBe(401)
  })

  test("boshqa login'dagi urinishlar admin byudjetini sarflamaydi", async () => {
    for (let k = 0; k < 7; k++) {
      const ip = nextIp()
      for (let i = 0; i < 5; i++) await login({ username: 'boshqa_foydalanuvchi', password: 'x' }, ip) // 35 ta
    }
    expect((await good(nextIp())).status).toBe(200)
  })

  test("muvaffaqiyatli loginlar sanalmaydi (skipSuccessfulRequests)", async () => {
    for (let i = 0; i < 35; i++) expect((await good(nextIp())).status).toBe(200)
    expect((await bad(nextIp())).status).toBe(401)
  })

  test("IP limiti bilan bloklangan so'rovlar umumiy hisoblagichni oshirmaydi", async () => {
    const ip = nextIp()
    for (let i = 0; i < 5; i++) expect((await bad(ip)).status).toBe(401)
    for (let i = 0; i < 10; i++) expect((await bad(ip)).status).toBe(429) // IP limiti — umumiy hisobga kirmaydi
    await failFromManyIps(20) // jami haqiqiy xato: 25 (agar 10 ta bloklanganlar sanalsa — 35 bo'lardi)
    expect((await good(nextIp())).status).toBe(200)
  })

  test("allaqachon kirgan admin (JWT) umumiy limitdan ta'sirlanmaydi", async () => {
    const token = getAuthToken(USERNAME())
    await failFromManyIps(30)
    expect((await good(nextIp())).status).toBe(429)
    const me = await request(app).get('/api/admin/me').set('Authorization', `Bearer ${token}`)
    expect(me.status).toBe(200)
  })

  test("login satr bo'lmasa (raqam / obyekt / yo'q) — 400, xato emas va hisoblagich oshmaydi", async () => {
    for (const body of [{ username: 5, password: 'x' }, { username: { $ne: '' }, password: 'x' }, { password: 'x' }, {}]) {
      expect((await login(body)).status).toBe(400)
    }
    await failFromManyIps(25)
    expect((await good(nextIp())).status).toBe(200)
  })
})
