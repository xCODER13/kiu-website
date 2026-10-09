// Admin xavfsizlik jurnali (3.7): login / parol / «barcha qurilmalardan chiqish» / o'chirish voqealari.
// Asosiy talab: jurnalda HECH QACHON parol, hash, token yoki kiritilgan login matni bo'lmaydi.
const request = require('supertest')
const app = require('../app')
const AuditLog = require('../models/AuditLog')
const { AUDIT_EVENTS, AUDIT_RETENTION_DAYS } = AuditLog
const { getAuthToken, setAdminPassword } = require('./helpers')

const PASSWORD = 'togri_parol_123'
const USERNAME = () => process.env.ADMIN_USERNAME

// Har so'rov o'z IP'sidan (limiter byudjetlari aralashmasin; fayl boshiga ≤30 mutatsiya/IP qoidasi).
let ipCounter = 0
const nextIp = () => `10.40.0.${++ipCounter}`
const bearer = () => ({ Authorization: `Bearer ${getAuthToken(USERNAME())}` })
const logs = (filter = {}) => AuditLog.find(filter).lean()
const login = (body, ip) => request(app).post('/api/admin/login').set('X-Forwarded-For', ip).send(body)

describe('AuditLog modeli', () => {
  test(`TTL indeks mavjud (${AUDIT_RETENTION_DAYS} kun)`, async () => {
    await AuditLog.init()
    const indexes = await AuditLog.collection.indexes()
    const ttl = indexes.find(i => i.key?.createdAt === 1)
    expect(ttl?.expireAfterSeconds).toBe(AUDIT_RETENTION_DAYS * 24 * 60 * 60)
  })

  test("noma'lum voqea turi rad etiladi", async () => {
    await expect(AuditLog.create({ event: 'boshqa' })).rejects.toThrow()
    expect(AUDIT_EVENTS).toContain('delete')
  })
})

describe('login jurnali', () => {
  test('muvaffaqiyatli login: login_success, IP va actor yoziladi', async () => {
    await setAdminPassword(PASSWORD)
    const ip = nextIp()
    const res = await login({ username: USERNAME(), password: PASSWORD }, ip)
    expect(res.status).toBe(200)
    const [row] = await logs({ event: 'login_success' })
    expect(row).toMatchObject({ ip, actor: USERNAME() })
    expect(row.createdAt).toBeInstanceOf(Date)
  })

  test("noto'g'ri parol: login_failed yoziladi, kiritilgan login/parol SAQLANMAYDI", async () => {
    await setAdminPassword(PASSWORD)
    const ip = nextIp()
    const typedUser = 'kimdir_boshqa_login'
    const typedPass = 'maxfiy_notogri_parol_999'
    const res = await login({ username: typedUser, password: typedPass }, ip)
    expect(res.status).toBe(401)
    const rows = await logs()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ event: 'login_failed', ip, actor: '' })
    const dump = JSON.stringify(rows)
    expect(dump).not.toContain(typedUser)
    expect(dump).not.toContain(typedPass)
  })

  test("to'g'ri login + noto'g'ri parol ham login_failed, actor bo'sh", async () => {
    await setAdminPassword(PASSWORD)
    await login({ username: USERNAME(), password: 'notogri_parol' }, nextIp())
    const [row] = await logs()
    expect(row).toMatchObject({ event: 'login_failed', actor: '' })
  })

  test("400 (noto'g'ri body) jurnalga yozilmaydi", async () => {
    await setAdminPassword(PASSWORD)
    await login({ username: 5 }, nextIp())
    expect(await logs()).toHaveLength(0)
  })
})

describe('parol almashtirish jurnali', () => {
  const change = (body, ip = nextIp()) =>
    request(app).post('/api/admin/change-password').set('X-Forwarded-For', ip).set(bearer()).send(body)

  test("noto'g'ri joriy parol: password_change_failed, parollar saqlanmaydi", async () => {
    await setAdminPassword(PASSWORD)
    const ip = nextIp()
    const res = await change({ currentPassword: 'notogri_joriy_777', newPassword: 'yangi_xavfsiz_parol_456' }, ip)
    expect(res.status).toBe(403)
    const rows = await logs()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ event: 'password_change_failed', ip, actor: USERNAME() })
    const dump = JSON.stringify(rows)
    expect(dump).not.toContain('notogri_joriy_777')
    expect(dump).not.toContain('yangi_xavfsiz_parol_456')
  })

  test("muvaffaqiyatli almashtirish: password_changed, hash/parol yo'q", async () => {
    await setAdminPassword(PASSWORD)
    const res = await change({ currentPassword: PASSWORD, newPassword: 'yangi_xavfsiz_parol_456' })
    expect(res.status).toBe(200)
    const rows = await logs()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ event: 'password_changed', actor: USERNAME() })
    const dump = JSON.stringify(rows)
    expect(dump).not.toContain('yangi_xavfsiz_parol_456')
    expect(dump).not.toContain(PASSWORD)
    expect(dump).not.toMatch(/\$2[aby]\$/) // bcrypt hash
  })

  test('validatsiya (400) rad etishi jurnalga yozilmaydi', async () => {
    await setAdminPassword(PASSWORD)
    const res = await change({ currentPassword: PASSWORD, newPassword: 'qisqa' })
    expect(res.status).toBe(400)
    expect(await logs()).toHaveLength(0)
  })
})

describe('barcha qurilmalardan chiqish jurnali', () => {
  test('logout_all yoziladi', async () => {
    const ip = nextIp()
    const res = await request(app).post('/api/admin/logout-all').set('X-Forwarded-For', ip).set(bearer())
    expect(res.status).toBe(200)
    const [row] = await logs()
    expect(row).toMatchObject({ event: 'logout_all', ip, actor: USERNAME() })
  })

  test('tokensiz so\'rov (401) jurnalga yozilmaydi', async () => {
    await request(app).post('/api/admin/logout-all').set('X-Forwarded-For', nextIp())
    expect(await logs()).toHaveLength(0)
  })
})

describe("o'chirish jurnali (5 resurs)", () => {
  const cases = [
    ['events', require('../models/Event')],
    ['news', require('../models/News')],
    ['gallery', require('../models/Gallery')],
    ['teachers', require('../models/Teacher')],
    ['applications', require('../models/Application')],
  ]

  test.each(cases)('/api/%s: DELETE «delete» yozadi — faqat resurs va ID, sarlavha emas', async (resource, Model) => {
    // Validatsiyani chetlab o'tamiz — faqat hujjat bo'lishi kerak.
    const { insertedId } = await Model.collection.insertOne({ title: 'MAXFIY_SARLAVHA_XYZ', name: 'MAXFIY_ISM_XYZ' })
    const ip = nextIp()
    const res = await request(app).delete(`/api/${resource}/${insertedId}`).set('X-Forwarded-For', ip).set(bearer())
    expect(res.status).toBe(200)
    const rows = await logs()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ event: 'delete', resource, targetId: String(insertedId), ip, actor: USERNAME() })
    expect(JSON.stringify(rows)).not.toContain('MAXFIY')
  })

  test.each(cases)("/api/%s: yo'q ID uchun 404 jurnalga yozilmaydi", async (resource) => {
    const res = await request(app)
      .delete(`/api/${resource}/507f1f77bcf86cd799439011`)
      .set('X-Forwarded-For', nextIp())
      .set(bearer())
    expect(res.status).toBe(404)
    expect(await logs()).toHaveLength(0)
  })

  test('tokensiz DELETE (401) jurnalga yozilmaydi', async () => {
    await request(app).delete('/api/news/507f1f77bcf86cd799439011').set('X-Forwarded-For', nextIp())
    expect(await logs()).toHaveLength(0)
  })
})

describe('jurnal xatosi asosiy amalni buzmaydi', () => {
  test('AuditLog.create yiqilsa ham login 200 qaytaradi', async () => {
    await setAdminPassword(PASSWORD)
    const spy = jest.spyOn(AuditLog, 'create').mockRejectedValueOnce(new Error('db yo\'q'))
    try {
      const res = await login({ username: USERNAME(), password: PASSWORD }, nextIp())
      expect(res.status).toBe(200)
      expect(res.body.token).toBeTruthy()
    } finally {
      spy.mockRestore()
    }
  })

  test("AuditLog.create yiqilsa ham o'chirish 200 qaytaradi", async () => {
    const Model = require('../models/News')
    const { insertedId } = await Model.collection.insertOne({ title: 'x' })
    const spy = jest.spyOn(AuditLog, 'create').mockRejectedValueOnce(new Error('db yo\'q'))
    try {
      const res = await request(app).delete(`/api/news/${insertedId}`).set('X-Forwarded-For', nextIp()).set(bearer())
      expect(res.status).toBe(200)
      expect(await Model.collection.countDocuments({ _id: insertedId })).toBe(0)
    } finally {
      spy.mockRestore()
    }
  })
})
