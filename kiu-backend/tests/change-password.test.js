const request = require('supertest')
const app = require('../app')
const { getAuthToken, setAdminPassword } = require('./helpers')

// changePasswordLimiter: 5 ta MUVAFFAQIYATSIZ (>= 400) so'rov / 15 daqiqa / IP. Yangi testlar ko'p rad etilgan so'rov
// yuboradi — har biri o'z IP'sidan ketadi, shunda ular bir-birining (va eski testlarning) byudjetini sarflamaydi.
let ipCounter = 0
const nextIp = () => `10.30.0.${++ipCounter}`

describe('POST /api/admin/change-password', () => {
  test('token berilmasa 401 qaytaradi', async () => {
    const res = await request(app)
      .post('/api/admin/change-password')
      .send({ currentPassword: 'x', newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(401)
  })

  test('currentPassword berilmasa 400 qaytaradi (500 emas)', async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/joriy parol/i)
  })

  test('newPassword berilmasa 400 qaytaradi', async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'joriy_parol_123' })
    expect(res.status).toBe(400)
  })

  test("newPassword 8 ta belgidan qisqa bo'lsa 400 qaytaradi", async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'joriy_parol_123', newPassword: 'qisqa' })
    expect(res.status).toBe(400)
  })

  // 3.1: avval 401 edi. 401 — «token yaroqsiz»; token bu yerda yaroqli, rad etilgan narsa joriy parol. Frontend 401 ni
  // sessiya tugagan deb hisoblab adminni chiqarib yuborishi mumkin edi, shuning uchun 403.
  test("noto'g'ri currentPassword bilan 403 qaytaradi (401 emas — token yaroqli)", async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .set('X-Forwarded-For', nextIp())
      .send({ currentPassword: 'notogri_parol', newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(403)
    expect(res.body.error).toBe("Joriy parol noto'g'ri")
  })

  test("noto'g'ri currentPassword: parol o'zgarmaydi, token hamon yaroqli", async () => {
    await setAdminPassword('joriy_parol_123')
    const token = getAuthToken()
    await request(app).post('/api/admin/change-password').set('Authorization', `Bearer ${token}`).set('X-Forwarded-For', nextIp())
      .send({ currentPassword: 'notogri_parol', newPassword: 'yangi_parol_123' })
    const login = await request(app).post('/api/admin/login').send({ username: process.env.ADMIN_USERNAME, password: 'joriy_parol_123' })
    expect(login.status).toBe(200)
    const again = await request(app).post('/api/admin/change-password').set('Authorization', `Bearer ${token}`).set('X-Forwarded-For', nextIp())
      .send({ currentPassword: 'joriy_parol_123', newPassword: 'yangi_parol_123' })
    expect(again.status).toBe(200)
  })

  test("to'g'ri ma'lumotlar bilan parolni almashtiradi (200, success:true)", async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'joriy_parol_123', newPassword: 'yangi_parol_123' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  test('parol almashtirilgach, ESKI parol bilan login endi ishlamaydi', async () => {
    await setAdminPassword('eski_parol_123')
    await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'eski_parol_123', newPassword: 'yangi_parol_456' })

    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: process.env.ADMIN_USERNAME, password: 'eski_parol_123' })
    expect(res.status).toBe(401)
  })

  test('parol almashtirilgach, YANGI parol bilan login ishlaydi', async () => {
    await setAdminPassword('eski_parol_123')
    await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'eski_parol_123', newPassword: 'yangi_parol_456' })

    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: process.env.ADMIN_USERNAME, password: 'yangi_parol_456' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  test('parol almashtirilgandan OLDIN chiqarilgan token endi rad etiladi', async () => {
    await setAdminPassword('eski_parol_123')
    // Bu token parol o'zgarishidan oldin "chiqarilgan" — iat 10 soniya oldin.
    // (iat butun soniya; aks holda o'sha soniya ichida o'zgarish bo'lsa test flaky bo'ladi)
    const oldToken = getAuthToken('admin', { issuedSecondsAgo: 10 })

    await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${oldToken}`)
      .send({ currentPassword: 'eski_parol_123', newPassword: 'yangi_parol_456' })

    // Shu (parol o'zgarishidan oldingi) token bilan boshqa himoyalangan
    // endpointga so'rov — endi rad etilishi kerak
    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${oldToken}`)
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/sessiya|eskirgan/i)
  })

  test('parol almashtirilgandan KEYIN chiqarilgan token ishlashda davom etadi', async () => {
    await setAdminPassword('eski_parol_123')
    await request(app)
      .post('/api/admin/change-password')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ currentPassword: 'eski_parol_123', newPassword: 'yangi_parol_456' })

    // Parol o'zgargandan KEYIN olingan yangi token
    const newLoginRes = await request(app)
      .post('/api/admin/login')
      .send({ username: process.env.ADMIN_USERNAME, password: 'yangi_parol_456' })
    const freshToken = newLoginRes.body.token

    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${freshToken}`)
    expect(res.status).not.toBe(401)
  })

  test("ortiqcha urinishlardan keyin rate limiter 429 qaytaradi", async () => {
    await setAdminPassword('joriy_parol_123')
    const token = getAuthToken()
    let lastStatus
    for (let i = 0; i < 6; i++) {
      const res = await request(app)
        .post('/api/admin/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'notogri', newPassword: 'yangi_parol_123' })
      lastStatus = res.status
    }
    expect(lastStatus).toBe(429)
  })
})

// 3.4: backend frontend'ga ishonmaydi — parol siyosati serverda majburlanadi
describe('POST /api/admin/change-password — parol siyosati (3.4)', () => {
  const change = (currentPassword, newPassword) => request(app)
    .post('/api/admin/change-password')
    .set('Authorization', `Bearer ${getAuthToken()}`)
    .set('X-Forwarded-For', nextIp())
    .send({ currentPassword, newPassword })

  test("yangi parol joriyga teng bo'lsa 400 (parol hash'i qayta yozilmaydi)", async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await change('joriy_parol_123', 'joriy_parol_123')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/farq qilishi kerak/)
  })

  test.each([
    ['password123'],
    ['12345678'],
    ['QWERTY123'],      // katta-kichik harfga e'tiborsiz
    ['admin123'],
    ['kiu12345'],
  ])("keng tarqalgan parol (%s) 400", async newPassword => {
    await setAdminPassword('joriy_parol_123')
    const res = await change('joriy_parol_123', newPassword)
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/keng tarqalgan/)
  })

  test.each([
    [() => `${process.env.ADMIN_USERNAME}_2026`],
    [() => `Yaxshi-${process.env.ADMIN_USERNAME.toUpperCase()}-parol`],
  ])("parol loginni o'z ichiga olsa 400 (katta-kichik harfga e'tiborsiz)", async makePassword => {
    await setAdminPassword('joriy_parol_123')
    const res = await change('joriy_parol_123', makePassword())
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/loginni/)
  })

  test("rad etilgan urinishlardan keyin joriy parol o'zgarmaydi; yaxshi parol qabul qilinadi", async () => {
    await setAdminPassword('joriy_parol_123')
    await change('joriy_parol_123', 'password123')
    const old = await request(app).post('/api/admin/login').send({ username: process.env.ADMIN_USERNAME, password: 'joriy_parol_123' })
    expect(old.status).toBe(200)
    expect((await change('joriy_parol_123', 'Kuchli-yangi-parol-9')).status).toBe(200)
  })

  test("tekshiruv tartibi: noto'g'ri joriy parol + zaif yangi parol → 400 (siyosat bcrypt'dan oldin, hech narsa oshkor bo'lmaydi)", async () => {
    await setAdminPassword('joriy_parol_123')
    const res = await change('notogri_parol', 'password123')
    expect(res.status).toBe(400)
  })
})
