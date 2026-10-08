// 1.1 (DESIGN.md 10.4): mijozdan kelgan rasm URL'lari (`existingImage(s)`) faqat bizning Storage
// prefiksi bilan boshlansa qabul qilinadi. Eski (hujjatda allaqachon saqlangan) URL'lar esa
// tahrirlashda o'zgarishsiz qolishi mumkin — tekshiruv faqat YANGI kiritilayotganlarga qattiq.
//
// Diqqat: mutationLimiter 30 so'rov/15 daqiqa/IP — fayl ichida 30 tadan kam autentifikatsiyalangan so'rov.
const mockUpload = jest.fn()
const mockRemove = jest.fn()
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: p => ({ data: { publicUrl: `https://cdn.test/${p}` } }),
      })),
    },
  })),
}))

const request = require('supertest')
const app = require('../app')
const News = require('../models/News')
const Event = require('../models/Event')
const Teacher = require('../models/Teacher')
const Gallery = require('../models/Gallery')
const { isOwnStorageUrl, findForeignImageUrl } = require('../utils/imageUrls')
const { getAuthToken } = require('./helpers')

const PNG = Buffer.from('89504e470d0a1a0a', 'hex')
const cdn = path => `https://cdn.test/${path}`
const OWN = cdn('news/0b8e8e9c-1111-4222-8333-444455556666-a.png')
const EVIL = 'https://evil.example/pixel.gif'
const ERR = { error: "Rasm manzili noto'g'ri" }
let auth

beforeAll(() => {
  process.env.SUPABASE_URL = 'https://supabase.test'
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
  auth = { Authorization: `Bearer ${getAuthToken()}` }
})

beforeEach(() => {
  mockUpload.mockReset().mockResolvedValue({ error: null })
  mockRemove.mockReset().mockResolvedValue({ error: null })
})

describe('isOwnStorageUrl', () => {
  const prefix = 'https://cdn.test/'

  test('bizning prefiks + papka/fayl — qabul qilinadi (kodlangan bo\'shliq ham, eski yuklashlar uchun)', () => {
    expect(isOwnStorageUrl(OWN, prefix)).toBe(true)
    expect(isOwnStorageUrl(cdn('events/eski%20rasm.jpg'), prefix)).toBe(true)
  })

  test.each([
    ['boshqa host', EVIL],
    ['host nomi prefiksga o\'xshash (subdomen hiylasi)', 'https://cdn.test.evil.example/news/a.png'],
    ['userinfo hiylasi', 'https://cdn.test@evil.example/news/a.png'],
    ['sxema boshqa', 'http://cdn.test/news/a.png'],
    ['javascript: sxemasi', 'javascript:alert(1)'],
    ['data: sxemasi', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='],
    ['yuqoriga chiqish (..)', cdn('news/../../x.png')],
    ['kodlangan nuqta (%2e)', cdn('news/%2e%2e/x.png')],
    ['kodlangan slash (%2F)', cdn('news%2Fa.png')],
    ['so\'rov qatori', cdn('news/a.png?track=1')],
    ['yorliq (#)', cdn('news/a.png#x')],
    ['CSS url() dan chiqish — qavs', cdn('news/a.png)')],
    ['qo\'shtirnoq', cdn('news/a".png')],
    ['bo\'shliq', cdn('news/a b.png')],
    ['teskari slash', cdn('news\\a.png')],
    ['prefiksning o\'zi (fayl yo\'q)', prefix],
    ['juda uzun', cdn('news/' + 'a'.repeat(600))],
    ['satr emas', 12345],
    ['massiv', [OWN]],
  ])('rad etiladi: %s', (_name, value) => {
    expect(isOwnStorageUrl(value, prefix)).toBe(false)
  })

  test("prefiks yo'q (Storage sozlanmagan) bo'lsa — hech narsa o'tmaydi", () => {
    expect(isOwnStorageUrl(OWN, null)).toBe(false)
    expect(isOwnStorageUrl(OWN, '')).toBe(false)
  })
})

describe('findForeignImageUrl', () => {
  test("bo'sh satr ('rasm yo'q') doim ruxsat; bizning URL ruxsat; begona topilsa qaytariladi", () => {
    expect(findForeignImageUrl([''])).toBeNull()
    expect(findForeignImageUrl([OWN, ''])).toBeNull()
    expect(findForeignImageUrl([OWN, EVIL])).toBe(EVIL)
  })

  test('hujjatda allaqachon saqlangan URL (eski, begona format) o\'tadi, yangi begona URL — yo\'q', () => {
    const legacy = 'https://old-host.example/eski.png'
    expect(findForeignImageUrl([legacy], [legacy])).toBeNull()
    expect(findForeignImageUrl([legacy, EVIL], [legacy])).toBe(EVIL)
  })

  test("Storage sozlanmagan bo'lsa (SUPABASE_URL/KEY yo'q) yangi URL'lar rad etiladi, saqlanganlari o'tadi", () => {
    const savedUrl = process.env.SUPABASE_URL
    const savedKey = process.env.SUPABASE_SERVICE_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_KEY
    try {
      jest.isolateModules(() => {
        const fresh = require('../utils/imageUrls')
        expect(fresh.findForeignImageUrl([OWN])).toBe(OWN)
        expect(fresh.findForeignImageUrl([OWN], [OWN])).toBeNull()
        expect(fresh.findForeignImageUrl([''])).toBeNull()
      })
    } finally {
      process.env.SUPABASE_URL = savedUrl
      process.env.SUPABASE_SERVICE_KEY = savedKey
    }
  })
})

describe('News — begona rasm URL', () => {
  test("POST: begona existingImages 400, Storage'ga yozilmaydi, yangilik yaratilmaydi", async () => {
    const res = await request(app)
      .post('/api/news').set(auth)
      .field('title', 'Piksel')
      .field('existingImages', JSON.stringify([OWN, EVIL]))
      .attach('imageFiles', PNG, { filename: 'a.png', contentType: 'image/png' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual(ERR)
    expect(mockUpload).not.toHaveBeenCalled()
    expect(await News.countDocuments()).toBe(0)
  })

  test("POST: bitta (JSON bo'lmagan) begona satr ham rad etiladi", async () => {
    const res = await request(app).post('/api/news').set(auth).field('title', 'X').field('existingImages', EVIL)
    expect(res.status).toBe(400)
    expect(await News.countDocuments()).toBe(0)
  })

  test("PUT: saqlangan eski URL o'zgarishsiz qoladi (200), lekin yangi begona URL qo'shish 400 va hujjat o'zgarmaydi", async () => {
    const legacy = 'https://old-host.example/eski.png'
    const news = await News.create({ title: 'Eski', image: legacy })

    const keep = await request(app)
      .put(`/api/news/${news._id}`).set(auth)
      .field('title', 'Eski').field('existingImages', JSON.stringify([legacy]))
    expect(keep.status).toBe(200)
    expect(keep.body.image).toBe(legacy)

    const bad = await request(app)
      .put(`/api/news/${news._id}`).set(auth)
      .field('title', 'Hujum').field('existingImages', JSON.stringify([legacy, EVIL]))
    expect(bad.status).toBe(400)
    expect(bad.body).toEqual(ERR)
    expect(mockUpload).not.toHaveBeenCalled()
    const after = await News.findById(news._id)
    expect(after.title).toBe('Eski')
    expect(after.image).toBe(legacy)
  })

  test("PUT: mavjud bo'lmagan ID bizning URL bilan avvalgidek 404 beradi", async () => {
    const res = await request(app)
      .put('/api/news/507f1f77bcf86cd799439011').set(auth)
      .field('title', 'X').field('existingImages', JSON.stringify([OWN]))
    expect(res.status).toBe(404)
  })
})

describe('Events — begona rasm URL', () => {
  const fields = { title: 'Tadbir', eventDate: '2026-10-15' }

  test("POST: fayl yo'q + begona existingImage — 400, hujjat yaratilmaydi", async () => {
    const res = await request(app).post('/api/events').set(auth).field({ ...fields, existingImage: EVIL })
    expect(res.status).toBe(400)
    expect(res.body).toEqual(ERR)
    expect(await Event.countDocuments()).toBe(0)
  })

  test("POST: fayl bor bo'lsa existingImage e'tiborsiz (hech qachon saqlanmaydi) — 200, rasm yuklangan fayldan", async () => {
    const res = await request(app)
      .post('/api/events').set(auth)
      .field({ ...fields, existingImage: EVIL })
      .attach('imageFile', PNG, { filename: 'e.png', contentType: 'image/png' })
    expect(res.status).toBe(200)
    expect(res.body.image).toMatch(/^https:\/\/cdn\.test\/events\//)
    expect(res.body.image).not.toContain('evil')
  })

  test("PUT: saqlangan URL qoladi (200); begonasiga almashtirish 400, hujjat o'zgarmaydi", async () => {
    const event = await Event.create({ ...fields, image: 'https://old-host.example/e.png' })
    const keep = await request(app)
      .put(`/api/events/${event._id}`).set(auth)
      .field({ ...fields, existingImage: 'https://old-host.example/e.png' })
    expect(keep.status).toBe(200)

    const bad = await request(app).put(`/api/events/${event._id}`).set(auth).field({ ...fields, existingImage: EVIL })
    expect(bad.status).toBe(400)
    expect((await Event.findById(event._id)).image).toBe('https://old-host.example/e.png')
  })

  test("existingImage bo'sh ('rasm olib tashlandi') bo'lsa ruxsat", async () => {
    const event = await Event.create({ ...fields, image: OWN })
    const res = await request(app).put(`/api/events/${event._id}`).set(auth).field({ ...fields, existingImage: '' })
    expect(res.status).toBe(200)
    expect(res.body.image).toBe('')
  })
})

describe('Teachers — begona rasm URL', () => {
  const fields = { name: 'Ali Valiyev', role: 'Dotsent', dept: 'Informatika', avatar: 'AV' }

  test("POST: fayl yo'q + begona existingImage — 400", async () => {
    const res = await request(app).post('/api/teachers').set(auth).field({ ...fields, existingImage: EVIL })
    expect(res.status).toBe(400)
    expect(res.body).toEqual(ERR)
    expect(await Teacher.countDocuments()).toBe(0)
  })

  test("PUT: bizning URL qabul qilinadi, begona — 400, hujjat o'zgarmaydi", async () => {
    const teacher = await Teacher.create({ ...fields, image: OWN })
    const ok = await request(app).put(`/api/teachers/${teacher._id}`).set(auth).field({ ...fields, existingImage: OWN })
    expect(ok.status).toBe(200)
    const bad = await request(app).put(`/api/teachers/${teacher._id}`).set(auth).field({ ...fields, existingImage: EVIL })
    expect(bad.status).toBe(400)
    expect((await Teacher.findById(teacher._id)).image).toBe(OWN)
  })
})

describe('Gallery — begona rasm URL', () => {
  test("POST: begona URL 400, albom yaratilmaydi", async () => {
    const res = await request(app)
      .post('/api/gallery').set(auth)
      .field('title', 'Albom').field('existingImages', JSON.stringify([OWN, EVIL]))
    expect(res.status).toBe(400)
    expect(res.body).toEqual(ERR)
    expect(await Gallery.countDocuments()).toBe(0)
  })

  test("PUT: saqlangan eski URL'lar o'tadi, yangi begonasi 400, albom o'zgarmaydi", async () => {
    const legacy = 'https://old-host.example/1.jpg'
    const album = await Gallery.create({ title: 'Albom', images: [legacy] })
    const ok = await request(app)
      .put(`/api/gallery/${album._id}`).set(auth)
      .field('title', 'Albom').field('existingImages', JSON.stringify([legacy, OWN]))
    expect(ok.status).toBe(200)
    expect(ok.body.images).toEqual([legacy, OWN])

    const bad = await request(app)
      .put(`/api/gallery/${album._id}`).set(auth)
      .field('title', 'Hujum').field('existingImages', JSON.stringify([legacy, OWN, EVIL]))
    expect(bad.status).toBe(400)
    expect((await Gallery.findById(album._id)).images).toEqual([legacy, OWN])
  })
})
