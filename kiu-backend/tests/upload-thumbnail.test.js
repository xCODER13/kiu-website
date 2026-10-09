// services/supabaseUpload (2.2 + 2.3): thumbnail yuklash, diskdagi fayl, cheklangan parallellik, rollback.
// Supabase klienti mock; DB kerak emas.
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
const os = require('os')
const path = require('path')
const sharp = require('sharp')
const { uploadImagesToSupabase } = require('../services/supabaseUpload')

let png
const file = (overrides = {}) => ({ buffer: png, mimetype: 'image/png', size: png.length, originalname: 'rasm.png', ...overrides })
const FAKE_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]) // imzo bor, dekodlanmaydi

beforeAll(async () => {
  process.env.SUPABASE_URL = 'https://supabase.test'
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
  png = await sharp({ create: { width: 1600, height: 900, channels: 3, background: '#7b5ea7' } }).png().toBuffer()
})
beforeEach(() => {
  mockUpload.mockReset().mockResolvedValue({ error: null })
  mockRemove.mockReset().mockResolvedValue({ error: null })
})

describe('thumbnail yuklash', () => {
  test("original + `<yo'l>.thumb.webp` (image/webp); `paths` avval originallar, keyin thumbnail'lar; URL original uchun", async () => {
    const { urls, paths } = await uploadImagesToSupabase([file({ originalname: '1.png' }), file({ originalname: '2.png' })], 'gallery')
    expect(mockUpload).toHaveBeenCalledTimes(4)
    expect(urls).toHaveLength(2)
    expect(paths).toHaveLength(4)
    expect(paths.slice(0, 2).every(p => !p.endsWith('.thumb.webp'))).toBe(true)
    expect(paths.slice(2)).toEqual(paths.slice(0, 2).map(p => `${p}.thumb.webp`))
    expect(urls[0]).toBe(`https://cdn.test/${paths[0]}`)

    const thumbCall = mockUpload.mock.calls.find(c => c[0].endsWith('.thumb.webp'))
    expect(thumbCall[2]).toEqual({ contentType: 'image/webp' })
    expect((await sharp(thumbCall[1]).metadata()).width).toBe(640)
    // original o'zgarishsiz yuklanadi (qayta kodlanmaydi)
    const originalCall = mockUpload.mock.calls.find(c => !c[0].endsWith('.thumb.webp'))
    expect(originalCall[1].equals(png)).toBe(true)
    expect(originalCall[2]).toEqual({ contentType: 'image/png' })
  })

  test("thumbnail yaratib bo'lmasa (dekodlanmaydigan rasm) — original baribir yuklanadi, xato yo'q", async () => {
    const { urls, paths } = await uploadImagesToSupabase([file({ buffer: FAKE_PNG, size: FAKE_PNG.length })], 'news')
    expect(mockUpload).toHaveBeenCalledTimes(1)
    expect(urls).toHaveLength(1)
    expect(paths).toHaveLength(1)
  })

  test("thumbnail'ni Storage'ga yuklab bo'lmasa — original qoladi, yuklash muvaffaqiyatli, `paths`da thumbnail yo'q", async () => {
    mockUpload.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: { message: 'thumb boom' } })
    const { urls, paths } = await uploadImagesToSupabase([file()], 'news')
    expect(urls).toHaveLength(1)
    expect(paths).toHaveLength(1)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  test("ikkinchi fayl yiqilsa, birinchisi O'ZINING thumbnail'i bilan tozalanadi", async () => {
    const bad = file({ buffer: Buffer.from('rasm emas'), originalname: '2.png' })
    await expect(uploadImagesToSupabase([file({ originalname: '1.png' }), bad], 'news')).rejects.toThrow('mazmuni haqiqiy rasm formatiga mos kelmadi')
    expect(mockRemove).toHaveBeenCalledTimes(1)
    const removed = mockRemove.mock.calls[0][0]
    expect(removed).toHaveLength(2)
    expect(removed[1]).toBe(`${removed[0]}.thumb.webp`)
  })
})

describe('diskdagi fayl (multer diskStorage, 2.3)', () => {
  let dir
  beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kiu-test-')) })
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }))

  test("`file.path` dan o'qiladi (buffer yo'q): original baytlari o'zgarishsiz Storage'ga ketadi", async () => {
    const p = path.join(dir, 'f1')
    fs.writeFileSync(p, png)
    const { urls } = await uploadImagesToSupabase([{ path: p, mimetype: 'image/png', size: png.length, originalname: 'disk.png' }], 'events')
    expect(urls[0]).toMatch(/^https:\/\/cdn\.test\/events\/[0-9a-f-]{36}-disk\.png$/)
    const originalCall = mockUpload.mock.calls.find(c => !c[0].endsWith('.thumb.webp'))
    expect(originalCall[1].equals(png)).toBe(true)
  })

  test("buffer ham, path ham yo'q — 'fayl topilmadi'", async () => {
    await expect(uploadImagesToSupabase([{ mimetype: 'image/png', size: 1, originalname: 'x.png' }], 'news')).rejects.toThrow('Yuklanadigan fayl topilmadi')
  })

  test("diskdagi fayl rasm emas — magic-bytes tekshiruvi baribir rad etadi", async () => {
    const p = path.join(dir, 'f2')
    fs.writeFileSync(p, 'bu matn fayl')
    await expect(uploadImagesToSupabase([{ path: p, mimetype: 'image/png', size: 12, originalname: 'x.png' }], 'news')).rejects.toThrow('mazmuni haqiqiy rasm formatiga mos kelmadi')
    expect(mockUpload).not.toHaveBeenCalled()
  })
})

describe('cheklangan parallellik (RAM: 10 × 5 MB emas)', () => {
  test('10 fayl, bir vaqtda ko\'pi bilan 3 ta original yuklash jarayonda', async () => {
    let inFlight = 0
    let maxInFlight = 0
    mockUpload.mockImplementation(async p => {
      if (p.endsWith('.thumb.webp')) return { error: null }
      inFlight++
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise(r => setTimeout(r, 15))
      inFlight--
      return { error: null }
    })
    const files = Array.from({ length: 10 }, (_, i) => file({ originalname: `${i}.png` }))
    const { urls } = await uploadImagesToSupabase(files, 'gallery')
    expect(urls).toHaveLength(10)
    expect(maxInFlight).toBeLessThanOrEqual(3)
    expect(maxInFlight).toBeGreaterThan(1) // ketma-ket emas, parallel ham ishlaydi
  })

  test("birinchi xatodan keyin yangi fayllar boshlanmaydi; allaqachon yuklanganlari tozalanadi", async () => {
    let n = 0
    mockUpload.mockImplementation(async p => {
      if (p.endsWith('.thumb.webp')) return { error: null }
      const mine = ++n
      await new Promise(r => setTimeout(r, 10))
      return mine === 1 ? { error: { message: 'boom' } } : { error: null }
    })
    const files = Array.from({ length: 10 }, (_, i) => file({ originalname: `${i}.png` }))
    await expect(uploadImagesToSupabase(files, 'gallery')).rejects.toThrow('Supabase upload xatosi: boom')
    const originalUploads = mockUpload.mock.calls.filter(c => !c[0].endsWith('.thumb.webp')).length
    expect(originalUploads).toBeLessThan(10)
    // muvaffaqiyatli yuklanganlar (original + thumbnail) olib tashlandi
    const removed = mockRemove.mock.calls.flatMap(c => c[0])
    expect(removed.length).toBeGreaterThan(0)
    expect(removed.filter(p => p.endsWith('.thumb.webp')).length).toBe(removed.filter(p => !p.endsWith('.thumb.webp')).length)
  })
})
