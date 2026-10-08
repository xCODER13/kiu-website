import { describe, it, expect } from 'vitest'
import { extractYouTubeShortsId, parseImages, markBroken, formatDateShort, formatCount } from './helpers'

const ID = 'dQw4w9WgXcQ'
describe('extractYouTubeShortsId', () => {
  it.each([
    [`https://www.youtube.com/shorts/${ID}`],
    [`https://youtube.com/shorts/${ID}?feature=share`],
    [`https://m.youtube.com/watch?v=${ID}`],
    [`https://www.youtube.com/watch?v=${ID}&t=5s`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=abc`],
    [`https://www.youtube.com/embed/${ID}`],
    [`  https://youtu.be/${ID}  `],
  ])('%s', url => expect(extractYouTubeShortsId(url)).toBe(ID))

  it.each([null, undefined, ''])('bo\'sh: %j', v => expect(extractYouTubeShortsId(v)).toBe(''))
  it('YouTube bo\'lmagan domen — bo\'sh', () => {
    expect(extractYouTubeShortsId(`https://evil.com/shorts/${ID}`)).toBe('')
    expect(extractYouTubeShortsId(`https://youtube.com.evil.com/watch?v=${ID}`)).toBe('')
  })
  it('URL bo\'lmagan matndan regex orqali ajratadi', () => {
    expect(extractYouTubeShortsId(`youtu.be/${ID}`)).toBe(ID)
    expect(extractYouTubeShortsId('salom')).toBe('')
  })
})

describe('parseImages', () => {
  it('bo\'sh qiymat — []', () => { expect(parseImages('')).toEqual([]); expect(parseImages(null)).toEqual([]) })
  it('JSON massiv', () => expect(parseImages('["a.jpg","b.jpg"]')).toEqual(['a.jpg', 'b.jpg']))
  it('eski format — bitta URL', () => expect(parseImages('https://x.uz/a.jpg')).toEqual(['https://x.uz/a.jpg']))
  it('JSON, lekin massiv emas — string sifatida qaytadi', () => expect(parseImages('{"a":1}')).toEqual(['{"a":1}']))
})

describe('markBroken', () => {
  it("yuklanmagan rasmga `data-broken` qo'yadi, inline stil yozmaydi", () => {
    const img = document.createElement('img')
    markBroken({ currentTarget: img })
    expect(img.dataset.broken).toBe('true')
    expect(img.getAttribute('style')).toBeNull()
  })
})

describe('formatDateShort', () => {
  it('"DD.MM.YYYY" (lokal sana, nol bilan)', () => {
    expect(formatDateShort(new Date(2026, 8, 5, 10, 0))).toBe('05.09.2026')
    expect(formatDateShort(new Date(2026, 11, 31, 23, 59))).toBe('31.12.2026')
  })
  it('noto\'g\'ri/bo\'sh qiymat — bo\'sh satr ("Invalid Date" chiqmaydi)', () => {
    expect(formatDateShort('abc')).toBe('')
    expect(formatDateShort(undefined)).toBe('')
  })
})

describe('formatCount', () => {
  it('mingliklar uzilmas probel bilan ajratiladi', () => {
    expect(formatCount(1284)).toBe('1 284')
    expect(formatCount(3940)).toBe('3 940')
    expect(formatCount(1234567)).toBe('1 234 567')
    expect(formatCount(642)).toBe('642')
  })
  it('son bo\'lmasa yoki yo\'q bo\'lsa — "0"; kasr qismi tashlanadi', () => {
    expect(formatCount(undefined)).toBe('0')
    expect(formatCount(null)).toBe('0')
    expect(formatCount('x')).toBe('0')
    expect(formatCount(12.9)).toBe('12')
  })
})
