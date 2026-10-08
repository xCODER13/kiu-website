// 1.7 (DESIGN.md 10.4): email, position, education, experience — faqat vakansiya arizasida saqlanadi.
// Qabul arizasi formasi ularni yubormaydi; kelsa e'tiborsiz qoldiriladi va saqlanmaydi (keraksiz shaxsiy ma'lumot yig'ilmaydi).
// Diqqat: formLimiter 10 so'rov/15 daqiqa/IP — bu faylda 9 tadan ko'p POST yo'q.
const request = require('supertest')
const app = require('../app')
const Application = require('../models/Application')

const URL = '/api/applications'
const BASE = { name: 'Ali Valiyev', phone: '+998901234567' }
const VACANCY_ONLY = { email: 'ali@example.com', position: 'Dasturchi', education: 'Oliy', experience: '3 yil' }

async function saved(res) {
  return Application.collection.findOne({ _id: new (require('mongoose').Types.ObjectId)(res.body._id) })
}

describe('POST /api/applications — vakansiyaga xos maydonlar', () => {
  test("qabul arizasi: email/lavozim/ta'lim/tajriba yuborilsa ham javobda va bazada bo'sh", async () => {
    const res = await request(app).post(URL).send({ ...BASE, type: 'admission', faculty: 'Informatika', ...VACANCY_ONLY })
    expect(res.status).toBe(200)
    for (const f of Object.keys(VACANCY_ONLY)) expect(res.body[f]).toBe('')
    const doc = await saved(res)
    for (const f of Object.keys(VACANCY_ONLY)) expect(doc[f]).toBe('')
    expect(doc.faculty).toBe('Informatika')
    expect(doc.type).toBe('admission')
  })

  test("`type` yuborilmasa yoki noto'g'ri bo'lsa (admission'ga tushadi) ham email saqlanmaydi", async () => {
    const noType = await request(app).post(URL).send({ ...BASE, email: 'ali@example.com' })
    expect(noType.status).toBe(200)
    expect((await saved(noType)).email).toBe('')
    const badType = await request(app).post(URL).send({ ...BASE, type: 'notogri', email: 'ali@example.com' })
    expect(badType.status).toBe(200)
    expect(badType.body.type).toBe('admission')
    expect((await saved(badType)).email).toBe('')
  })

  test("qabul arizasida noto'g'ri formatdagi email ham rad etilmaydi — shunchaki saqlanmaydi", async () => {
    const res = await request(app).post(URL).send({ ...BASE, type: 'admission', email: 'bu-email-emas' })
    expect(res.status).toBe(200)
    expect((await saved(res)).email).toBe('')
  })

  test("vakansiya arizasi: to'rtala maydon saqlanadi", async () => {
    const res = await request(app).post(URL).send({ ...BASE, type: 'vacancy', ...VACANCY_ONLY })
    expect(res.status).toBe(200)
    const doc = await saved(res)
    for (const [f, v] of Object.entries(VACANCY_ONLY)) expect(doc[f]).toBe(v)
    expect(doc.type).toBe('vacancy')
  })

  test("vakansiya arizasida noto'g'ri email hamon 400 (format tekshiruvi saqlangan)", async () => {
    const res = await request(app).post(URL).send({ ...BASE, type: 'vacancy', email: 'bu-email-emas' })
    expect(res.status).toBe(400)
    expect(await Application.countDocuments()).toBe(0)
  })
})
