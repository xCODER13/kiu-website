import { describe, it, expect } from 'vitest'
import { extractYouTubeShortsId, parseImages, markBroken, formatDateShort, formatCount, parseEventDate, eventDateKey, formatEventDate, eventTile, todayKey, isPastEvent, formatDateLong, initialsOf, decodeJwtPayload, formatDateTimeShort, formatTimeLeft, formatTimeAgo, formatCountdown, rateLimitInfo, byteLength, passwordStrength, STRENGTH_LABELS } from './helpers'

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

describe("initialsOf (6.27 — O'qituvchilar avatari)", () => {
  it("`avatar` maydoni bor bo'lsa shu (o'zgartirilmaydi); bo'sh bo'lsa — ismning birinchi 2 harfi, katta harfda", () => {
    expect(initialsOf({ avatar: 'bk', name: 'Bek' })).toBe('bk')
    expect(initialsOf({ avatar: '', name: 'zokir aliyev' })).toBe('ZO')
    expect(initialsOf({ name: 'Karimov Ali' })).toBe('KA')
  })

  it("ism ham bo'lmasa — bo'sh satr (qulamaydi)", () => {
    expect(initialsOf({})).toBe('')
    expect(initialsOf({ avatar: '', name: null })).toBe('')
  })
})

describe('Profil yordamchilari (6.28)', () => {
  const b64 = o => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  it('decodeJwtPayload — payload ni o\'qiydi (base64url); buzuq token → null', () => {
    const t = `h.${b64({ username: 'admin', exp: 1900000000 })}.s`
    expect(decodeJwtPayload(t)).toEqual({ username: 'admin', exp: 1900000000 })
    for (const bad of [null, '', 'abc', 'a.b.c', 'a.!!!.c']) expect(decodeJwtPayload(bad)).toBeNull()
  })

  it('formatDateTimeShort — «9-okt 2026, 14:20»', () => {
    const d = new Date(2026, 9, 9, 14, 20).getTime()
    expect(formatDateTimeShort(d)).toBe('9-okt 2026, 14:20')
  })

  it('formatTimeLeft — daqiqa / soat / kun; o\'tgan bo\'lsa «muddati tugagan»', () => {
    const M = 60000
    expect(formatTimeLeft(5 * M)).toBe("5 daqiqadan so'ng")
    expect(formatTimeLeft(3 * 60 * M)).toBe("3 soatdan so'ng")
    expect(formatTimeLeft(7 * 24 * 60 * M)).toBe("7 kundan so'ng")
    expect(formatTimeLeft(0)).toBe('muddati tugagan')
    expect(formatTimeLeft(-1000)).toBe('muddati tugagan')
  })

  it('byteLength — UTF-8 bayt (bcrypt 72 bayt chegarasi uchun)', () => {
    expect(byteLength('abc')).toBe(3)
    expect(byteLength('я'.repeat(37))).toBe(74)
    expect(byteLength('')).toBe(0)
  })

  it('passwordStrength — 0 (bo\'sh) … 4; yorliqlar', () => {
    expect(passwordStrength('')).toBe(0)
    expect(passwordStrength('1234567')).toBe(1)
    expect(passwordStrength('abcdefgh')).toBe(2)
    expect(passwordStrength('abcdefg123')).toBe(3)
    expect(passwordStrength('Kuz-Qarshi-2026!')).toBe(4)
    expect(STRENGTH_LABELS).toEqual({ 1: 'Juda zaif', 2: 'Zaif', 3: 'Yaxshi', 4: 'Kuchli' })
  })
})

describe('formatTimeAgo / formatCountdown / rateLimitInfo (Profil)', () => {
  const M = 60000
  it('formatTimeAgo — hozirgina / daqiqa / soat / kun; kelajak va noto\'g\'ri qiymat — bo\'sh', () => {
    expect(formatTimeAgo(0)).toBe('hozirgina')
    expect(formatTimeAgo(59 * 1000)).toBe('hozirgina')
    expect(formatTimeAgo(5 * M)).toBe('5 daqiqa oldin')
    expect(formatTimeAgo(3 * 60 * M)).toBe('3 soat oldin')
    expect(formatTimeAgo(20 * 24 * 60 * M)).toBe('20 kun oldin')
    expect(formatTimeAgo(-1)).toBe('')
    expect(formatTimeAgo(NaN)).toBe('')
    expect(formatTimeAgo(undefined)).toBe('')
  })

  it("formatCountdown — m:ss, soatdan oshsa h:mm:ss; manfiy va noto'g'ri qiymat — 0:00", () => {
    expect(formatCountdown(872)).toBe('14:32')
    expect(formatCountdown(59)).toBe('0:59')
    expect(formatCountdown(60)).toBe('1:00')
    expect(formatCountdown(900)).toBe('15:00')
    expect(formatCountdown(3905)).toBe('1:05:05')
    expect(formatCountdown(0.2)).toBe('0:01') // yuqoriga yaxlitlanadi: 0:00 da qulf hali ochilmagan
    expect(formatCountdown(-5)).toBe('0:00')
    expect(formatCountdown(NaN)).toBe('0:00')
  })

  it('rateLimitInfo — sarlavhalarni o\'qiydi; Retry-After RateLimit-Reset dan ustun; yo\'q/noto\'g\'ri — null', () => {
    const res = h => ({ headers: new Headers(h) })
    expect(rateLimitInfo(res({ 'RateLimit-Remaining': '3', 'RateLimit-Reset': '120' }))).toEqual({ remaining: 3, resetSec: 120 })
    expect(rateLimitInfo(res({ 'Retry-After': '30', 'RateLimit-Reset': '120' }))).toEqual({ remaining: null, resetSec: 30 })
    expect(rateLimitInfo(res({}))).toEqual({ remaining: null, resetSec: null })
    expect(rateLimitInfo(res({ 'RateLimit-Remaining': 'x', 'Retry-After': 'Wed, 21 Oct 2026 07:28:00 GMT', 'RateLimit-Reset': '' }))).toEqual({ remaining: null, resetSec: null })
    expect(rateLimitInfo(res({ 'RateLimit-Remaining': '-1' }))).toEqual({ remaining: null, resetSec: null })
    expect(rateLimitInfo({})).toEqual({ remaining: null, resetSec: null }) // headers yo'q (eski mock / g'alati javob)
    expect(rateLimitInfo(undefined)).toEqual({ remaining: null, resetSec: null })
  })
})
