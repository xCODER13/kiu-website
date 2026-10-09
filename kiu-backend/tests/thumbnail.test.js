// services/thumbnail (reja 2.2): haqiqiy `sharp` bilan. DB kerak emas.
const sharp = require('sharp')
const { makeThumbnail, thumbPathOf, THUMB_WIDTH, MAX_INPUT_PIXELS } = require('../services/thumbnail')

const solid = (width, height, format = 'png') =>
  sharp({ create: { width, height, channels: 3, background: { r: 123, g: 94, b: 167 } } })[format]().toBuffer()

describe('makeThumbnail', () => {
  test(`katta rasm -> ${THUMB_WIDTH}px enli WebP, nisbat saqlanadi, hajm keskin kamayadi`, async () => {
    const original = await solid(2000, 1000)
    const thumb = await makeThumbnail(original)
    const meta = await sharp(thumb).metadata()
    expect(meta.format).toBe('webp')
    expect(meta.width).toBe(THUMB_WIDTH)
    expect(meta.height).toBe(THUMB_WIDTH / 2)
    expect(thumb.length).toBeLessThan(original.length)
  })

  test("kichik rasm kattalashtirilmaydi (withoutEnlargement)", async () => {
    const meta = await sharp(await makeThumbnail(await solid(200, 100))).metadata()
    expect(meta.width).toBe(200)
  })

  test.each(['jpeg', 'webp', 'gif'])('%s kirish qabul qilinadi', async format => {
    const thumb = await makeThumbnail(await solid(800, 400, format))
    expect((await sharp(thumb).metadata()).format).toBe('webp')
  })

  test("dekodlab bo'lmaydigan bufer -> null, throw yo'q", async () => {
    await expect(makeThumbnail(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]))).resolves.toBeNull()
    await expect(makeThumbnail(Buffer.from('rasm emas'))).resolves.toBeNull()
  })

  test("piksel limitidan oshgan rasm (piksel bombasi) -> null: kichik fayl, lekin 40 MP dan ko'p", async () => {
    const side = Math.ceil(Math.sqrt(MAX_INPUT_PIXELS)) + 100
    const bomb = await solid(side, side) // bir xil rang — PNG juda kichik siqiladi
    expect(bomb.length).toBeLessThan(5 * 1024 * 1024)
    await expect(makeThumbnail(bomb)).resolves.toBeNull()
  })

  test("EXIF yo'nalishi qo'llanadi (rasm to'g'ri tomonga buriladi)", async () => {
    const rotated = await sharp({ create: { width: 800, height: 400, channels: 3, background: '#fff' } })
      .jpeg().withMetadata({ orientation: 6 }).toBuffer()
    expect((await sharp(rotated).metadata()).orientation).toBe(6)
    const meta = await sharp(await makeThumbnail(rotated)).metadata()
    expect(meta.width).toBe(400) // 6 = 90° burilgan: 800×400 -> 400×800 (kenglik 400 < 640, kattalashtirilmaydi)
    expect(meta.height).toBe(800)
  })

  test("EXIF/GPS metadata thumbnail'ga o'tmaydi", async () => {
    const withExif = await sharp({ create: { width: 800, height: 400, channels: 3, background: '#fff' } })
      .jpeg().withExif({ IFD0: { Copyright: 'maxfiy-muallif' } }).toBuffer()
    expect((await sharp(withExif).metadata()).exif).toBeDefined() // manba rasmda bor
    expect((await sharp(await makeThumbnail(withExif)).metadata()).exif).toBeUndefined()
  })
})

describe('thumbPathOf', () => {
  test("original yo'liga `.thumb.webp` qo'shadi (nom qoidasi frontend bilan kelishilgan)", () => {
    expect(thumbPathOf('news/abc-rasm.png')).toBe('news/abc-rasm.png.thumb.webp')
  })
})

describe('sharp yuklanmasa', () => {
  test("null qaytadi, throw yo'q, qayta-qayta urinilmaydi", async () => {
    jest.resetModules()
    let attempts = 0
    jest.doMock('sharp', () => { attempts++; throw new Error('native modul topilmadi') })
    try {
      const fresh = require('../services/thumbnail')
      await expect(fresh.makeThumbnail(Buffer.from('x'))).resolves.toBeNull()
      await expect(fresh.makeThumbnail(Buffer.from('x'))).resolves.toBeNull()
      expect(attempts).toBe(1)
    } finally {
      jest.dontMock('sharp')
      jest.resetModules()
    }
  })
})
