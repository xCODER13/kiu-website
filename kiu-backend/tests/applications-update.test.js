// PUT /api/applications/:id — admin ariza holatini o'zgartiradi. Ariza shaxsiy ma'lumot
// (telefon, email) saqlaydi, shuning uchun auth, validatsiya va boshqa arizalarga
// ta'sir qilmasligi tekshiriladi.
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const Application = require('../models/Application')
const { getAuthToken } = require('./helpers')

const VALID_PHONE = '+998901234567'
let auth

beforeAll(() => {
  auth = { Authorization: `Bearer ${getAuthToken()}` }
})

function createApplication(overrides = {}) {
  return Application.create({ name: 'Ali Valiyev', phone: VALID_PHONE, faculty: 'Informatika', ...overrides })
}

describe('PUT /api/applications/:id — kirish nazorati', () => {
  test("auth'siz 401 qaytaradi va ariza o'zgarmaydi", async () => {
    const app1 = await createApplication()
    const res = await request(app).put(`/api/applications/${app1._id}`).send({ status: 'accepted' })
    expect(res.status).toBe(401)
    expect((await Application.findById(app1._id)).status).toBe('new')
  })

  test("noto'g'ri token bilan 401", async () => {
    const app1 = await createApplication()
    const res = await request(app)
      .put(`/api/applications/${app1._id}`)
      .set('Authorization', 'Bearer yaroqsiz.token.qiymati')
      .send({ status: 'accepted' })
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/applications/:id — yangilash', () => {
  test("auth bilan status o'zgaradi va yangilangan hujjat qaytadi", async () => {
    const app1 = await createApplication()
    const res = await request(app).put(`/api/applications/${app1._id}`).set(auth).send({ status: 'reviewed' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('reviewed')
    expect(res.body._id).toBe(app1._id.toString())
    expect((await Application.findById(app1._id)).status).toBe('reviewed')
  })

  test("faqat yuborilgan maydon o'zgaradi, qolganlari saqlanadi", async () => {
    const app1 = await createApplication({ message: 'Salom', email: 'ali@example.com' })
    await request(app).put(`/api/applications/${app1._id}`).set(auth).send({ status: 'accepted' })

    const saved = await Application.findById(app1._id)
    expect(saved.status).toBe('accepted')
    expect(saved.name).toBe('Ali Valiyev')
    expect(saved.phone).toBe(VALID_PHONE)
    expect(saved.message).toBe('Salom')
    expect(saved.email).toBe('ali@example.com')
  })

  test("boshqa arizalarga ta'sir qilmaydi", async () => {
    const target = await createApplication({ name: 'Nishon' })
    const other = await createApplication({ name: 'Boshqa' })
    await request(app).put(`/api/applications/${target._id}`).set(auth).send({ status: 'rejected' })

    expect((await Application.findById(other._id)).status).toBe('new')
  })

  test("sxemada yo'q maydon saqlanmaydi (strict rejim)", async () => {
    const app1 = await createApplication()
    const res = await request(app)
      .put(`/api/applications/${app1._id}`).set(auth)
      .send({ status: 'reviewed', isAdmin: true, role: 'superuser' })

    expect(res.status).toBe(200)
    const raw = await Application.collection.findOne({ _id: app1._id })
    expect(raw.status).toBe('reviewed')
    expect(raw).not.toHaveProperty('isAdmin')
    expect(raw).not.toHaveProperty('role')
  })
})

describe('PUT /api/applications/:id — validatsiya (runValidators)', () => {
  test("noto'g'ri status qiymati 400 bilan rad etiladi, ariza o'zgarmaydi", async () => {
    const app1 = await createApplication()
    const res = await request(app).put(`/api/applications/${app1._id}`).set(auth).send({ status: 'hacked' })

    expect(res.status).toBe(400)
    expect((await Application.findById(app1._id)).status).toBe('new')
  })

  test("noto'g'ri type qiymati 400", async () => {
    const app1 = await createApplication()
    const res = await request(app).put(`/api/applications/${app1._id}`).set(auth).send({ type: 'other' })
    expect(res.status).toBe(400)
  })

  test("noto'g'ri telefon formati 400 — POST'dagi validator PUT'da ham ishlaydi", async () => {
    const app1 = await createApplication()
    const res = await request(app).put(`/api/applications/${app1._id}`).set(auth).send({ phone: '123' })

    expect(res.status).toBe(400)
    expect((await Application.findById(app1._id)).phone).toBe(VALID_PHONE)
  })

  test("noto'g'ri email 400", async () => {
    const app1 = await createApplication()
    const res = await request(app).put(`/api/applications/${app1._id}`).set(auth).send({ email: 'email-emas' })
    expect(res.status).toBe(400)
  })

  test("maxlength'dan uzun matn (message > 3000) 400", async () => {
    const app1 = await createApplication()
    const res = await request(app)
      .put(`/api/applications/${app1._id}`).set(auth)
      .send({ message: 'x'.repeat(3001) })
    expect(res.status).toBe(400)
  })

  test("xato javobida ichki (Mongoose) tafsilotlari mijozga sizib chiqmaydi", async () => {
    const app1 = await createApplication()
    const res = await request(app).put(`/api/applications/${app1._id}`).set(auth).send({ status: 'hacked' })

    expect(res.status).toBe(400)
    const body = JSON.stringify(res.body)
    expect(body).not.toMatch(/ValidationError|enum|Path `|stack/i)
  })
})

describe("PUT /api/applications/:id — noto'g'ri id", () => {
  test("ObjectId formatida bo'lmagan id 400 qaytaradi (500 emas)", async () => {
    const res = await request(app).put('/api/applications/bu-id-emas').set(auth).send({ status: 'reviewed' })
    expect(res.status).toBe(400)
  })

  // BILINGAN KAMCHILIK: mavjud bo'lmagan (lekin to'g'ri formatdagi) id uchun controller
  // 200 va `null` qaytaradi — 404 bo'lishi kerak. `test` shu xatti-harakat tuzatilgach
  // ("... expected to fail but passed" deb) o'zi xabar beradi: shunda `.failing` ni olib tashlang.
  test("mavjud bo'lmagan id uchun 404 qaytaradi", async () => {
    const res = await request(app)
      .put(`/api/applications/${new mongoose.Types.ObjectId()}`).set(auth)
      .send({ status: 'reviewed' })
    expect(res.status).toBe(404)
  })
})

// Rate limit testi ENG OXIRDA turishi kerak: u mutationLimiter byudjetini (30/15 daqiqa)
// to'liq sarflaydi, undan keyingi auth'li so'rovlar 429 olardi.
describe('PUT /api/applications/:id — mutationLimiter', () => {
  test("cheksiz so'rovlar 429 bilan to'xtatiladi (o'g'irlangan token himoyasi)", async () => {
    const app1 = await createApplication()
    let blockedAt = null
    for (let i = 1; i <= 40; i++) {
      const res = await request(app).put(`/api/applications/${app1._id}`).set(auth).send({ status: 'reviewed' })
      if (res.status === 429) { blockedAt = i; break }
    }
    expect(blockedAt).not.toBeNull()
    // Bu faylda avval yuborilgan auth'li so'rovlar ham hisobga kiradi, shuning uchun 30 dan oshmasligi kerak
    expect(blockedAt).toBeLessThanOrEqual(31)
  })
})
