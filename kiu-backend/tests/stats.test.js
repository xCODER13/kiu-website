// GET /api/stats — admin panel bosh sahifasi uchun sanoqlar. Faqat auth bilan.
// Asosiy xavf: noto'g'ri filtr (masalan appsCount vakansiyalarni ham sanab yuborishi) admin
// panelda noto'g'ri raqam ko'rsatadi.
const request = require('supertest')
const app = require('../app')
const News = require('../models/News')
const Event = require('../models/Event')
const Teacher = require('../models/Teacher')
const Application = require('../models/Application')
const { getAuthToken } = require('./helpers')

const PHONE = '+998901234567'
const getStats = () => request(app).get('/api/stats').set('Authorization', `Bearer ${getAuthToken()}`)
const application = (overrides = {}) => Application.create({ name: 'Ali', phone: PHONE, ...overrides })

describe('GET /api/stats', () => {
  test("auth'siz 401", async () => {
    expect((await request(app).get('/api/stats')).status).toBe(401)
  })

  test("bo'sh bazada barcha sanoqlar 0, javob aynan 6 ta raqamli maydondan iborat", async () => {
    const res = await getStats()
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ newsCount: 0, eventsCount: 0, teachersCount: 0, appsCount: 0, newApps: 0, vacancyApps: 0 })
  })

  test("news, events va teachers sanoqlari to'g'ri", async () => {
    await News.create([{ title: 'a' }, { title: 'b' }])
    await Event.create([
      { title: 'e1', date: '1', month: 'Yan' },
      { title: 'e2', date: '2', month: 'Fev' },
      { title: 'e3', date: '3', month: 'Mar' },
    ])
    await Teacher.create({ name: 'T', role: 'R', dept: 'D' })

    const { body } = await getStats()
    expect(body.newsCount).toBe(2)
    expect(body.eventsCount).toBe(3)
    expect(body.teachersCount).toBe(1)
  })

  test("appsCount faqat qabul (admission) arizalarini sanaydi; vakansiyalar alohida", async () => {
    await application({ type: 'admission' })
    await application({ type: 'admission', status: 'accepted' })
    await application({ type: 'vacancy' })
    await application({ type: 'vacancy', status: 'reviewed' })
    await application({ type: 'vacancy', status: 'rejected' })

    const { body } = await getStats()
    expect(body.appsCount).toBe(2)
    expect(body.vacancyApps).toBe(3) // holatidan qat'i nazar barcha vakansiyalar
  })

  test("newApps: holati 'new' bo'lgan arizalar — ikkala turdan ham (admission + vacancy)", async () => {
    await application({ type: 'admission' })                        // new
    await application({ type: 'vacancy' })                          // new
    await application({ type: 'admission', status: 'reviewed' })    // sanalmaydi
    await application({ type: 'vacancy', status: 'accepted' })      // sanalmaydi

    expect((await getStats()).body.newApps).toBe(2)
  })

  test("holat o'zgarsa sanoq ham o'zgaradi (yangi → ko'rib chiqilgan)", async () => {
    const a = await application()
    expect((await getStats()).body.newApps).toBe(1)

    await Application.findByIdAndUpdate(a._id, { status: 'reviewed' })
    expect((await getStats()).body.newApps).toBe(0)
  })

  test("HOZIRGI XATTI-HARAKAT: 'type' maydoni yo'q eski (legacy) ariza appsCount'ga kirmaydi, newApps'ga kiradi", async () => {
    // scripts/backfill-application-type.js migratsiyasi bajarilmagan bazada admin panel
    // qabul arizalari sonini kam ko'rsatadi. Migratsiya bajarilsa, appsCount 1 bo'ladi va
    // bu test yiqiladi — shunda kutilgan qiymatni 1 ga o'zgartiring.
    await Application.collection.insertOne({
      name: 'Eski ariza', phone: PHONE, status: 'new', createdAt: new Date(), updatedAt: new Date(),
    })

    const { body } = await getStats()
    expect(body.appsCount).toBe(0)
    expect(body.newApps).toBe(1)
  })
})
