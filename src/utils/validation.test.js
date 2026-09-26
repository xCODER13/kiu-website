import { describe, it, expect } from 'vitest'
import { validateFullName, validatePhone, validateEmail, validateRequired, errorBorder } from './validation'

describe('validateFullName', () => {
  it.each(['Ali Valiyev', 'Ali  Valiyev', '  Ali Valiyev  ', 'Олим Каримов', "Ali O'g'li Aka", 'Anna-Maria Ivanova', 'Ali Valiyev Karimovich'])(
    'to\'g\'ri: %j', v => expect(validateFullName(v)).toBeNull())

  it.each([null, undefined, '', '   '])('bo\'sh: %j', v => expect(validateFullName(v)).toBe('Bu maydon majburiy'))

  it('raqam va belgilarni rad etadi', () => {
    expect(validateFullName('Ali Valiyev2')).toMatch(/harflardan/)
    expect(validateFullName('Ali <b>Vali</b>')).toMatch(/harflardan/)
    expect(validateFullName('Ali; DROP')).toMatch(/harflardan/)
  })
  it('bitta so\'z — rad', () => expect(validateFullName('Ali')).toMatch(/to'liq/))
  it('1 harfli so\'z — rad', () => expect(validateFullName('Ali V')).toMatch(/kamida 2/))
})

describe('validateFullName — o\'zbek apostrofi', () => {
  it.each(['Gʻayrat Karimov', 'Ali Oʻktam', 'Sherzod Toʼraev', 'Ali Oʹktam', 'Ali O‘ktam'])(
    '%j — o\'zbek apostrof variantlari qabul qilinadi', v => {
      expect(validateFullName(v)).toBeNull()
    })
  it('apostrof xavfsizligi: HTML/skript belgilari baribir rad etiladi', () => {
    expect(validateFullName('Ali <script>')).toMatch(/harflardan/)
    expect(validateFullName('Ali "Vali"')).toMatch(/harflardan/)
  })
})

describe('validatePhone', () => {
  it.each(['+998 90 123 45 67', '998901234567', '901234567', '90-123-45-67', '(90) 123 45 67'])(
    'to\'g\'ri: %j', v => expect(validatePhone(v)).toBeNull())
  it.each([null, undefined, '', 'abc'])('bo\'sh: %j', v => expect(validatePhone(v)).toBe('Bu maydon majburiy'))
  it.each(['12345', '+998 90 123 45', '+1 202 555 0143', '99890123456789'])(
    'noto\'g\'ri: %j', v => expect(validatePhone(v)).toMatch(/noto'g'ri/))
})

describe('validateEmail', () => {
  it.each(['a@b.co', 'ali.valiyev@kiu.uz', '  a@b.co  '])('to\'g\'ri: %j', v => expect(validateEmail(v)).toBeNull())
  it.each([null, '', '   '])('bo\'sh: %j', v => expect(validateEmail(v)).toBe('Bu maydon majburiy'))
  it.each(['abc', 'a@b', '@b.co', 'a b@c.co', 'a@@b.co'])('noto\'g\'ri: %j', v => expect(validateEmail(v)).toMatch(/noto'g'ri/))
})

describe('validateRequired', () => {
  it('bo\'sh — label bilan xabar', () => {
    expect(validateRequired('', 'Fakultet')).toBe('Fakultet majburiy')
    expect(validateRequired('   ')).toBe('Bu maydon majburiy')
    expect(validateRequired(null)).toBe('Bu maydon majburiy')
  })
  it('qiymat bor — null', () => {
    expect(validateRequired('x')).toBeNull()
    expect(validateRequired(5)).toBeNull()
  })
  it('0 raqami "bo\'sh" hisoblanmaydi', () => {
    expect(validateRequired(0)).toBeNull()
    expect(validateRequired(false)).toBeNull()
  })
  it('undefined bo\'sh hisoblanadi', () => expect(validateRequired(undefined, 'Yosh')).toBe('Yosh majburiy'))
})

describe('errorBorder', () => {
  it('xato bo\'lsa qizil ramka qo\'shadi, asl obyektni o\'zgartirmaydi', () => {
    const base = { padding: 4 }
    expect(errorBorder(true, base)).toEqual({ padding: 4, borderColor: '#dc2626' })
    expect(base).toEqual({ padding: 4 })
  })
  it('xato yo\'q — o\'sha obyekt', () => {
    const base = { padding: 4 }
    expect(errorBorder(false, base)).toBe(base)
  })
})
