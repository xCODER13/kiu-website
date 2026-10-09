// services/imageCleanup (reja 2.1): eski rasmlarni Storage'dan o'chirish — qaytarib bo'lmaydigan amal, shuning uchun
// yo'l faqat bizning bucket'dagi `papka/fayl` ko'rinishidan chiqariladi, boshqa hujjat havola qilsa tegilmaydi
// va xato hech qachon tashqariga chiqmaydi. Bu fayl DB'siz ham ishlaydi (modellar `exists` spy'i bilan almashtirilgan).
const mockRemove = jest.fn()
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        remove: mockRemove,
        getPublicUrl: p => ({ data: { publicUrl: `https://cdn.test/${p}` } }),
      })),
    },
  })),
}))

const News = require('../models/News')
const Event = require('../models/Event')
const Teacher = require('../models/Teacher')
const Gallery = require('../models/Gallery')
const StudentLife = require('../models/StudentLife')
const { removeStoredImages, removedUrls, toStoragePath } = require('../services/imageCleanup')

const P = 'https://cdn.test/'
const A = `${P}news/aaaa-a.png`
const B = `${P}news/bbbb-b.png`
const req = () => ({ log: { warn: jest.fn(), error: jest.fn() } })

let spies
function references(value) {
  spies = [News, Event, Teacher, Gallery, StudentLife].map(M => jest.spyOn(M, 'exists').mockResolvedValue(value))
}

beforeAll(() => {
  process.env.SUPABASE_URL = 'https://supabase.test'
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
})
beforeEach(() => {
  mockRemove.mockReset().mockResolvedValue({ error: null })
  references(null)
})
afterEach(() => spies.forEach(s => s.mockRestore()))

describe('toStoragePath', () => {
  test("bizning bucket'dagi papka/fayl -> yo'l; eski yuklashlardagi %20 dekodlanadi, rest esa kodlanganicha qoladi", () => {
    expect(toStoragePath(A, P)).toEqual({ path: 'news/aaaa-a.png', rest: 'news/aaaa-a.png' })
    expect(toStoragePath(`${P}events/eski%20rasm.jpg`, P)).toEqual({ path: 'events/eski rasm.jpg', rest: 'events/eski%20rasm.jpg' })
    for (const folder of ['news', 'events', 'teachers', 'gallery', 'student-life']) {
      expect(toStoragePath(`${P}${folder}/x.png`, P)).not.toBeNull()
    }
  })

  test.each([
    ['begona host', 'https://evil.example/news/a.png'],
    ['prefiks o\'xshash host', 'https://cdn.test.evil.example/news/a.png'],
    ['ruxsat etilmagan papka', `${P}private/a.png`],
    ['papkasiz fayl', `${P}a.png`],
    ['ichma-ich papka', `${P}news/sub/a.png`],
    ['fayl nomi yo\'q', `${P}news/`],
    ['yuqoriga chiqish', `${P}news/../private/a.png`],
    ['kodlangan yuqoriga chiqish', `${P}news/%2e%2e/a.png`],
    ['kodlangan slash', `${P}news%2Fa.png`],
    ['yaroqsiz kodlash', `${P}news/%E0%A4%A.png`],
    ['so\'rov qatori', `${P}news/a.png?x=1`],
    ['satr emas', 42],
  ])('null: %s', (_n, url) => {
    expect(toStoragePath(url, P)).toBeNull()
  })
})

describe('removedUrls', () => {
  test("eski ro'yxatda bor, yangisida yo'q URL'lar; bo'sh va takroriy qiymatlar tushib qoladi", () => {
    expect(removedUrls([A, B, A, ''], [B])).toEqual([A])
    expect(removedUrls([A, B], [A, B])).toEqual([])
    expect(removedUrls([A], [])).toEqual([A])
    expect(removedUrls([undefined, null, ''], [])).toEqual([])
    expect(removedUrls([], [A])).toEqual([])
  })
})

describe('removeStoredImages', () => {
  test("original bilan birga uning thumbnail'i (`.thumb.webp`) ham o'chiriladi (2.2)", async () => {
    await removeStoredImages(req(), [A])
    expect(mockRemove.mock.calls[0][0]).toContain('news/aaaa-a.png.thumb.webp')
  })

  test("faqat bizning rasmlar bitta so'rovda o'chiriladi; begona URL va ruxsat etilmagan papka e'tiborsiz", async () => {
    await removeStoredImages(req(), [A, B, 'https://old-host.example/x.png', `${P}private/z.png`, '', null])
    expect(mockRemove).toHaveBeenCalledTimes(1)
    expect(mockRemove).toHaveBeenCalledWith(['news/aaaa-a.png', 'news/aaaa-a.png.thumb.webp', 'news/bbbb-b.png', 'news/bbbb-b.png.thumb.webp'])
  })

  test("bir xil URL ikki marta berilsa — bir marta o'chiriladi", async () => {
    await removeStoredImages(req(), [A, A])
    expect(mockRemove).toHaveBeenCalledWith(['news/aaaa-a.png', 'news/aaaa-a.png.thumb.webp'])
  })

  test("boshqa hujjat hamon havola qilsa — fayl O'CHIRILMAYDI; qolganlari o'chiriladi", async () => {
    News.exists.mockImplementation(async q => (q.image.test(`${P}news/aaaa-a.png`) ? { _id: 1 } : null))
    await removeStoredImages(req(), [A, B])
    expect(mockRemove).toHaveBeenCalledWith(['news/bbbb-b.png', 'news/bbbb-b.png.thumb.webp'])
  })

  test("havola tekshiruvi 5 ta kolleksiyani qamraydi (Gallery — `images` massivi, StudentLife — `image`)", async () => {
    await removeStoredImages(req(), [A])
    expect(News.exists).toHaveBeenCalledWith({ image: expect.any(RegExp) })
    expect(Event.exists).toHaveBeenCalledWith({ image: expect.any(RegExp) })
    expect(Teacher.exists).toHaveBeenCalledWith({ image: expect.any(RegExp) })
    expect(Gallery.exists).toHaveBeenCalledWith({ images: expect.any(RegExp) })
    expect(StudentLife.exists).toHaveBeenCalledWith({ image: expect.any(RegExp) })
  })

  test("regex maxsus belgilari escape qilinadi (nuqta har qanday belgiga mos kelmasin)", async () => {
    const seen = []
    News.exists.mockImplementation(async q => { seen.push(q.image); return null })
    await removeStoredImages(req(), [A])
    expect(seen[0].test('news/aaaa-a.png')).toBe(true)
    expect(seen[0].test('news/aaaa-aXpng')).toBe(false)
  })

  test("Storage xatosi tashqariga chiqmaydi: faqat log (yetim yo'llar bilan)", async () => {
    mockRemove.mockResolvedValue({ error: { message: 'storage down' } })
    const r = req()
    await expect(removeStoredImages(r, [A])).resolves.toBeUndefined()
    expect(r.log.error).toHaveBeenCalledTimes(1)
    const [meta] = r.log.error.mock.calls[0]
    expect(meta.orphanedPaths).toEqual(['news/aaaa-a.png', 'news/aaaa-a.png.thumb.webp'])
    expect(meta.err).toMatch(/storage down/)
  })

  test("DB tekshiruvi (havola qidirish) yiqilsa ham tashqariga chiqmaydi va hech narsa o'chirilmaydi", async () => {
    News.exists.mockRejectedValue(new Error('db down'))
    const r = req()
    await expect(removeStoredImages(r, [A])).resolves.toBeUndefined()
    expect(mockRemove).not.toHaveBeenCalled()
    expect(r.log.error).toHaveBeenCalledTimes(1)
  })

  test("bo'sh/yaroqsiz kirish — hech qanday chaqiruv yo'q", async () => {
    await removeStoredImages(req(), [])
    await removeStoredImages(req(), undefined)
    await removeStoredImages(req(), ['', null])
    expect(mockRemove).not.toHaveBeenCalled()
    expect(News.exists).not.toHaveBeenCalled()
  })

  test("Storage sozlanmagan bo'lsa (prefiks yo'q) o'chirmaydi va throw qilmaydi", async () => {
    const savedUrl = process.env.SUPABASE_URL
    const savedKey = process.env.SUPABASE_SERVICE_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_KEY
    try {
      let fresh
      jest.isolateModules(() => { fresh = require('../services/imageCleanup') })
      const r = req()
      await expect(fresh.removeStoredImages(r, [A])).resolves.toBeUndefined()
      expect(mockRemove).not.toHaveBeenCalled()
      expect(r.log.warn).toHaveBeenCalledTimes(1)
    } finally {
      process.env.SUPABASE_URL = savedUrl
      process.env.SUPABASE_SERVICE_KEY = savedKey
    }
  })

  test("req.log bo'lmasa umumiy logger ishlatiladi (throw qilmaydi)", async () => {
    mockRemove.mockResolvedValue({ error: { message: 'x' } })
    await expect(removeStoredImages(undefined, [A])).resolves.toBeUndefined()
  })
})
