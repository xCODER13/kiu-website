// services/supabaseUpload.js — unit testlar. Supabase klienti to'liq mock qilinadi,
// haqiqiy Storage'ga hech qanday so'rov ketmaydi.
const mockUpload = jest.fn()
const mockGetPublicUrl = jest.fn()
const mockRemove = jest.fn()
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: { from: jest.fn(() => ({ upload: mockUpload, getPublicUrl: mockGetPublicUrl, remove: mockRemove })) },
  })),
}))

const { uploadImageToSupabase, uploadImagesToSupabase, deleteSupabaseImages } = require('../services/supabaseUpload')

const MB = 1024 * 1024

// Standart bufer — haqiqiy PNG imzosi bilan boshlanadi (magic-bytes tekshiruvidan
// o'tishi uchun). Boshqa testlarda buffer overrideda beriladi.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])

function fakeFile(overrides = {}) {
  const buffer = overrides.buffer ?? PNG_SIGNATURE
  return { buffer, mimetype: 'image/png', size: buffer.length, originalname: 'rasm.png', ...overrides }
}

beforeAll(() => {
  process.env.SUPABASE_URL = 'https://supabase.test'
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
})

beforeEach(() => {
  mockUpload.mockReset().mockResolvedValue({ error: null })
  mockGetPublicUrl.mockReset().mockImplementation(p => ({ data: { publicUrl: `https://cdn.test/${p}` } }))
  mockRemove.mockReset().mockResolvedValue({ error: null })
})

describe('uploadImageToSupabase — muvaffaqiyatli yuklash', () => {
  test("public URL qaytaradi, 'news-images' bucket'ga papka/uuid-nom bilan yuklaydi", async () => {
    const url = await uploadImageToSupabase(fakeFile(), 'news')

    expect(mockUpload).toHaveBeenCalledTimes(1)
    const [path, buffer, options] = mockUpload.mock.calls[0]
    expect(path).toMatch(/^news\/[0-9a-f-]{36}-rasm\.png$/)
    expect(Buffer.isBuffer(buffer)).toBe(true)
    expect(options).toEqual({ contentType: 'image/png' })
    expect(url).toBe(`https://cdn.test/${path}`)
  })

  test.each(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])('%s qabul qilinadi', async mimetype => {
    await expect(uploadImageToSupabase(fakeFile({ mimetype }), 'events')).resolves.toMatch(/^https:\/\/cdn\.test\/events\//)
  })

  test.each(['news', 'events', 'teachers', 'gallery'])("'%s' papkasiga yuklaydi", async folder => {
    await uploadImageToSupabase(fakeFile(), folder)
    expect(mockUpload.mock.calls[0][0].startsWith(`${folder}/`)).toBe(true)
  })

  test('aynan 5 MB fayl qabul qilinadi (chegara ichida)', async () => {
    await expect(uploadImageToSupabase(fakeFile({ size: 5 * MB }), 'news')).resolves.toBeDefined()
  })

  test('har yuklashda noyob yo\'l beriladi (bir xil nomli fayllar bir-birini bosib ketmaydi)', async () => {
    await uploadImageToSupabase(fakeFile(), 'news')
    await uploadImageToSupabase(fakeFile(), 'news')
    expect(mockUpload.mock.calls[0][0]).not.toBe(mockUpload.mock.calls[1][0])
  })
})

describe('uploadImageToSupabase — rad etish (Storage\'ga hech narsa yuborilmaydi)', () => {
  test.each([
    ['fayl yo\'q', undefined],
    ['buffer yo\'q', { mimetype: 'image/png', size: 1, originalname: 'a.png' }],
  ])('%s', async (_label, file) => {
    await expect(uploadImageToSupabase(file, 'news')).rejects.toThrow('Yuklanadigan fayl topilmadi')
    expect(mockUpload).not.toHaveBeenCalled()
  })

  test.each(['text/html', 'image/svg+xml', 'application/pdf', 'application/javascript', ''])(
    "ruxsat etilmagan MIME turi ('%s') rad etiladi",
    async mimetype => {
      await expect(uploadImageToSupabase(fakeFile({ mimetype }), 'news')).rejects.toThrow('Ruxsat etilmagan fayl turi')
      expect(mockUpload).not.toHaveBeenCalled()
    }
  )

  test("5 MB dan katta fayl (5 MB + 1 bayt) rad etiladi", async () => {
    await expect(uploadImageToSupabase(fakeFile({ size: 5 * MB + 1 }), 'news')).rejects.toThrow('Fayl hajmi juda katta')
    expect(mockUpload).not.toHaveBeenCalled()
  })

  test.each(['../etc', 'news/../../x', 'avatars', '', undefined])(
    "ruxsat etilmagan papka (%p) rad etiladi",
    async folder => {
      await expect(uploadImageToSupabase(fakeFile(), folder)).rejects.toThrow("Noto'g'ri yuklash papkasi")
      expect(mockUpload).not.toHaveBeenCalled()
    }
  )

  test("Supabase xato qaytarsa, xato xabari bilan reject qiladi", async () => {
    mockUpload.mockResolvedValue({ error: { message: 'bucket not found' } })
    await expect(uploadImageToSupabase(fakeFile(), 'news')).rejects.toThrow('Supabase upload xatosi: bucket not found')
    expect(mockGetPublicUrl).not.toHaveBeenCalled()
  })
})

describe('fayl nomini tozalash (path traversal himoyasi)', () => {
  test.each([
    ['../../etc/passwd.png'],
    ['..\\..\\windows\\system32.png'],
    ['rasm bilan bo\'sh joy va #?&%.png'],
    ['фото-o\'zbek.png'],
  ])("'%s' — yo'lda ortiqcha '/' yoki maxsus belgi qolmaydi", async originalname => {
    await uploadImageToSupabase(fakeFile({ originalname }), 'teachers')
    const path = mockUpload.mock.calls[0][0]
    // faqat "teachers/" dan keyin bitta '/' bo'lmasligi va nom faqat xavfsiz belgilardan iborat bo'lishi kerak
    expect(path).toMatch(/^teachers\/[0-9a-f-]{36}-[\w.-]+$/)
  })

  test('juda uzun nom oxirgi 100 belgigacha qisqartiriladi', async () => {
    await uploadImageToSupabase(fakeFile({ originalname: `${'a'.repeat(300)}.png` }), 'news')
    const namePart = mockUpload.mock.calls[0][0].replace(/^news\/[0-9a-f-]{36}-/, '')
    expect(namePart.length).toBeLessThanOrEqual(100)
    expect(namePart.endsWith('.png')).toBe(true)
  })
})

describe('lazy-init', () => {
  test("SUPABASE_URL/SUPABASE_SERVICE_KEY sozlanmagan bo'lsa, modul yuklanganda emas, yuklash paytida xato beradi", async () => {
    const savedUrl = process.env.SUPABASE_URL
    const savedKey = process.env.SUPABASE_SERVICE_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_KEY
    try {
      await jest.isolateModulesAsync(async () => {
        const fresh = require('../services/supabaseUpload') // require paytida yiqilmasligi kerak
        await expect(fresh.uploadImageToSupabase(fakeFile(), 'news')).rejects.toThrow('sozlanmagan')
      })
    } finally {
      process.env.SUPABASE_URL = savedUrl
      process.env.SUPABASE_SERVICE_KEY = savedKey
    }
  })
})

describe('mazmun (magic-bytes) tekshiruvi — client Content-Type ishonchli emas', () => {
  // Avval bu holat qabul qilinardi ("BILINGAN XAVF" deb qayd etilgan edi).
  // Endi fayl mazmuni ham tekshirilgani uchun rad etiladi.
  test.each([
    ['ichida HTML/skript bor', Buffer.from('<html><script>alert(1)</script></html>')],
    ["ichida PHP skript bor", Buffer.from('<?php system($_GET["cmd"]); ?>')],
    ['oddiy matn', Buffer.from('bu shunchaki matn, rasm emas')],
    ["bo'sh fayl", Buffer.alloc(0)],
    ["buzilgan/qisman PNG imzosi", Buffer.from([0x89, 0x50, 0x4e])],
  ])("%s — 'image/png' deb yuborilsa ham rad etiladi", async (_label, buffer) => {
    await expect(uploadImageToSupabase(fakeFile({ buffer, mimetype: 'image/png' }), 'news')).rejects.toThrow(
      'mazmuni haqiqiy rasm formatiga mos kelmadi'
    )
    expect(mockUpload).not.toHaveBeenCalled()
  })

  test.each([
    ['PNG', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0])],
    ['JPEG', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0])],
    ['GIF', Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0])],
    ['WEBP', Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])],
  ])('haqiqiy %s imzosiga ega fayl qabul qilinadi (deklaratsiya qilingan MIME boshqa bo\'lsa ham)', async (_label, buffer) => {
    await expect(uploadImageToSupabase(fakeFile({ buffer, mimetype: 'image/png' }), 'news')).resolves.toBeDefined()
  })
})

describe('deleteSupabaseImages', () => {
  test("bitta yo'lni massiv qilib remove()ga beradi", async () => {
    await deleteSupabaseImages('news/abc-a.png')
    expect(mockRemove).toHaveBeenCalledWith(['news/abc-a.png'])
  })

  test("bir nechta yo'lni birgalikda o'chiradi", async () => {
    await deleteSupabaseImages(['news/a.png', 'news/b.png'])
    expect(mockRemove).toHaveBeenCalledWith(['news/a.png', 'news/b.png'])
  })

  test("bo'sh massiv/undefined bilan Storage'ga umuman murojaat qilmaydi", async () => {
    await deleteSupabaseImages([])
    await deleteSupabaseImages(undefined)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  test('Supabase xato qaytarsa, xato xabari bilan reject qiladi', async () => {
    mockRemove.mockResolvedValue({ error: { message: 'not found' } })
    await expect(deleteSupabaseImages(['news/a.png'])).rejects.toThrow("Supabase'dan o'chirishda xato: not found")
  })
})

describe("uploadImagesToSupabase — ko'p fayl, qisman muvaffaqiyatsizlikda rollback", () => {
  test("barcha fayllar muvaffaqiyatli bo'lsa, URL va yo'llar massivini qaytaradi, hech narsa o'chirilmaydi", async () => {
    const result = await uploadImagesToSupabase([fakeFile({ originalname: '1.png' }), fakeFile({ originalname: '2.png' })], 'news')
    expect(result.urls).toHaveLength(2)
    expect(result.paths).toHaveLength(2)
    expect(result.urls[0]).toBe(`https://cdn.test/${result.paths[0]}`)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  test("bo'sh massiv bilan chaqirilsa, bo'sh natija qaytaradi (Storage'ga murojaat qilinmaydi)", async () => {
    const result = await uploadImagesToSupabase([], 'news')
    expect(result).toEqual({ urls: [], paths: [] })
    expect(mockUpload).not.toHaveBeenCalled()
  })

  test('ikkinchi fayl Supabase xatosi bilan yiqilsa, birinchisi (muvaffaqiyatli) avtomatik tozalanadi', async () => {
    mockUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'boom' } })

    await expect(
      uploadImagesToSupabase([fakeFile({ originalname: '1.png' }), fakeFile({ originalname: '2.png' })], 'news')
    ).rejects.toThrow('Supabase upload xatosi: boom')

    expect(mockUpload).toHaveBeenCalledTimes(2)
    expect(mockRemove).toHaveBeenCalledTimes(1)
    expect(mockRemove.mock.calls[0][0]).toEqual([expect.stringMatching(/^news\/[0-9a-f-]{36}-1\.png$/)])
  })

  test('ikkinchi fayl MIME/magic-bytes tekshiruvidan o\'tmasa ham, birinchisi tozalanadi', async () => {
    const badFile = fakeFile({ buffer: Buffer.from('rasm emas'), originalname: '2.png' })
    await expect(uploadImagesToSupabase([fakeFile({ originalname: '1.png' }), badFile], 'news')).rejects.toThrow(
      'mazmuni haqiqiy rasm formatiga mos kelmadi'
    )
    expect(mockUpload).toHaveBeenCalledTimes(1) // 2-fayl Supabase'ga yetib bormaydi ham
    expect(mockRemove).toHaveBeenCalledTimes(1)
  })

  test('tozalash (rollback) o\'zi muvaffaqiyatsiz bo\'lsa ham, asl xato saqlanib qoladi', async () => {
    mockUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'boom' } })
    mockRemove.mockResolvedValue({ error: { message: 'rollback ham muvaffaqiyatsiz' } })

    await expect(
      uploadImagesToSupabase([fakeFile({ originalname: '1.png' }), fakeFile({ originalname: '2.png' })], 'news')
    ).rejects.toThrow('Supabase upload xatosi: boom') // rollback xatosi emas, asl xato chiqadi
  })
})