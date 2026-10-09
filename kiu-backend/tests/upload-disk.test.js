// 2.3: multipart yuklash endi diskka (middleware/upload.js). Tekshiriladi: fayl Storage'ga yetib boradi, thumbnail yaratiladi,
// vaqtincha fayllar HAR holatda (muvaffaqiyat, rad etish, limit xatosi) o'chadi. DB yozuvi `create` spy'i bilan
// almashtirilgan — bu fayl DB'siz ham ishlaydi.
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

const fs = require('fs')
const request = require('supertest')
const sharp = require('sharp')
const app = require('../app')
const Gallery = require('../models/Gallery')
const Event = require('../models/Event')
const { UPLOAD_DIR } = require('../middleware/upload')
const { getAuthToken } = require('./helpers')

let png
let auth
let n = 0
const ip = () => `10.73.${Math.floor(++n / 250)}.${n % 250}`
const call = (method, url) => request(app)[method](url).set(auth).set('X-Forwarded-For', ip())
const sleep = ms => new Promise(r => setTimeout(r, ms))

const tmpFiles = () => (fs.existsSync(UPLOAD_DIR) ? fs.readdirSync(UPLOAD_DIR) : [])
// Javob qaytgach 'close' hodisasi bilan o'chiriladi — bir oz kutamiz
async function tmpCleared() {
  for (let i = 0; i < 60; i++) {
    if (tmpFiles().length === 0) return true
    await sleep(25)
  }
  return false
}

beforeAll(async () => {
  process.env.SUPABASE_URL = 'https://supabase.test'
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
  auth = { Authorization: `Bearer ${getAuthToken()}` }
  png = await sharp({ create: { width: 1600, height: 900, channels: 3, background: '#7b5ea7' } }).png().toBuffer()
})
beforeEach(() => {
  mockUpload.mockReset().mockResolvedValue({ error: null })
  mockRemove.mockReset().mockResolvedValue({ error: null })
})

describe('galereya: ko\'p fayl', () => {
  test("ikki rasm: original (o'zgarishsiz) + thumbnail Storage'ga, vaqtincha fayllar o'chadi", async () => {
    const spy = jest.spyOn(Gallery, 'create').mockImplementation(async d => ({ _id: 'x', ...d }))
    try {
      const res = await call('post', '/api/gallery')
        .field('title', 'Albom')
        .attach('imageFiles', png, { filename: 'a.png', contentType: 'image/png' })
        .attach('imageFiles', png, { filename: 'b.png', contentType: 'image/png' })
      expect(res.status).toBe(200)
      expect(res.body.images).toHaveLength(2)
      expect(res.body.images.every(u => /^https:\/\/cdn\.test\/gallery\//.test(u))).toBe(true)

      const names = mockUpload.mock.calls.map(c => c[0])
      expect(names.filter(p => p.endsWith('.thumb.webp'))).toHaveLength(2)
      const original = mockUpload.mock.calls.find(c => !c[0].endsWith('.thumb.webp'))
      expect(Buffer.isBuffer(original[1])).toBe(true)
      expect(original[1].equals(png)).toBe(true) // diskdan o'qilgan baytlar o'zgarishsiz
      expect(await tmpCleared()).toBe(true)
    } finally {
      spy.mockRestore()
    }
  })
})

describe('tadbir: bitta fayl', () => {
  test("rasm yuklanadi, thumbnail yaratiladi, vaqtincha fayl o'chadi", async () => {
    const spy = jest.spyOn(Event, 'create').mockImplementation(async d => ({ _id: 'x', ...d }))
    try {
      const res = await call('post', '/api/events')
        .field({ title: 'Tadbir', eventDate: '2026-10-15' })
        .attach('imageFile', png, { filename: 'e.png', contentType: 'image/png' })
      expect(res.status).toBe(200)
      expect(res.body.image).toMatch(/^https:\/\/cdn\.test\/events\/[0-9a-f-]{36}-e\.png$/)
      expect(mockUpload.mock.calls.some(c => c[0].endsWith('-e.png.thumb.webp'))).toBe(true)
      expect(await tmpCleared()).toBe(true)
    } finally {
      spy.mockRestore()
    }
  })
})

describe('rad etishlarda ham vaqtincha fayl qolmaydi', () => {
  test("rasm emas (matn, image/png deb yuborilgan) -> 400, Storage'ga yozilmaydi, fayl o'chadi", async () => {
    const res = await call('post', '/api/gallery')
      .field('title', 'Albom')
      .attach('imageFiles', Buffer.from('bu rasm emas, matn'), { filename: 'x.png', contentType: 'image/png' })
    expect(res.status).toBe(400)
    expect(mockUpload).not.toHaveBeenCalled()
    expect(await tmpCleared()).toBe(true)
  })

  test("5 MB dan katta fayl -> 400 (hajm xabari), fayl diskda qolmaydi", async () => {
    const big = Buffer.concat([png.subarray(0, 8), Buffer.alloc(5 * 1024 * 1024 + 10)])
    const res = await call('post', '/api/gallery').field('title', 'Albom').attach('imageFiles', big, { filename: 'big.png', contentType: 'image/png' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/hajmi juda katta/)
    expect(mockUpload).not.toHaveBeenCalled()
    expect(await tmpCleared()).toBe(true)
  })

  test("DB yozuvi yiqilsa: yuklangan original + thumbnail Storage'dan tozalanadi, vaqtincha fayl ham o'chadi", async () => {
    const spy = jest.spyOn(Gallery, 'create').mockRejectedValue(new Error('db down'))
    try {
      const res = await call('post', '/api/gallery')
        .field('title', 'Albom')
        .attach('imageFiles', png, { filename: 'a.png', contentType: 'image/png' })
      expect(res.status).toBe(400)
      const removed = mockRemove.mock.calls.flatMap(c => c[0])
      expect(removed).toHaveLength(2)
      expect(removed[1]).toBe(`${removed[0]}.thumb.webp`)
      expect(await tmpCleared()).toBe(true)
    } finally {
      spy.mockRestore()
    }
  })

  test("auth'siz so'rov -> 401 va diskka hech narsa yozilmaydi", async () => {
    const res = await request(app).post('/api/gallery').set('X-Forwarded-For', ip())
      .field('title', 'Albom').attach('imageFiles', png, { filename: 'a.png', contentType: 'image/png' })
    expect(res.status).toBe(401)
    expect(tmpFiles()).toHaveLength(0)
  })
})

describe('upload middleware', () => {
  test("vaqtincha papka faqat egasi uchun (0700) va tasodifiy nomli fayllar", async () => {
    const spy = jest.spyOn(Gallery, 'create').mockImplementation(async d => ({ _id: 'x', ...d }))
    try {
      await call('post', '/api/gallery').field('title', 'A').attach('imageFiles', png, { filename: 'a.png', contentType: 'image/png' })
      expect(fs.statSync(UPLOAD_DIR).mode & 0o777).toBe(0o700)
    } finally {
      spy.mockRestore()
    }
  })
})
