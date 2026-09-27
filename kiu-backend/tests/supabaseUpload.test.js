// services/supabaseUpload.js — unit testlar. Supabase klienti to'liq mock qilinadi,
// haqiqiy Storage'ga hech qanday so'rov ketmaydi.
const mockUpload = jest.fn()
const mockGetPublicUrl = jest.fn()
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: { from: jest.fn(() => ({ upload: mockUpload, getPublicUrl: mockGetPublicUrl })) },
  })),
}))

const { uploadImageToSupabase } = require('../services/supabaseUpload')

const MB = 1024 * 1024

function fakeFile(overrides = {}) {
  const buffer = overrides.buffer ?? Buffer.from('rasm-baytlari')
  return { buffer, mimetype: 'image/png', size: buffer.length, originalname: 'rasm.png', ...overrides }
}

beforeAll(() => {
  process.env.SUPABASE_URL = 'https://supabase.test'
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
})

beforeEach(() => {
  mockUpload.mockReset().mockResolvedValue({ error: null })
  mockGetPublicUrl.mockReset().mockImplementation(p => ({ data: { publicUrl: `https://cdn.test/${p}` } }))
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

describe("BILINGAN XAVF (hozirgi xatti-harakatni qayd etadi)", () => {
  // MIME turi faqat mijoz yuborgan `Content-Type` sarlavhasidan olinadi. Ichida HTML/skript
  // bo'lgan fayl "image/png" deb yuborilsa, qabul qilinadi. Magic-bytes tekshiruvi qo'shilganda
  // bu test ataylab yiqiladi — shunda uni "rad etiladi" ko'rinishiga o'zgartiring.
  test("KNOWN RISK: ichi HTML bo'lgan fayl 'image/png' deb yuborilsa qabul qilinadi", async () => {
    const html = Buffer.from('<html><script>alert(1)</script></html>')
    await expect(uploadImageToSupabase(fakeFile({ buffer: html, mimetype: 'image/png' }), 'news')).resolves.toBeDefined()
    expect(mockUpload).toHaveBeenCalledTimes(1)
  })
})