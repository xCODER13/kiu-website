// config/env.js — server ishga tushishidan oldingi env tekshiruvi. Noto'g'ri deploy
// (JWT_SECRET yo'q, zaif yoki .env.example'dagi namuna bo'lib qolgan) server "muvaffaqiyatli"
// ishga tushib, xavfsiz bo'lmagan tokenlar chiqarishidan oldin darhol to'xtatilishi kerak.
// `exit` in'ektsiya qilinadi, shuning uchun haqiqiy process.exit() chaqirilmaydi.
const fs = require('fs')
const path = require('path')
const { validateEnv } = require('../config/env')

const KEYS = [
  'MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME',
  'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'FRONTEND_URL',
]
const VALID_SECRET = 'a'.repeat(64)

let saved, exit, logger, errorSpy

function setValidEnv() {
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27018/kiu-test'
  process.env.JWT_SECRET = VALID_SECRET
  process.env.ADMIN_USERNAME = 'admin'
  process.env.SUPABASE_URL = 'https://supabase.test'
  process.env.SUPABASE_SERVICE_KEY = 'service-key'
  process.env.BOT_TOKEN = 'bot-token'
  process.env.TELEGRAM_CHAT_ID = '12345'
  process.env.FRONTEND_URL = 'https://kiu.test'
}

// Chiqishdagi barcha console.error matnlarini bitta satrga yig'adi
const printed = () => errorSpy.mock.calls.map(c => c.join(' ')).join('\n')

beforeAll(() => { saved = Object.fromEntries(KEYS.map(k => [k, process.env[k]])) })

beforeEach(() => {
  setValidEnv()
  exit = jest.fn()
  logger = { warn: jest.fn() }
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => { errorSpy.mockRestore() })

afterAll(() => {
  // Boshqa fayllarga (setup.js qiymatlari) ta'sir qilmasligi uchun tiklaymiz
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  }
})

describe('validateEnv — hammasi joyida', () => {
  test("to'liq va to'g'ri sozlamalarda exit chaqirilmaydi, xato ham, ogohlantirish ham chiqmaydi", () => {
    validateEnv(logger, exit)
    expect(exit).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
    expect(logger.warn).not.toHaveBeenCalled()
  })
})

describe('validateEnv — majburiy o\'zgaruvchilar', () => {
  test.each(['MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME'])("%s yo'q bo'lsa exit(1) chaqiriladi va xabarda nomi bor", key => {
    delete process.env[key]
    validateEnv(logger, exit)
    expect(exit).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(1)
    expect(printed()).toContain(key)
    expect(printed()).toContain('[FATAL]')
  })

  test("bo'sh satr ham \"yo'q\" hisoblanadi", () => {
    process.env.JWT_SECRET = ''
    validateEnv(logger, exit)
    expect(exit).toHaveBeenCalledWith(1)
    expect(printed()).toContain('JWT_SECRET')
  })

  test("bir nechta yo'q bo'lsa hammasi bitta xabarda sanab o'tiladi, exit esa faqat bir marta", () => {
    delete process.env.MONGODB_URI
    delete process.env.ADMIN_USERNAME
    validateEnv(logger, exit)
    expect(exit).toHaveBeenCalledTimes(1)
    expect(printed()).toContain('MONGODB_URI')
    expect(printed()).toContain('ADMIN_USERNAME')
  })
})

describe('validateEnv — JWT_SECRET sifati', () => {
  test("31 belgi rad etiladi, 32 belgi qabul qilinadi (chegara)", () => {
    process.env.JWT_SECRET = 'a'.repeat(31)
    validateEnv(logger, exit)
    expect(exit).toHaveBeenCalledWith(1)

    exit.mockClear()
    process.env.JWT_SECRET = 'a'.repeat(32)
    validateEnv(logger, exit)
    expect(exit).not.toHaveBeenCalled()
  })

  test("xato xabarida sirning o'zi chiqmaydi (faqat uzunligi)", () => {
    process.env.JWT_SECRET = 'QisqaSir123'
    validateEnv(logger, exit)
    expect(exit).toHaveBeenCalledWith(1)
    expect(printed()).not.toContain('QisqaSir123')
    expect(printed()).toContain('11')
  })

  test(".env.example'dagi namuna JWT_SECRET rad etiladi (namuna o'zgartirilmasdan nusxalansa)", () => {
    // Fayldan o'qiladi: .env.example'dagi matn o'zgarsa-yu KNOWN_PLACEHOLDERS yangilanmasa, test yiqiladi
    const example = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8')
    const match = example.match(/^JWT_SECRET=(.+)$/m)
    expect(match).not.toBeNull()

    process.env.JWT_SECRET = match[1].trim()
    validateEnv(logger, exit)
    expect(exit).toHaveBeenCalledWith(1)
    expect(printed()).toMatch(/namuna/i)
  })
})

describe('validateEnv — tavsiya etilgan o\'zgaruvchilar', () => {
  test("yo'q bo'lsa server to'xtamaydi, lekin logger.warn bilan ro'yxat chiqadi", () => {
    delete process.env.BOT_TOKEN
    delete process.env.SUPABASE_URL
    validateEnv(logger, exit)

    expect(exit).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn.mock.calls[0][0].missing).toEqual(expect.arrayContaining(['BOT_TOKEN', 'SUPABASE_URL']))
    expect(logger.warn.mock.calls[0][0].missing).not.toContain('JWT_SECRET')
  })

  test("logger berilmasa ham xato bermaydi", () => {
    delete process.env.BOT_TOKEN
    expect(() => validateEnv(undefined, exit)).not.toThrow()
    expect(exit).not.toHaveBeenCalled()
  })
})