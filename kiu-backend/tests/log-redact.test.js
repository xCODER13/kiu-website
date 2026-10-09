// Log'dagi xato obyektlaridan foydalanuvchi qiymatlari (telefon, ism) yashiriladi (4.3).
// Mongoose ValidationError/CastError `errors.<maydon>.value` va `value` ichida kiritilgan
// ma'lumotni to'liq saqlaydi, `fail()` esa `{ err }` ni log qiladi — redact bo'lmasa PII log'ga tushadi.
// logger.js aynan shu ro'yxatni (logRedact.js) ishlatadi; xato matni (message/stack) ichidagi qiymatlarni
// esa utils/safeError.js tozalaydi (redact ularga yetmaydi). DB talab qilinmaydi (validateSync).
const pino = require('pino')
const { Writable } = require('stream')
const { REDACT_PATHS, CENSOR } = require('../logRedact')
const Application = require('../models/Application')
const { sanitizeError } = require('../utils/safeError')
const { fail, globalErrorHandler } = require('../middleware/errorHandler')

function captureLogger(redact) {
  const chunks = []
  const stream = new Writable({ write(chunk, _enc, cb) { chunks.push(chunk.toString()); cb() } })
  const log = pino(redact ? { redact: { paths: REDACT_PATHS, censor: CENSOR } } : {}, stream)
  return { log, output: () => chunks.join('') }
}

const PHONE = '+99890-secret-phone'

describe('log redact', () => {
  test("nazorat: redact'siz logger telefonni chiqarib yuboradi (test mazmunli ekanini isbotlaydi)", () => {
    const err = new Application({ name: 'Ali', phone: PHONE }).validateSync()
    expect(err).toBeDefined()
    const { log, output } = captureLogger(false)
    log.error({ err }, 'x')
    expect(output()).toContain(PHONE)
  })

  test("ValidationError: kiritilgan telefon log'ga tushmaydi", () => {
    const err = new Application({ name: 'Ali', phone: PHONE }).validateSync()
    const { log, output } = captureLogger(true)
    log.error({ err }, 'x')
    expect(output()).not.toContain(PHONE)
    expect(output()).toContain(CENSOR)
  })

  test("xato obyektining o'zi o'zgarmaydi (redact vaqtincha, asl qiymat saqlanadi)", () => {
    const err = new Application({ name: 'Ali', phone: PHONE }).validateSync()
    const { log } = captureLogger(true)
    log.error({ err }, 'x')
    expect(err.errors.phone.value).toBe(PHONE)
  })

  test("Authorization va cookie headerlari avvalgidek yashiriladi", () => {
    const { log, output } = captureLogger(true)
    log.info({ req: { headers: { authorization: 'Bearer sirli.token', cookie: 'sid=1' } } }, 'x')
    expect(output()).not.toContain('sirli.token')
    expect(output()).not.toContain('sid=1')
  })
})

describe('sanitizeError', () => {
  test("CastError: qiymat message/stack/value'da yo'q, faqat tur va maydon nomi qoladi", () => {
    const err = new Application({ name: { x: 'Maxfiy Ism' }, phone: '+998901234567' }).validateSync()
    const clean = sanitizeError(err)
    expect(JSON.stringify(clean)).not.toContain('Maxfiy Ism')
    expect(clean).toEqual({ type: 'ValidationError', fields: { name: 'string' } })
  })

  test('ValidationError: maydon nomi va turi saqlanadi (nosozlikni topish uchun)', () => {
    const err = new Application({ name: 'Ali', phone: PHONE }).validateSync()
    const clean = sanitizeError(err)
    expect(clean.fields.phone).toBe('user defined')
    expect(JSON.stringify(clean)).not.toContain(PHONE)
  })

  test("JSON parse xatosi: xom body (parol bo'lishi mumkin) log'ga o'tmaydi", () => {
    const err = Object.assign(new SyntaxError('Unexpected token, "{\\"password\\":\\"sirli123" is not valid JSON'), {
      type: 'entity.parse.failed', status: 400, body: '{"password":"sirli123',
    })
    const clean = sanitizeError(err)
    expect(clean).toEqual({ type: 'entity.parse.failed', status: 400 })
    expect(JSON.stringify(clean)).not.toContain('sirli123')
  })

  test("boshqa xatolar o'zgarishsiz qaytadi (stack kerak), primitiv/null ham yiqilmaydi", () => {
    const err = new Error('boom')
    expect(sanitizeError(err)).toBe(err)
    expect(sanitizeError(null)).toBeNull()
    expect(sanitizeError('x')).toBe('x')
  })

  test("fail() va globalErrorHandler log'ga tozalangan xato yozadi", () => {
    const err = new Application({ name: { x: 'Maxfiy Ism' }, phone: PHONE }).validateSync()
    const req = { method: 'POST', originalUrl: '/api/applications', log: { error: jest.fn() } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }

    fail(req, res, 400, err)
    globalErrorHandler(err, req, res, () => {})

    expect(req.log.error).toHaveBeenCalledTimes(2)
    for (const [fields] of req.log.error.mock.calls) {
      expect(JSON.stringify(fields)).not.toContain('Maxfiy Ism')
      expect(JSON.stringify(fields)).not.toContain(PHONE)
    }
  })
})
