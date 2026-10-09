// «Talabalar hayoti» bo'limlari (klublar, sport, kampus): CRUD, tekshiruvlar, xavfsizlik. Storage ishlatilmaydi (rasmsiz yozuvlar);
// rasm/Storage yo'llari — storage-cleanup.test.js. Har so'rov o'z IP'sidan (limiter byudjeti to'qnashmasin).
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const StudentLife = require('../models/StudentLife')
const { STUDENT_LIFE_SECTIONS } = require('../utils/studentLifeSections')
const { getAuthToken } = require('./helpers')

let n = 0
const ip = () => `10.81.${Math.floor(++n / 250)}.${n % 250}`
const authed = () => ({ Authorization: `Bearer ${getAuthToken()}`, 'X-Forwarded-For': ip() })
const pub = () => ({ 'X-Forwarded-For': ip() })
const post = body => request(app).post('/api/student-life').set(authed()).send({ section: 'club', title: 'Shaxmat klubi', ...body })
const put = (id, body) => request(app).put(`/api/student-life/${id}`).set(authed()).send(body)

describe('GET /api/student-life', () => {
  test("auth talab qilmaydi; bo'sh ro'yxat", async () => {
    const res = await request(app).get('/api/student-life').set(pub())
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test("tartib: bo'lim, so'ng `order` (o'sish), so'ng yangisi oldin", async () => {
    await StudentLife.create({ section: 'sport', title: 'S0', order: 0 })
    await StudentLife.create({ section: 'club', title: 'C2', order: 2 })
    await StudentLife.create({ section: 'club', title: 'C1-eski', order: 1 })
    await new Promise(r => setTimeout(r, 5))
    await StudentLife.create({ section: 'club', title: 'C1-yangi', order: 1 })
    const res = await request(app).get('/api/student-life').set(pub())
    expect(res.body.map(i => i.title)).toEqual(['C1-yangi', 'C1-eski', 'C2', 'S0'])
  })

  test('`?section=` faqat shu bo\'limni qaytaradi', async () => {
    await StudentLife.create({ section: 'club', title: 'C' })
    await StudentLife.create({ section: 'sport', title: 'S' })
    const res = await request(app).get('/api/student-life?section=sport').set(pub())
    expect(res.body.map(i => i.title)).toEqual(['S'])
  })

  test.each([
    ['noma\'lum bo\'lim', '?section=bayram'],
    ['bo\'sh bo\'lim', '?section='],
    ['massiv', '?section=club&section=sport'],
  ])("%s -> 400, ma'lumot sizmaydi", async (_, qs) => {
    await StudentLife.create({ section: 'club', title: 'C' })
    const res = await request(app).get(`/api/student-life${qs}`).set(pub())
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Bo'lim noto'g'ri" })
  })

  test('NoSQL operator (`section[$ne]`) so\'rovga o\'tmaydi: 500 yo\'q, faqat ommaviy ma\'lumot', async () => {
    await StudentLife.create({ section: 'club', title: 'C' })
    await StudentLife.create({ section: 'sport', title: 'S' })
    const res = await request(app).get('/api/student-life?section[$ne]=club').set(pub())
    // Parser qavslarni obyektga aylantirmaydi (200, filtrsiz) yoki obyekt kelsa 400 — ikkalasi ham xavfsiz
    expect([200, 400]).toContain(res.status)
    if (res.status === 200) {
      // `$ne` operatori ishlamagan: 'club' chiqarib tashlanmagan
      expect(res.body.map(i => i.title).sort()).toEqual(['C', 'S'])
    }
  })

  test('limit/page: sahifalar takrorsiz va yo\'qolmasdan birlashadi', async () => {
    for (let i = 0; i < 5; i++) await StudentLife.create({ section: 'club', title: `T${i}`, order: 0 })
    const all = []
    for (const page of [1, 2, 3]) {
      const res = await request(app).get(`/api/student-life?limit=2&page=${page}`).set(pub())
      all.push(...res.body.map(i => i._id))
    }
    expect(all).toHaveLength(5)
    expect(new Set(all).size).toBe(5)
  })

  test('STUDENT_LIFE_SECTIONS — 3 ta qiymat', () => {
    expect(STUDENT_LIFE_SECTIONS).toEqual(['club', 'sport', 'campus'])
  })
})

describe('POST /api/student-life', () => {
  test("auth'siz 401, hech narsa yaratilmaydi", async () => {
    const res = await request(app).post('/api/student-life').set(pub()).send({ section: 'club', title: 'X' })
    expect(res.status).toBe(401)
    expect(await StudentLife.countDocuments()).toBe(0)
  })

  test("yaratadi: standartlar (desc '', link '', order 0), `section` kichik harfga, matn kesiladi", async () => {
    const res = await post({ section: ' CLUB ', title: '  Debat klubi  ' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ section: 'club', title: 'Debat klubi', desc: '', link: '', image: '', order: 0 })
  })

  test.each([
    ['section yo\'q', { section: undefined }],
    ['noma\'lum section', { section: 'bayram' }],
    ['title yo\'q', { title: undefined }],
    ['bo\'sh title', { title: '   ' }],
    ['title > 200', { title: 'x'.repeat(201) }],
    ['desc > 2000', { desc: 'x'.repeat(2001) }],
    ['order manfiy', { order: -1 }],
    ['order > 9999', { order: 10000 }],
    ['order kasr', { order: 1.5 }],
    ['order son emas', { order: 'abc' }],
    ['title obyekt (injection)', { title: { $gt: '' } }],
  ])('%s -> 400', async (_, body) => {
    const res = await post(body)
    expect(res.status).toBe(400)
    expect(await StudentLife.countDocuments()).toBe(0)
  })

  test.each([
    'https://t.me/kiu_chess',
    'https://www.instagram.com/kiu.uz/?hl=uz',
  ])("havola qabul qilinadi: %s", async link => {
    const res = await post({ link })
    expect(res.status).toBe(200)
    expect(res.body.link).toBe(link)
  })

  test.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'http://t.me/kiu',
    '//evil.example/x',
    'https://evil.example/ x',
    'https://evil.example/"onmouseover="x',
    'https://evil.example/<script>',
    'ftp://x.example',
    'https://' + 'a'.repeat(300),
  ])("xavfli/noto'g'ri havola rad etiladi: %s", async link => {
    const res = await post({ link })
    expect(res.status).toBe(400)
    expect(await StudentLife.countDocuments()).toBe(0)
  })

  test("begona rasm URL'i (`existingImage`) rad etiladi (1.1)", async () => {
    const res = await post({ existingImage: 'https://evil.example/pixel.png' })
    expect(res.status).toBe(400)
    expect(await StudentLife.countDocuments()).toBe(0)
  })
})

describe('PUT /api/student-life/:id', () => {
  test("faqat yuborilgan maydonlar o'zgaradi, qolganlari saqlanadi", async () => {
    const item = await StudentLife.create({ section: 'club', title: 'Eski', desc: 'Tavsif', link: 'https://t.me/x', order: 3 })
    const res = await put(item._id, { title: 'Yangi' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ title: 'Yangi', desc: 'Tavsif', link: 'https://t.me/x', order: 3, section: 'club' })
  })

  test("bo'limni ko'chirish mumkin; noto'g'ri bo'lim 400 va hujjat o'zgarmaydi", async () => {
    const item = await StudentLife.create({ section: 'club', title: 'A' })
    expect((await put(item._id, { section: 'sport' })).body.section).toBe('sport')
    const bad = await put(item._id, { section: 'bayram', title: 'Buzildi' })
    expect(bad.status).toBe(400)
    const after = await StudentLife.findById(item._id)
    expect(after.section).toBe('sport')
    expect(after.title).toBe('A')
  })

  test("havolani tozalash ('' ) mumkin; xavfli havola 400", async () => {
    const item = await StudentLife.create({ section: 'club', title: 'A', link: 'https://t.me/x' })
    expect((await put(item._id, { link: '' })).body.link).toBe('')
    expect((await put(item._id, { link: 'javascript:alert(1)' })).status).toBe(400)
  })

  test("mavjud bo'lmagan id -> 404 (fayl yuklashdan oldin); noto'g'ri id -> 400", async () => {
    expect((await put(new mongoose.Types.ObjectId().toString(), { title: 'X' })).status).toBe(404)
    expect((await put('bu-id-emas', { title: 'X' })).status).toBe(400)
  })

  test("auth'siz 401", async () => {
    const item = await StudentLife.create({ section: 'club', title: 'A' })
    const res = await request(app).put(`/api/student-life/${item._id}`).set(pub()).send({ title: 'B' })
    expect(res.status).toBe(401)
    expect((await StudentLife.findById(item._id)).title).toBe('A')
  })
})

describe('DELETE /api/student-life/:id', () => {
  test("o'chiradi; boshqa yozuv qoladi; ikkinchi marta 404", async () => {
    const a = await StudentLife.create({ section: 'club', title: 'A' })
    const b = await StudentLife.create({ section: 'club', title: 'B' })
    const del = () => request(app).delete(`/api/student-life/${a._id}`).set(authed())
    expect((await del()).status).toBe(200)
    expect(await StudentLife.findById(a._id)).toBeNull()
    expect(await StudentLife.findById(b._id)).not.toBeNull()
    expect((await del()).status).toBe(404)
  })

  test("auth'siz 401; noto'g'ri id 400", async () => {
    const a = await StudentLife.create({ section: 'club', title: 'A' })
    expect((await request(app).delete(`/api/student-life/${a._id}`).set(pub())).status).toBe(401)
    expect((await request(app).delete('/api/student-life/bu-id-emas').set(authed())).status).toBe(400)
    expect(await StudentLife.findById(a._id)).not.toBeNull()
  })
})
