// 2.1: o'chirish/tahrirlashda eski rasmlar Storage'dan o'chadi. Tartib: avval DB, keyin Storage; Storage xatosi
// javobni buzmaydi; DB xatosida hech narsa o'chmaydi; boshqa hujjat havola qilgan rasm saqlanadi.
// Har so'rov o'z IP'sidan (X-Forwarded-For) — mutationLimiter byudjeti fayllar orasida to'qnashmasin.
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
const { getAuthToken } = require('./helpers')

const PNG = Buffer.from('89504e470d0a1a0a', 'hex')
const cdn = path => `https://cdn.test/${path}`
const N1 = cdn('news/1111-a.png')
const N2 = cdn('news/2222-b.png')
const E1 = cdn('events/3333-e.png')
const T1 = cdn('teachers/4444-t.png')
const G1 = cdn('gallery/5555-g1.png')
const G2 = cdn('gallery/6666-g2.png')
const LEGACY = 'https://old-host.example/eski.png'

let auth
let n = 0
const ip = () => `10.72.${Math.floor(++n / 250)}.${n % 250}`
const call = (method, url) => request(app)[method](url).set(auth).set('X-Forwarded-For', ip())

beforeAll(() => {
  process.env.SUPABASE_URL = 'https://supabase.test'
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
  auth = { Authorization: `Bearer ${getAuthToken()}` }
})
beforeEach(() => {
  mockUpload.mockReset().mockResolvedValue({ error: null })
  mockRemove.mockReset().mockResolvedValue({ error: null })
})

// Har original bilan thumbnail'i ham o'chiriladi (2.2) — bu yerda faqat originallar solishtiriladi, thumbnail alohida testda
const allRemoved = () => mockRemove.mock.calls.flatMap(c => c[0]).sort()
const removedPaths = () => allRemoved().filter(p => !p.endsWith('.thumb.webp'))

describe('DELETE: rasmlar DB yozuvidan KEYIN Storage\'dan o\'chadi', () => {
  test('news: bir nechta rasm (JSON satr) bitta chaqiruvda; tartib — avval DB', async () => {
    const news = await News.create({ title: 'N', image: JSON.stringify([N1, N2]) })
    let docExistedWhenRemoving = null
    mockRemove.mockImplementation(async () => {
      docExistedWhenRemoving = await News.exists({ _id: news._id })
      return { error: null }
    })
    const res = await call('delete', `/api/news/${news._id}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })
    expect(mockRemove).toHaveBeenCalledTimes(1)
    expect(removedPaths()).toEqual(['news/1111-a.png', 'news/2222-b.png'])
    expect(allRemoved()).toEqual(['news/1111-a.png', 'news/1111-a.png.thumb.webp', 'news/2222-b.png', 'news/2222-b.png.thumb.webp'])
    expect(docExistedWhenRemoving).toBeNull() // Storage chaqirilganda hujjat allaqachon yo'q edi
    expect(await News.countDocuments()).toBe(0)
  })

  test("news: bitta rasm (oddiy satr)", async () => {
    const news = await News.create({ title: 'N', image: N1 })
    expect((await call('delete', `/api/news/${news._id}`)).status).toBe(200)
    expect(removedPaths()).toEqual(['news/1111-a.png'])
  })

  test("events, teachers, gallery", async () => {
    const ev = await Event.create({ title: 'E', eventDate: '2026-10-15', image: E1 })
    const te = await Teacher.create({ name: 'Ali', role: 'Dotsent', dept: 'Aniq fanlar kafedrasi', avatar: 'A', image: T1 })
    const ga = await Gallery.create({ title: 'G', images: [G1, G2] })
    expect((await call('delete', `/api/events/${ev._id}`)).status).toBe(200)
    expect((await call('delete', `/api/teachers/${te._id}`)).status).toBe(200)
    expect((await call('delete', `/api/gallery/${ga._id}`)).status).toBe(200)
    expect(removedPaths()).toEqual(['events/3333-e.png', 'gallery/5555-g1.png', 'gallery/6666-g2.png', 'teachers/4444-t.png'])
  })

  test("rasmsiz hujjat va begona (eski) URL — Storage'ga tegilmaydi", async () => {
    const a = await News.create({ title: 'Rasmsiz' })
    const b = await News.create({ title: 'Eski', image: LEGACY })
    expect((await call('delete', `/api/news/${a._id}`)).status).toBe(200)
    expect((await call('delete', `/api/news/${b._id}`)).status).toBe(200)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  test("mavjud bo'lmagan id — 404, Storage'ga tegilmaydi", async () => {
    const res = await call('delete', '/api/news/507f1f77bcf86cd799439011')
    expect(res.status).toBe(404)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  test("Storage xatosi javobni buzmaydi: 200, hujjat o'chgan (xato faqat logda)", async () => {
    mockRemove.mockResolvedValue({ error: { message: 'storage down' } })
    const news = await News.create({ title: 'N', image: N1 })
    const res = await call('delete', `/api/news/${news._id}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })
    expect(await News.countDocuments()).toBe(0)
  })

  test("boshqa hujjat hamon shu rasmga havola qilsa — fayl o'chmaydi, faqat yolg'iz rasm o'chadi", async () => {
    const a = await News.create({ title: 'A', image: JSON.stringify([N1, N2]) })
    await Event.create({ title: 'E', eventDate: '2026-10-15', image: N1 }) // N1 ni tadbir ham ishlatadi
    expect((await call('delete', `/api/news/${a._id}`)).status).toBe(200)
    expect(removedPaths()).toEqual(['news/2222-b.png'])
  })
})

describe('PUT: tahrirlashda olib tashlangan rasmlar o\'chadi', () => {
  test("news: ikki rasmdan biri olib tashlandi — faqat u o'chadi, hujjat yangilanadi", async () => {
    const news = await News.create({ title: 'N', image: JSON.stringify([N1, N2]) })
    const res = await call('put', `/api/news/${news._id}`).field('title', 'N').field('existingImages', JSON.stringify([N1]))
    expect(res.status).toBe(200)
    expect(res.body.image).toBe(N1)
    expect(removedPaths()).toEqual(['news/2222-b.png'])
  })

  test("news: o'zgarishsiz saqlansa — hech narsa o'chmaydi", async () => {
    const news = await News.create({ title: 'N', image: JSON.stringify([N1, N2]) })
    const res = await call('put', `/api/news/${news._id}`).field('title', 'Yangi sarlavha').field('existingImages', JSON.stringify([N1, N2]))
    expect(res.status).toBe(200)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  test("news: hamma rasm olib tashlandi — barchasi o'chadi", async () => {
    const news = await News.create({ title: 'N', image: JSON.stringify([N1, N2]) })
    const res = await call('put', `/api/news/${news._id}`).field('title', 'N').field('existingImages', '[]')
    expect(res.status).toBe(200)
    expect(res.body.image).toBe('')
    expect(removedPaths()).toEqual(['news/1111-a.png', 'news/2222-b.png'])
  })

  test("events: yangi fayl eskisini almashtiradi — eskisi o'chadi, yangisi emas", async () => {
    const ev = await Event.create({ title: 'E', eventDate: '2026-10-15', image: E1 })
    const res = await call('put', `/api/events/${ev._id}`)
      .field({ title: 'E', eventDate: '2026-10-15', existingImage: E1 })
      .attach('imageFile', PNG, { filename: 'new.png', contentType: 'image/png' })
    expect(res.status).toBe(200)
    expect(res.body.image).toMatch(/^https:\/\/cdn\.test\/events\//)
    expect(res.body.image).not.toBe(E1)
    expect(removedPaths()).toEqual(['events/3333-e.png'])
  })

  test("events: rasm olib tashlandi (existingImage bo'sh) — eskisi o'chadi", async () => {
    const ev = await Event.create({ title: 'E', eventDate: '2026-10-15', image: E1 })
    const res = await call('put', `/api/events/${ev._id}`).field({ title: 'E', eventDate: '2026-10-15', existingImage: '' })
    expect(res.status).toBe(200)
    expect(removedPaths()).toEqual(['events/3333-e.png'])
  })

  test("events: rasm o'zgarmadi — o'chirish yo'q", async () => {
    const ev = await Event.create({ title: 'E', eventDate: '2026-10-15', image: E1 })
    const res = await call('put', `/api/events/${ev._id}`).field({ title: 'Yangi', eventDate: '2026-10-15', existingImage: E1 })
    expect(res.status).toBe(200)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  test("teachers: rasm almashtirildi — eskisi o'chadi", async () => {
    const te = await Teacher.create({ name: 'Ali', role: 'Dotsent', dept: 'Aniq fanlar kafedrasi', avatar: 'A', image: T1 })
    const res = await call('put', `/api/teachers/${te._id}`)
      .field({ name: 'Ali', role: 'Dotsent', dept: 'Aniq fanlar kafedrasi', avatar: 'A', existingImage: T1 })
      .attach('imageFile', PNG, { filename: 'new.png', contentType: 'image/png' })
    expect(res.status).toBe(200)
    expect(removedPaths()).toEqual(['teachers/4444-t.png'])
  })

  test("gallery: albomdan bitta rasm olib tashlandi — faqat u o'chadi", async () => {
    const ga = await Gallery.create({ title: 'G', images: [G1, G2] })
    const res = await call('put', `/api/gallery/${ga._id}`).field('title', 'G').field('existingImages', JSON.stringify([G2]))
    expect(res.status).toBe(200)
    expect(res.body.images).toEqual([G2])
    expect(removedPaths()).toEqual(['gallery/5555-g1.png'])
  })

  test("gallery: yangi fayl qo'shildi, eskilari qoldi — hech narsa o'chmaydi", async () => {
    const ga = await Gallery.create({ title: 'G', images: [G1] })
    const res = await call('put', `/api/gallery/${ga._id}`)
      .field('title', 'G').field('existingImages', JSON.stringify([G1]))
      .attach('imageFiles', PNG, { filename: 'x.png', contentType: 'image/png' })
    expect(res.status).toBe(200)
    expect(res.body.images).toHaveLength(2)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  test("Storage xatosi tahrirlash javobini buzmaydi: 200, hujjat yangilangan", async () => {
    mockRemove.mockResolvedValue({ error: { message: 'storage down' } })
    const ga = await Gallery.create({ title: 'G', images: [G1, G2] })
    const res = await call('put', `/api/gallery/${ga._id}`).field('title', 'G').field('existingImages', JSON.stringify([G2]))
    expect(res.status).toBe(200)
    expect((await Gallery.findById(ga._id)).images).toEqual([G2])
  })
})

describe('DB yozuvi muvaffaqiyatsiz bo\'lsa — eski rasm O\'CHMAYDI', () => {
  test("news: tekshiruvdan o'tmagan yangilash (title > 300) -> 400, hech narsa o'chmaydi, hujjat o'zgarmagan", async () => {
    const news = await News.create({ title: 'N', image: JSON.stringify([N1, N2]) })
    const res = await call('put', `/api/news/${news._id}`).field('title', 'x'.repeat(301)).field('existingImages', JSON.stringify([N1]))
    expect(res.status).toBe(400)
    expect(mockRemove).not.toHaveBeenCalled()
    expect((await News.findById(news._id)).image).toBe(JSON.stringify([N1, N2]))
  })

  test("mavjud bo'lmagan id -> 404, hech narsa o'chmaydi", async () => {
    const res = await call('put', '/api/news/507f1f77bcf86cd799439011').field('title', 'X').field('existingImages', '[]')
    expect(res.status).toBe(404)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  test("gallery: rasmsiz albomga urinish -> 400, hech narsa o'chmaydi", async () => {
    const ga = await Gallery.create({ title: 'G', images: [G1] })
    const res = await call('put', `/api/gallery/${ga._id}`).field('title', 'G').field('existingImages', '[]')
    expect(res.status).toBe(400)
    expect(mockRemove).not.toHaveBeenCalled()
    expect((await Gallery.findById(ga._id)).images).toEqual([G1])
  })

  test("begona URL kiritilsa (1.1) -> 400, hech narsa o'chmaydi", async () => {
    const news = await News.create({ title: 'N', image: JSON.stringify([N1, N2]) })
    const res = await call('put', `/api/news/${news._id}`).field('title', 'N').field('existingImages', JSON.stringify([N1, 'https://evil.example/p.gif']))
    expect(res.status).toBe(400)
    expect(mockRemove).not.toHaveBeenCalled()
  })
})
