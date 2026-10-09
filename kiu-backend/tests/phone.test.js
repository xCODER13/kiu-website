// utils/phone.js — normallashtirish va maskalash (4.3). Sof funksiyalar, DB kerak emas.
const { normalizeUzPhone, maskPhone } = require('../utils/phone')

describe('normalizeUzPhone', () => {
  test.each([
    ['+998901234567', '998901234567'],
    ['998901234567', '998901234567'],
    ['90 123 45 67', '998901234567'],
    ['+998 (90) 123-45-67', '998901234567'],
    [998901234567, '998901234567'], // JSON'da son sifatida kelishi mumkin
  ])('%p → %p', (input, expected) => {
    expect(normalizeUzPhone(input)).toBe(expected)
  })

  test.each([[''], ['abc'], ['12345'], ['+9989012345678'], ['+99890123456'], [null], [undefined], [{}], [['998901234567']]])(
    'yaroqsiz %p → null', input => {
      expect(normalizeUzPhone(input)).toBeNull()
    }
  )
})

describe('maskPhone', () => {
  test.each(['+998901234567', '90 123 45 67', '998-90-123-45-67'])('yaroqli raqam (%s): operator kodi va oxirgi 2 raqam qoladi', input => {
    expect(maskPhone(input)).toBe('+998 90 *** ** 67')
  })

  test("yaroqsiz qiymatda ham to'liq raqam qaytmaydi", () => {
    expect(maskPhone('12345678')).toBe('***78')
    expect(maskPhone('12345')).toBe('***')
    expect(maskPhone('&<>')).toBe('***')
    expect(maskPhone(undefined)).toBe('***')
    expect(maskPhone(null)).toBe('***')
    expect(maskPhone({ a: 1 })).toBe('***')
  })

  test("maskalangan qiymatda raqamning o'rta qismi yo'q", () => {
    const masked = maskPhone('+998901234567')
    expect(masked).not.toContain('1234')
    expect(masked).not.toContain('901234567')
  })
})
