// Auth qatlami chuqur tekshiruvi: JWT hujumlari, login'da username aniqlash (enumeration),
// noto'g'ri formatdagi body va login rate limiter. Oddiy holatlar auth.test.js,
// admin.test.js va change-password.test.js'da.
//
// Rate limiter IP bo'yicha ishlaydi (app.set('trust proxy', 1) tufayli X-Forwarded-For'dan
// olinadi). Har test o'z IP'sini ishlatadi — shunda 5 urinishlik byudjetlar bir-biriga
// ta'sir qilmaydi va test tartibiga bog'liq bo'lmaydi.
const request = require('supertest')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const app = require('../app')
const { getAuthToken, setAdminPassword } = require('./helpers')

const PASSWORD = 'togri_parol_123'
const b64url = obj => Buffer.from(JSON.stringify(obj)).toString('base64url')

let ipCounter = 0
const nextIp = () => `10.20.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`

const login = (body, ip = nextIp()) => request(app).post('/api/admin/login').set('X-Forwarded-For', ip).send(body)
const goodLogin = ip => login({ username: process.env.ADMIN_USERNAME, password: PASSWORD }, ip)
const badLogin = ip => login({ username: process.env.ADMIN_USERNAME, password: 'notogri_parol' }, ip)
const stats = header => request(app).get('/api/stats').set('Authorization', header)

beforeEach(async () => { await setAdminPassword(PASSWORD) })

// ───────────────────────── auth middleware ─────────────────────────
describe('auth middleware — token hujumlari', () => {
  test("alg: none (imzosiz) token rad etiladi", async () => {
    const token = `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ username: 'admin' })}.`
    expect((await stats(`Bearer ${token}`)).status).toBe(401)
  })

  test("payload o'zgartirilgan, imzosi eski token rad etiladi", async () => {
    const [header, , signature] = getAuthToken().split('.')
    const forged = `${header}.${b64url({ username: 'hacker', exp: Math.floor(Date.now() / 1000) + 99999 })}.${signature}`
    expect((await stats(`Bearer ${forged}`)).status).toBe(401)
  })

  test.each([
    ["Bearer prefiksisiz (faqat token)", () => getAuthToken()],
    ["faqat 'Bearer'", () => 'Bearer'],
    ["'Bearer ' va bo'sh token", () => 'Bearer '],
  ])('%s → 401', async (_label, header) => {
    expect((await stats(header())).status).toBe(401)
  })

  test("HOZIRGI XATTI-HARAKAT: sxema nomi tekshirilmaydi — 'Basic <to'g'ri token>' ham o'tadi", async () => {
    // middleware/auth.js faqat `split(' ')[1]` oladi. Xavf past (token baribir imzo bilan
    // tekshiriladi), lekin bu kutilmagan lenientlik. Tuzatilsa (faqat 'Bearer' qabul qilinsa)
    // bu test yiqiladi — shunda 401 kutadigan qilib o'zgartiring.
    expect((await stats(`Basic ${getAuthToken()}`)).status).toBe(200)
  })

  test("haqiqiy login tokeni: /api/stats'ga kirish beradi, 7 kunlik muddat, ichida parol/hash yo'q", async () => {
    const res = await goodLogin()
    expect(res.status).toBe(200)
    expect((await stats(`Bearer ${res.body.token}`)).status).toBe(200)

    const payload = jwt.decode(res.body.token)
    expect(payload.username).toBe(process.env.ADMIN_USERNAME)
    expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60)
    expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'username'])
  })
})

// ───────────────────────── login: username aniqlash ─────────────────────────
describe('POST /api/admin/login — username aniqlash (enumeration) himoyasi', () => {
  let compareSpy
  beforeEach(() => { compareSpy = jest.spyOn(bcrypt, 'compare') })
  afterEach(() => { compareSpy.mockRestore() })

  test("noto'g'ri username: bcrypt.compare baribir chaqiriladi (dummy hash bilan, cost 12) — vaqt farqi yo'q", async () => {
    const res = await login({ username: 'notogri_user', password: PASSWORD })

    expect(res.status).toBe(401)
    expect(compareSpy).toHaveBeenCalledTimes(1)
    const hashUsed = compareSpy.mock.calls[0][1]
    expect(hashUsed).not.toBe(process.env.ADMIN_PASSWORD_HASH)
    expect(hashUsed).toMatch(/^\$2[aby]\$12\$/)
  })

  test("to'g'ri username + noto'g'ri parol: haqiqiy hash bilan taqqoslanadi", async () => {
    await badLogin()
    expect(compareSpy).toHaveBeenCalledTimes(1)
    expect(compareSpy.mock.calls[0][1]).toBe(process.env.ADMIN_PASSWORD_HASH)
  })

  test("ikkala holatda javob (status va matn) bir xil — mijoz farqni sezmaydi", async () => {
    const wrongUser = await login({ username: 'notogri_user', password: 'notogri_parol' })
    const wrongPass = await badLogin()
    expect(wrongUser.status).toBe(wrongPass.status)
    expect(wrongUser.body).toEqual(wrongPass.body)
  })
})

// ───────────────────────── login: noto'g'ri body ─────────────────────────
describe('POST /api/admin/login — noto\'g\'ri formatdagi so\'rovlar', () => {
  const USER = () => process.env.ADMIN_USERNAME

  test("username sifatida obyekt (NoSQL in'ektsiya urinishi {$ne: null}) 401 — kirish berilmaydi", async () => {
    const res = await login({ username: { $ne: null }, password: 'x' })
    // Hozir 401; turlarni tekshiruvchi tuzatish kiritilsa 400 bo'ladi — ikkalasi ham xavfsiz.
    expect([400, 401]).toContain(res.status)
    expect(res.body.token).toBeUndefined()
  })

  test("JSON massiv body: 400", async () => {
    expect((await login([])).status).toBe(400)
  })

  // BILINGAN KAMCHILIKLAR: quyidagilar hozir 500 qaytaradi (bcrypt "Illegal arguments" yoki
  // req.body undefined), aslida 400 bo'lishi kerak. `.failing` tuzatilgach o'zi xabar beradi
  // ("expected to fail but passed"): shunda `.failing` ni olib tashlang.
  test("body umuman yuborilmasa 400 (500 emas)", async () => {
    const res = await request(app).post('/api/admin/login').set('X-Forwarded-For', nextIp())
    expect(res.status).toBe(400)
  })

  test("text/plain body 400 (500 emas)", async () => {
    const res = await request(app).post('/api/admin/login').set('X-Forwarded-For', nextIp())
      .set('Content-Type', 'text/plain').send('salom')
    expect(res.status).toBe(400)
  })

  test.each([
    ['obyekt ({$gt: ""})', { $gt: '' }],
    ['son', 12345],
    ['massiv', ['a']],
    ['boolean', true],
  ])("parol %s bo'lsa 400 (500 emas)", async (_label, password) => {
    const res = await login({ username: USER(), password })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/admin/change-password — noto\'g\'ri formatdagi so\'rovlar (BILINGAN KAMCHILIKLAR)', () => {
  const cp = ip => request(app)
    .post('/api/admin/change-password')
    .set('Authorization', `Bearer ${getAuthToken()}`)
    .set('X-Forwarded-For', ip ?? nextIp())

  test("body umuman yuborilmasa 400 (500 emas)", async () => {
    expect((await cp()).status).toBe(400)
  })

  test("currentPassword obyekt bo'lsa 400 (500 emas)", async () => {
    const res = await cp().send({ currentPassword: { a: 1 }, newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(400)
  })

  test("newPassword obyekt ({length: 99}) bo'lsa 400 — uzunlik tekshiruvidan o'tib ketmasin", async () => {
    const res = await cp().send({ currentPassword: PASSWORD, newPassword: { length: 99 } })
    expect(res.status).toBe(400)
  })

  test("newPassword 72 baytdan uzun bo'lsa 400 (bcrypt qolganini jim kesib tashlardi)", async () => {
    const res = await cp().send({ currentPassword: PASSWORD, newPassword: 'a'.repeat(73) })
    expect(res.status).toBe(400)
  })

  test("uzunlik belgi bilan emas BAYT bilan o'lchanadi: 37 ta kirill belgi = 74 bayt → 400", async () => {
    const pwd = 'ў'.repeat(37)
    expect(pwd.length).toBeLessThan(72)
    const res = await cp().send({ currentPassword: PASSWORD, newPassword: pwd })
    expect(res.status).toBe(400)
  })

  test("rad etilgan urinishdan keyin eski parol o'zgarmaydi", async () => {
    await cp().send({ currentPassword: PASSWORD, newPassword: 'a'.repeat(73) })
    expect((await goodLogin(nextIp())).status).toBe(200)
  })

  test("aynan 72 bayt qabul qilinadi", async () => {
    const res = await cp().send({ currentPassword: PASSWORD, newPassword: 'a'.repeat(72) })
    expect(res.status).toBe(200)
  })
})

// ───────────────────────── login rate limiter ─────────────────────────
describe('POST /api/admin/login — loginLimiter (5 muvaffaqiyatsiz urinish / 15 daqiqa / IP)', () => {
  test("5 ta noto'g'ri urinishdan keyin 6-si 429; hatto TO'G'RI parol ham bloklanadi", async () => {
    const ip = nextIp()
    for (let i = 0; i < 5; i++) expect((await badLogin(ip)).status).toBe(401)

    const blocked = await goodLogin(ip)
    expect(blocked.status).toBe(429)
    expect(blocked.body.token).toBeUndefined()
    expect(blocked.body.error).toMatch(/15 daqiqa/)
  })

  test("muvaffaqiyatli loginlar byudjetni sarflamaydi (skipSuccessfulRequests)", async () => {
    const ip = nextIp()
    for (let i = 0; i < 4; i++) expect((await badLogin(ip)).status).toBe(401)
    for (let i = 0; i < 6; i++) expect((await goodLogin(ip)).status).toBe(200) // 5 dan ko'p, lekin sanalmaydi
    expect((await badLogin(ip)).status).toBe(401) // 5-muvaffaqiyatsiz — hali ruxsat
    expect((await badLogin(ip)).status).toBe(429) // 6-si bloklanadi
  })

  test("blok IP bo'yicha: bir IP bloklansa, boshqa IP kira oladi", async () => {
    const blockedIp = nextIp()
    for (let i = 0; i < 6; i++) await badLogin(blockedIp)
    expect((await badLogin(blockedIp)).status).toBe(429)

    expect((await goodLogin(nextIp())).status).toBe(200)
  })

  test("login bloklangan IP change-password'dan ham bloklanmaydi (alohida hisoblagichlar)", async () => {
    const ip = nextIp()
    for (let i = 0; i < 6; i++) await badLogin(ip)
    expect((await badLogin(ip)).status).toBe(429)

    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .set('X-Forwarded-For', ip)
      .send({ currentPassword: 'notogri_parol', newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(403) // 429 emas (noto'g'ri joriy parol — 3.1: 401 dan 403 ga o'zgardi)
  })
})
