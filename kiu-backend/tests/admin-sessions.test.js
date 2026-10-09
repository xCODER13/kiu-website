// adminSessions (5.3): DB'dan o'qish keshi. Mavjud testlar (logout-all, auth-hardening) «baxtli yo'l»ni qoplaydi;
// bu yerda — DB uzilishi, bir vaqtdagi so'rovlar va keshning orqaga ketmasligi. `mongoose` soxta DB bilan almashtiriladi,
// shuning uchun bu fayl haqiqiy Mongo'siz ham ishlaydi (modul har testda toza yuklanadi).
const T0 = new Date('2026-10-09T10:00:00.000Z')

function load(docs, { failFind = false } = {}) {
  const find = jest.fn(() => ({
    toArray: failFind ? () => Promise.reject(new Error('db down')) : async () => docs
  }))
  const updateOne = jest.fn(async () => ({}))
  const db = { collection: () => ({ find, updateOne }) }
  let mod
  let logger
  jest.isolateModules(() => {
    jest.doMock('mongoose', () => ({ connection: { get db() { return db } } }))
    logger = require('../logger')
    jest.spyOn(logger, 'warn').mockImplementation(() => {})
    mod = require('../services/adminSessions')
  })
  return { mod, find, updateOne, logger, setFail: v => { failFind = v } }
}

beforeEach(() => {
  jest.useFakeTimers({ now: T0 })
  delete process.env.ADMIN_PASSWORD_CHANGED_AT
})
afterEach(() => {
  jest.useRealTimers()
  jest.dontMock('mongoose')
  delete process.env.ADMIN_PASSWORD_CHANGED_AT
})

const settingsDocs = (changedAt, validAfter) => [
  ...(changedAt ? [{ key: 'admin_password_changed_at', value: changedAt }] : []),
  ...(validAfter ? [{ key: 'admin_tokens_valid_after', value: validAfter }] : []),
]

describe('getCutoffs — kesh va bir vaqtdagi so\'rovlar', () => {
  test("bir vaqtda kelgan ko'p so'rov bitta DB o'qishini bo'lishadi; TTL ichida qayta o'qilmaydi", async () => {
    const { mod, find } = load(settingsDocs('2026-10-01T00:00:00.000Z', null))
    const results = await Promise.all([mod.getCutoffs(), mod.getCutoffs(), mod.getCutoffs()])
    expect(find).toHaveBeenCalledTimes(1)
    for (const r of results) expect(r.passwordChangedSec).toBe(Math.floor(new Date('2026-10-01T00:00:00.000Z').getTime() / 1000))

    jest.advanceTimersByTime(mod.CACHE_TTL_MS - 1000)
    await mod.getCutoffs()
    expect(find).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(2000) // TTL tugadi
    await mod.getCutoffs()
    expect(find).toHaveBeenCalledTimes(2)
  })

  test("DB uzilsa: xato tashqariga chiqmaydi, oxirgi kesh ishlatiladi, ogohlantirish yoziladi", async () => {
    const fx = load(settingsDocs(null, '2026-10-05T00:00:00.000Z'))
    const before = await fx.mod.getCutoffs()
    expect(before.tokensValidAfterSec).not.toBeNull()

    jest.advanceTimersByTime(fx.mod.CACHE_TTL_MS + 1)
    fx.find.mockImplementation(() => ({ toArray: () => Promise.reject(new Error('db down')) }))

    const during = await fx.mod.getCutoffs()
    expect(during).toEqual(before) // bekor qilish chegarasi yo'qolmadi
    expect(fx.logger.warn).toHaveBeenCalledTimes(1)
  })

  test("DB uzilganda har so'rovda DB'ni urmaydi: qisqa pauza (~5 s) o'tgach qayta urinadi", async () => {
    const fx = load(settingsDocs(null, null))
    await fx.mod.getCutoffs() // birinchi muvaffaqiyatli yuklash
    jest.advanceTimersByTime(fx.mod.CACHE_TTL_MS + 1)
    fx.find.mockClear()
    fx.find.mockImplementation(() => ({ toArray: () => Promise.reject(new Error('db down')) }))

    await fx.mod.getCutoffs()
    expect(fx.find).toHaveBeenCalledTimes(1)
    await fx.mod.getCutoffs()
    await fx.mod.getCutoffs()
    expect(fx.find).toHaveBeenCalledTimes(1) // pauza ichida yangi urinish yo'q

    jest.advanceTimersByTime(6000)
    await fx.mod.getCutoffs()
    expect(fx.find).toHaveBeenCalledTimes(2)
  })

  test("birinchi yuklash ham muvaffaqiyatsiz bo'lsa: chegaralar null (token imzosi baribir tekshiriladi)", async () => {
    const { mod } = load([], { failFind: true })
    await expect(mod.getCutoffs()).resolves.toEqual({ passwordChangedSec: null, tokensValidAfterSec: null })
  })

  test("kesh orqaga ketmaydi: DB'dagi eski qiymat shu instance'dagi yangi logout-all'ni bekor qilmaydi", async () => {
    const fx = load(settingsDocs(null, '2026-10-01T00:00:00.000Z'))
    await fx.mod.getCutoffs()
    await fx.mod.revokeAllTokens() // endi cache = hozirgi vaqt
    const at = Math.floor(T0.getTime() / 1000)
    expect((await fx.mod.getCutoffs()).tokensValidAfterSec).toBe(at)

    jest.advanceTimersByTime(fx.mod.CACHE_TTL_MS + 1) // qayta o'qiladi, DB hamon eski qiymatni beradi
    expect((await fx.mod.getCutoffs()).tokensValidAfterSec).toBeGreaterThanOrEqual(at)
  })
})

describe('getPasswordChangedAt', () => {
  test("env va DB dan KATTASI, ISO satr sifatida", async () => {
    const { mod } = load(settingsDocs('2026-10-01T00:00:00.000Z', null))
    process.env.ADMIN_PASSWORD_CHANGED_AT = '2026-10-03T00:00:00.000Z'
    await expect(mod.getPasswordChangedAt()).resolves.toBe('2026-10-03T00:00:00.000Z')

    process.env.ADMIN_PASSWORD_CHANGED_AT = '2026-09-01T00:00:00.000Z' // env eskiroq
    await expect(mod.getPasswordChangedAt()).resolves.toBe('2026-10-01T00:00:00.000Z')
  })

  test("hech biri yo'q yoki env yaroqsiz bo'lsa: null / DB qiymati", async () => {
    const empty = load([])
    await expect(empty.mod.getPasswordChangedAt()).resolves.toBeNull()

    const withDb = load(settingsDocs('2026-10-01T00:00:00.000Z', null))
    process.env.ADMIN_PASSWORD_CHANGED_AT = 'bu sana emas'
    await expect(withDb.mod.getPasswordChangedAt()).resolves.toBe('2026-10-01T00:00:00.000Z')
  })
})
