// Kichik util va servislardagi qoplanmagan shoxlar (5.3): sahifalash, xato tozalash, parol siyosati,
// Telegram escape, ko'rishlarni sanash. Hammasi sof birliklar — DB kerak emas.
const { applyPagination, parsePage } = require('../utils/pagination')
const { sanitizeError } = require('../utils/safeError')
const { passwordProblem } = require('../utils/passwordPolicy')
const { escapeTelegramHtml } = require('../services/telegram')
const ViewLog = require('../models/ViewLog')
const { shouldCountView } = require('../services/viewDedupe')

describe('applyPagination', () => {
  const query = () => { const q = { skip: jest.fn(() => q), limit: jest.fn(() => q) }; return q }

  test("?limit yo'q -> so'rov o'zgarishsiz (orqaga moslik)", () => {
    const q = query()
    expect(applyPagination(q, {})).toBe(q)
    expect(applyPagination(q)).toBe(q)
    expect(q.skip).not.toHaveBeenCalled()
  })

  test.each([
    [{ limit: '10', page: '3' }, 20, 10],
    [{ limit: 'abc' }, 0, 20], // yaroqsiz -> standart 20
    [{ limit: '1000' }, 0, 100], // yuqori chegara
    [{ limit: '0.5x', page: '-5' }, 0, 20], // manfiy sahifa -> 1
    [{ limit: '5', page: 'xyz' }, 0, 5],
  ])('%j -> skip %i, limit %i', (params, skip, limit) => {
    const q = query()
    applyPagination(q, params)
    expect(q.skip).toHaveBeenCalledWith(skip)
    expect(q.limit).toHaveBeenCalledWith(limit)
  })
})

describe('parsePage', () => {
  test('standart qiymatlar va chegaralar', () => {
    expect(parsePage()).toEqual({ page: 1, limit: 20, skip: 0 })
    expect(parsePage({ page: '2', limit: '30' }, { max: 50 })).toEqual({ page: 2, limit: 30, skip: 30 })
    expect(parsePage({ limit: '500' }, { max: 50 }).limit).toBe(50)
    expect(parsePage({ limit: '-3', page: '0' })).toEqual({ page: 1, limit: 1, skip: 0 })
    expect(parsePage({ limit: 'x' }, { defaultLimit: 15 }).limit).toBe(15)
  })
})

describe('sanitizeError', () => {
  test("ValidationError: faqat maydon nomi va turi, kiritilgan qiymat yo'q", () => {
    const e = { name: 'ValidationError', message: 'qiymat: Maxfiy', errors: { a: { kind: 'required', value: 'Maxfiy' }, b: { name: 'CastError' }, c: {} } }
    const out = sanitizeError(e)
    expect(out).toEqual({ type: 'ValidationError', fields: { a: 'required', b: 'CastError', c: 'invalid' } })
    expect(JSON.stringify(out)).not.toContain('Maxfiy')
  })

  test('CastError va body-parser xatolari: faqat tur', () => {
    expect(sanitizeError({ name: 'CastError', path: '_id', kind: 'ObjectId', value: 'Maxfiy', message: 'Maxfiy' })).toEqual({ type: 'CastError', path: '_id', kind: 'ObjectId' })
    expect(sanitizeError({ type: 'entity.parse.failed', status: 400, body: 'Maxfiy' })).toEqual({ type: 'entity.parse.failed', status: 400 })
    expect(sanitizeError({ type: 'entity.too.large', status: 413, body: 'Maxfiy' })).toEqual({ type: 'entity.too.large', status: 413 })
  })

  test("boshqa xatolar o'zgarishsiz (stack kerak); primitivlar ham", () => {
    const err = new Error('oddiy')
    expect(sanitizeError(err)).toBe(err)
    expect(sanitizeError(null)).toBeNull()
    expect(sanitizeError('matn')).toBe('matn')
  })
})

describe('passwordProblem', () => {
  test('keng tarqalgan parol (registrdan qat\'i nazar) rad etiladi', () => {
    expect(passwordProblem('PASSWORD', 'admin')).toMatch(/keng tarqalgan/)
  })

  test("login parol ichida bo'lsa rad etiladi; qisqa (<3) yoki satr bo'lmagan login e'tiborsiz", () => {
    expect(passwordProblem('mening-Boss-parolim', 'BOSS')).toMatch(/loginni/)
    expect(passwordProblem('abra-kadabra-77', 'ab')).toBeNull()
    expect(passwordProblem('abra-kadabra-77', undefined)).toBeNull()
    expect(passwordProblem('abra-kadabra-77', 12345)).toBeNull()
  })
})

describe('escapeTelegramHtml', () => {
  test("null/undefined -> bo'sh satr; son satrga; & birinchi escape qilinadi (ikki marta emas)", () => {
    expect(escapeTelegramHtml(null)).toBe('')
    expect(escapeTelegramHtml(undefined)).toBe('')
    expect(escapeTelegramHtml(42)).toBe('42')
    expect(escapeTelegramHtml('<b>&</b>')).toBe('&lt;b&gt;&amp;&lt;/b&gt;')
  })
})

describe('shouldCountView — jurnal yozilmasa ko\'rish yo\'qolmaydi', () => {
  const req = () => ({ ip: '203.0.113.7', log: { warn: jest.fn() } })
  afterEach(() => jest.restoreAllMocks())

  test('DB nosozligi (11000 emas): sanaydi va ogohlantiradi, xato matnini emas, faqat nom/kodni yozadi', async () => {
    jest.spyOn(ViewLog, 'create').mockRejectedValue(Object.assign(new Error('Maxfiy ulanish'), { name: 'MongoNetworkError', code: 6 }))
    const r = req()
    await expect(shouldCountView(r, 'news', 'a'.repeat(24))).resolves.toBe(true)
    expect(r.log.warn).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(r.log.warn.mock.calls[0])).not.toContain('Maxfiy')
  })

  test('takroriy ko\'rish (11000): sanalmaydi, ogohlantirish yo\'q', async () => {
    jest.spyOn(ViewLog, 'create').mockRejectedValue(Object.assign(new Error('dup'), { code: 11000 }))
    const r = req()
    await expect(shouldCountView(r, 'news', 'a'.repeat(24))).resolves.toBe(false)
    expect(r.log.warn).not.toHaveBeenCalled()
  })
})
