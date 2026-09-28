// Rasm yuklash bilan ishlaydigan endpointlar (News/Events/Teachers): multipart/form-data,
// multer limitlari, Supabase yuklash va MongoDB'ga yozish birga (integration).
// Supabase to'liq mock qilinadi — haqiqiy Storage'ga hech narsa yuklanmaydi.
//
// Diqqat: mutationLimiter 30 so'rov/15 daqiqa/IP (auth'dan o'tganlar uchun). Fayl ichida
// 30 tadan ko'p autentifikatsiyalangan so'rov yuborilmasin.
const mockUpload = jest.fn()
const mockGetPublicUrl = jest.fn()
const mockRemove = jest.fn()
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: { from: jest.fn(() => ({ upload: mockUpload, getPublicUrl: mockGetPublicUrl, remove: mockRemove })) },
  })),
}))

const request = require('supertest')
const app = require('../app')
const News = require('../models/News')
const Event = require('../models/Event')
const Teacher = require('../models/Teacher')
const { getAuthToken } = require('./helpers')

const MB = 1024 * 1024
const PNG = Buffer.from('89504e470d0a1a0a', 'hex') // PNG imzosi (mazmuni ahamiyatsiz — Supabase mock)
const cdn = path => `https://cdn.test/${path}`

let auth

beforeAll(() => {
  process.env.SUPABASE_URL = 'https://supabase.test'
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
  auth = { Authorization: `Bearer ${getAuthToken()}` }
})

beforeEach(() => {
  mockUpload.mockReset().mockResolvedValue({ error: null })
  mockGetPublicUrl.mockReset().mockImplementation(p => ({ data: { publicUrl: cdn(p) } }))
  mockRemove.mockReset().mockResolvedValue({ error: null })
})

// ───────────────────────── NEWS ─────────────────────────
describe('POST /api/news — rasm bilan', () => {
  test("bitta rasm: image maydoni oddiy URL satri, 'news/' papkasiga yuklanadi", async () => {
    const res = await request(app)
      .post('/api/news').set(auth)
      .field('title', 'Rasmli yangilik')
      .attach('imageFiles', PNG, { filename: 'a.png', contentType: 'image/png' })

    expect(res.status).toBe(200)
    expect(mockUpload).toHaveBeenCalledTimes(1)
    const path = mockUpload.mock.calls[0][0]
    expect(path).toMatch(/^news\/[0-9a-f-]{36}-a\.png$/)
    expect(res.body.image).toBe(cdn(path)) // bitta bo'lsa — JSON massiv emas

    const saved = await News.findById(res.body._id)
    expect(saved.image).toBe(cdn(path))
  })

  test("ikki rasm: image maydoni JSON-satr ko'rinishidagi massiv (frontend parseImages() formati)", async () => {
    const res = await request(app)
      .post('/api/news').set(auth)
      .field('title', "Ko'p rasmli")
      .attach('imageFiles', PNG, { filename: '1.png', contentType: 'image/png' })
      .attach('imageFiles', PNG, { filename: '2.png', contentType: 'image/png' })

    expect(res.status).toBe(200)
    expect(mockUpload).toHaveBeenCalledTimes(2)
    const urls = JSON.parse(res.body.image)
    expect(urls).toHaveLength(2)
    expect(urls[0]).toMatch(/-1\.png$/)
    expect(urls[1]).toMatch(/-2\.png$/)
  })

  test("existingImages + yangi fayl: mavjudlari oldinda, yangisi oxirida birlashtiriladi", async () => {
    const res = await request(app)
      .post('/api/news').set(auth)
      .field('title', 'Aralash')
      .field('existingImages', JSON.stringify(['https://old.test/1.png']))
      .attach('imageFiles', PNG, { filename: 'new.png', contentType: 'image/png' })

    expect(res.status).toBe(200)
    const urls = JSON.parse(res.body.image)
    expect(urls[0]).toBe('https://old.test/1.png')
    expect(urls[1]).toMatch(/-new\.png$/)
  })

  test("rasm fayli yo'q bo'lsa image bo'sh satr, Storage'ga murojaat qilinmaydi", async () => {
    const res = await request(app).post('/api/news').set(auth).field('title', 'Rasmsiz')
    expect(res.status).toBe(200)
    expect(res.body.image).toBe('')
    expect(mockUpload).not.toHaveBeenCalled()
  })

  test("auth'siz so'rov 401 oladi va fayl umuman yuklanmaydi (auth multer'dan oldin)", async () => {
    const res = await request(app)
      .post('/api/news')
      .field('title', 'Ruxsatsiz')
      .attach('imageFiles', PNG, { filename: 'a.png', contentType: 'image/png' })

    expect(res.status).toBe(401)
    expect(mockUpload).not.toHaveBeenCalled()
    expect(await News.countDocuments()).toBe(0)
  })

  test("ruxsat etilmagan fayl turi (text/plain) 400 bilan rad etiladi, yangilik yaratilmaydi", async () => {
    const res = await request(app)
      .post('/api/news').set(auth)
      .field('title', 'Noto\'g\'ri tur')
      .attach('imageFiles', Buffer.from('salom'), { filename: 'a.txt', contentType: 'text/plain' })

    expect(res.status).toBe(400)
    expect(mockUpload).not.toHaveBeenCalled()
    expect(await News.countDocuments()).toBe(0)
  })

  test("5 MB dan katta fayl multer tomonidan 400 (aniq xabar bilan) rad etiladi", async () => {
    const res = await request(app)
      .post('/api/news').set(auth)
      .field('title', 'Katta fayl')
      .attach('imageFiles', Buffer.alloc(5 * MB + 1), { filename: 'big.png', contentType: 'image/png' })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('5 MB')
    expect(mockUpload).not.toHaveBeenCalled()
  })

  test("noto'g'ri maydon nomi ('image', 'imageFiles' emas) 400 bilan rad etiladi", async () => {
    const res = await request(app)
      .post('/api/news').set(auth)
      .field('title', 'Noto\'g\'ri maydon')
      .attach('image', PNG, { filename: 'a.png', contentType: 'image/png' })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('imageFile')
    expect(mockUpload).not.toHaveBeenCalled()
  })

  test("10 tadan ko'p rasm (11 ta) rad etiladi", async () => {
    let req = request(app).post('/api/news').set(auth).field('title', "Juda ko'p rasm")
    for (let i = 0; i < 11; i++) req = req.attach('imageFiles', PNG, { filename: `${i}.png`, contentType: 'image/png' })
    const res = await req

    expect(res.status).toBe(400)
    expect(mockUpload).not.toHaveBeenCalled()
    expect(await News.countDocuments()).toBe(0)
  })

  test("Supabase xatosi 400 qaytaradi, yangilik yaratilmaydi va ichki xato matni mijozga sizib chiqmaydi", async () => {
    mockUpload.mockResolvedValue({ error: { message: 'SECRET-INTERNAL-DETAIL' } })
    const res = await request(app)
      .post('/api/news').set(auth)
      .field('title', 'Xato')
      .attach('imageFiles', PNG, { filename: 'a.png', contentType: 'image/png' })

    expect(res.status).toBe(400)
    expect(JSON.stringify(res.body)).not.toContain('SECRET-INTERNAL-DETAIL')
    expect(await News.countDocuments()).toBe(0)
  })

  test("title bo'lmasa (model validatsiyasi) 400 — muvaffaqiyatli yuklangan fayl Storage'dan tozalanadi", async () => {
    const res = await request(app)
      .post('/api/news').set(auth)
      .attach('imageFiles', PNG, { filename: 'a.png', contentType: 'image/png' })
    expect(res.status).toBe(400)
    // Fayl Supabase'ga muvaffaqiyatli yuklangan edi (mockUpload xato qaytarmadi),
    // lekin News.create() validatsiyada yiqilgani uchun endi orqaga qaytarilib
    // (rollback) Storage'dan o'chiriladi — "yetim" qolmaydi.
    expect(mockRemove).toHaveBeenCalledTimes(1)
    expect(mockRemove.mock.calls[0][0][0]).toMatch(/^news\/[0-9a-f-]{36}-a\.png$/)
  })

  // Avval "BILINGAN XAVF" deb qayd etilgan edi: 2 ta fayldan birinchisi yuklangach,
  // ikkinchisi xato bersa, birinchi fayl Storage'da yetim qolardi. Endi
  // `uploadImagesToSupabase` buni avtomatik tozalaydi.
  test("qisman xatoda muvaffaqiyatli yuklangan birinchi fayl endi Storage'dan tozalanadi", async () => {
    mockUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'boom' } })

    const res = await request(app)
      .post('/api/news').set(auth)
      .field('title', 'Qisman xato')
      .attach('imageFiles', PNG, { filename: '1.png', contentType: 'image/png' })
      .attach('imageFiles', PNG, { filename: '2.png', contentType: 'image/png' })

    expect(res.status).toBe(400)
    expect(await News.countDocuments()).toBe(0)
    expect(mockUpload).toHaveBeenCalledTimes(2) // ikkalasi ham urinildi
    expect(mockRemove).toHaveBeenCalledTimes(1) // faqat muvaffaqiyatli bo'lgan (birinchi) tozalandi
    expect(mockRemove.mock.calls[0][0]).toEqual([expect.stringMatching(/^news\/[0-9a-f-]{36}-1\.png$/)])
  })
})

describe('PUT /api/news/:id — rasm bilan', () => {
  test("yangi fayl yuklanadi va yangilikdagi image almashadi", async () => {
    const news = await News.create({ title: 'Eski', image: 'https://old.test/x.png' })
    const res = await request(app)
      .put(`/api/news/${news._id}`).set(auth)
      .field('title', 'Yangi sarlavha')
      .attach('imageFiles', PNG, { filename: 'new.png', contentType: 'image/png' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Yangi sarlavha')
    expect(res.body.image).toMatch(/^https:\/\/cdn\.test\/news\/.*-new\.png$/)
  })

  test("existingImages yuborilmasa va fayl bo'lmasa, image bo'shatiladi (hozirgi xatti-harakat)", async () => {
    const news = await News.create({ title: 'Eski', image: 'https://old.test/x.png' })
    const res = await request(app).put(`/api/news/${news._id}`).set(auth).field('title', 'Eski')
    expect(res.status).toBe(200)
    expect(res.body.image).toBe('')
  })
})

// ───────────────────────── EVENTS ─────────────────────────
describe('Events — rasm bilan', () => {
  const fields = { title: 'Tadbir', eventDate: '2026-10-15' }

  test("POST: fayl 'events/' papkasiga yuklanadi va URL saqlanadi", async () => {
    const res = await request(app)
      .post('/api/events').set(auth)
      .field(fields)
      .attach('imageFile', PNG, { filename: 'e.png', contentType: 'image/png' })

    expect(res.status).toBe(200)
    expect(res.body.image).toMatch(/^https:\/\/cdn\.test\/events\/[0-9a-f-]{36}-e\.png$/)
  })

  test("PUT: fayl yuborilmasa existingImage saqlanib qoladi", async () => {
    const event = await Event.create({ ...fields, image: 'https://old.test/e.png' })
    const res = await request(app)
      .put(`/api/events/${event._id}`).set(auth)
      .field({ ...fields, title: 'Yangilandi', existingImage: 'https://old.test/e.png' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Yangilandi')
    expect(res.body.image).toBe('https://old.test/e.png')
    expect(mockUpload).not.toHaveBeenCalled()
  })

  test("POST: bir nechta fayl yuborilsa (faqat 'imageFile' bitta) 400", async () => {
    const res = await request(app)
      .post('/api/events').set(auth)
      .field(fields)
      .attach('imageFile', PNG, { filename: '1.png', contentType: 'image/png' })
      .attach('imageFile', PNG, { filename: '2.png', contentType: 'image/png' })

    expect(res.status).toBe(400)
    expect(await Event.countDocuments()).toBe(0)
  })
})

// ───────────────────────── TEACHERS ─────────────────────────
describe('Teachers — rasm bilan', () => {
  const fields = { name: 'Dilshod Karimov', role: 'Professor', dept: 'Informatika' }

  test("POST: fayl 'teachers/' papkasiga yuklanadi va URL saqlanadi", async () => {
    const res = await request(app)
      .post('/api/teachers').set(auth)
      .field(fields)
      .attach('imageFile', PNG, { filename: 't.png', contentType: 'image/png' })

    expect(res.status).toBe(200)
    expect(res.body.image).toMatch(/^https:\/\/cdn\.test\/teachers\/[0-9a-f-]{36}-t\.png$/)
    expect(await Teacher.countDocuments()).toBe(1)
  })

  test("PUT: yangi fayl bilan image almashadi", async () => {
    const teacher = await Teacher.create({ ...fields, image: 'https://old.test/t.png' })
    const res = await request(app)
      .put(`/api/teachers/${teacher._id}`).set(auth)
      .field(fields)
      .attach('imageFile', PNG, { filename: 'new.png', contentType: 'image/png' })

    expect(res.status).toBe(200)
    expect(res.body.image).toMatch(/-new\.png$/)
  })
})