import { describe, it, expect } from 'vitest'
import { extractYouTubeShortsId, parseImages, markBroken, formatDateShort, formatCount, parseEventDate, eventDateKey, formatEventDate, eventTile, todayKey, isPastEvent, formatDateLong } from './helpers'

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

describe('tadbir sanasi (6.25)', () => {
  it("ISO va «YYYY-MM-DD» — kalendar sana satr sifatida o'qiladi (vaqt mintaqasi kunni siljitmaydi)", () => {
    expect(parseEventDate('2026-10-15T00:00:00.000Z')).toEqual({ y: 2026, m: 10, d: 15 })
    expect(parseEventDate('2026-01-01')).toEqual({ y: 2026, m: 1, d: 1 })
    expect(eventDateKey('2026-10-15T00:00:00.000Z')).toBe('2026-10-15')
    expect(eventDateKey('2026-01-05')).toBe('2026-01-05')
  })
  it("noto'g'ri qiymat — bo'sh natija (sahifa «Invalid Date»/NaN ko'rsatmaydi)", () => {
    for (const v of [undefined, null, '', 'abc', '2026-13-01', '2026-00-10', '2026-05-00', '2026-05-32', 20260101]) {
      expect(parseEventDate(v), String(v)).toBeNull()
      expect(eventDateKey(v)).toBe('')
      expect(formatEventDate(v)).toBe('')
      expect(eventTile(v)).toEqual({ day: '', month: '' })
    }
  })
  it('formatEventDate — yil bilan; eventTile — kun va 3 harfli oy (har oy o\'z qisqartmasi: iyun ≠ iyul)', () => {
    expect(formatEventDate('2026-10-15T00:00:00.000Z')).toBe('15 oktyabr 2026')
    expect(formatEventDate('2025-03-02')).toBe('2 mart 2025')
    const months = Array.from({ length: 12 }, (_, i) => eventTile(`2026-${String(i + 1).padStart(2, '0')}-09`).month)
    expect(months).toEqual(['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK'])
    expect(eventTile('2026-10-05T00:00:00.000Z')).toEqual({ day: '5', month: 'OKT' })
  })
  it('todayKey — MAHALLIY sana (UTC emas); isPastEvent — bugun hali o\'tmagan, kecha o\'tgan, sanasiz — o\'tgan', () => {
    expect(todayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(todayKey(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31')
    expect(isPastEvent('2026-10-08T00:00:00.000Z', '2026-10-08')).toBe(false)
    expect(isPastEvent('2026-10-07', '2026-10-08')).toBe(true)
    expect(isPastEvent('2026-10-09', '2026-10-08')).toBe(false)
    expect(isPastEvent(undefined, '2026-10-08')).toBe(true)
  })
})

describe('formatDateLong (6.26 — albom qo\'shilgan sana)', () => {
  it('vaqt tamg\'asi → «12 sentyabr 2026» (adminning mahalliy kuni); oy nomi to\'liq, yil bor', () => {
    expect(formatDateLong(new Date(2026, 8, 12, 10, 0))).toBe('12 sentyabr 2026')
    expect(formatDateLong(new Date(2026, 0, 2, 23, 59))).toBe('2 yanvar 2026')
    expect(formatDateLong(new Date(2025, 11, 31, 0, 1))).toBe('31 dekabr 2025')
  })

  it('ISO satr ham ishlaydi; noto\'g\'ri / bo\'sh qiymat — \'\'', () => {
    expect(formatDateLong('2026-03-05T12:00:00Z')).toMatch(/^\d{1,2} mart 2026$/)
    expect(formatDateLong('')).toBe('')
    expect(formatDateLong(undefined)).toBe('')
    expect(formatDateLong('mavjud emas')).toBe('')
  })
})
