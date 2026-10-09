// adminSessions (5.3): DB'dan o'qish keshi. Mavjud testlar (logout-all, auth-hardening) «baxtli yo'l»ni qoplaydi;
// bu yerda — DB uzilishi, bir vaqtdagi so'rovlar va keshning orqaga ketmasligi. `mongoose` soxta DB bilan almashtiriladi,
// shuning uchun bu fayl haqiqiy Mongo'siz ham ishlaydi (modul har testda toza yuklanadi).
//
// DIQQAT (CI'da shu sabab yiqilgan): jest fake timers ISHLATILMAYDI, soat `Date.now` ni almashtirish bilan boshqariladi va
// HAR TEST O'ZIDA tiklanadi. tests/setup.js ning afterEach'i (u doim OLDIN ishlaydi) haqiqiy Mongo drayveri bilan ishlaydi —
// fake timers ostida u 60 s osilib qoladi. Xuddi shu sabab soxta `mongoose` ham test oxirida (finally) qaytariladi.
const T0 = new Date('2026-10-09T10:00:00.000Z').getTime()
const sec = iso => Math.floor(new Date(iso).getTime() / 1000)

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
  return { mod, find, updateOne, logger }
}

const failingFind = () => ({ toArray: () => Promise.reject(new Error('db down')) })

// Soat qo'lda suriladi: clock.now += ms. Test tugagach hamma narsa tiklanadi.
function clockTest(name, fn) {
  test(name, async () => {
    const clock = { now: T0 }
    const spy = jest.spyOn(Date, 'now').mockImplementation(() => clock.now)
    delete process.env.ADMIN_PASSWORD_CHANGED_AT
    try {
      await fn(clock)
    } finally {
      spy.mockRestore()
      jest.dontMock('mongoose')
      delete process.env.ADMIN_PASSWORD_CHANGED_AT
    }
  })
}

const settingsDocs = (changedAt, validAfter) => [
  ...(changedAt ? [{ key: 'admin_password_changed_at', value: changedAt }] : []),
  ...(validAfter ? [{ key: 'admin_tokens_valid_after', value: validAfter }] : []),
]

describe('getCutoffs — kesh va bir vaqtdagi so\'rovlar', () => {
  clockTest("bir vaqtda kelgan ko'p so'rov bitta DB o'qishini bo'lishadi; TTL ichida qayta o'qilmaydi", async clock => {
    const { mod, find } = load(settingsDocs('2026-10-01T00:00:00.000Z', null))
    const results = await Promise.all([mod.getCutoffs(), mod.getCutoffs(), mod.getCutoffs()])
    expect(find).toHaveBeenCalledTimes(1)
    for (const r of results) expect(r.passwordChangedSec).toBe(sec('2026-10-01T00:00:00.000Z'))

    clock.now += mod.CACHE_TTL_MS - 1000
    await mod.getCutoffs()
    expect(find).toHaveBeenCalledTimes(1)

    clock.now += 2000 // TTL tugadi
    await mod.getCutoffs()
    expect(find).toHaveBeenCalledTimes(2)
  })

  clockTest("DB uzilsa: xato tashqariga chiqmaydi, oxirgi kesh ishlatiladi, ogohlantirish yoziladi", async clock => {
    const fx = load(settingsDocs(null, '2026-10-05T00:00:00.000Z'))
    const before = await fx.mod.getCutoffs()
    expect(before.tokensValidAfterSec).toBe(sec('2026-10-05T00:00:00.000Z'))

    clock.now += fx.mod.CACHE_TTL_MS + 1
    fx.find.mockImplementation(failingFind)

    const during = await fx.mod.getCutoffs()
    expect(during).toEqual(before) // bekor qilish chegarasi yo'qolmadi
    expect(fx.logger.warn).toHaveBeenCalledTimes(1)
  })

  clockTest("DB uzilganda har so'rovda DB'ni urmaydi: qisqa pauza (~5 s) o'tgach qayta urinadi", async clock => {
    const fx = load(settingsDocs(null, null))
    await fx.mod.getCutoffs() // birinchi muvaffaqiyatli yuklash
    clock.now += fx.mod.CACHE_TTL_MS + 1
    fx.find.mockClear()
    fx.find.mockImplementation(failingFind)

    await fx.mod.getCutoffs()
    expect(fx.find).toHaveBeenCalledTimes(1)
    await fx.mod.getCutoffs()
    await fx.mod.getCutoffs()
    expect(fx.find).toHaveBeenCalledTimes(1) // pauza ichida yangi urinish yo'q

    clock.now += 6000
    await fx.mod.getCutoffs()
    expect(fx.find).toHaveBeenCalledTimes(2)
  })

  clockTest("birinchi yuklash ham muvaffaqiyatsiz bo'lsa: chegaralar null (token imzosi baribir tekshiriladi)", async () => {
    const { mod } = load([], { failFind: true })
    await expect(mod.getCutoffs()).resolves.toEqual({ passwordChangedSec: null, tokensValidAfterSec: null })
  })

  clockTest("kesh orqaga ketmaydi: DB'dagi eski qiymat shu instance'dagi yangi logout-all'ni bekor qilmaydi", async clock => {
    const fx = load(settingsDocs(null, '2026-10-01T00:00:00.000Z'))
    await fx.mod.getCutoffs()
    const at = sec(await fx.mod.revokeAllTokens()) // endi cache = hozirgi vaqt
    expect(at).toBeGreaterThan(sec('2026-10-01T00:00:00.000Z'))
    expect((await fx.mod.getCutoffs()).tokensValidAfterSec).toBe(at)

    clock.now += fx.mod.CACHE_TTL_MS + 1 // qayta o'qiladi, DB hamon eski qiymatni beradi
    expect((await fx.mod.getCutoffs()).tokensValidAfterSec).toBe(at)
    expect(fx.find).toHaveBeenCalledTimes(2)
  })
})

describe('getPasswordChangedAt', () => {
  clockTest("env va DB dan KATTASI, ISO satr sifatida", async () => {
    const { mod } = load(settingsDocs('2026-10-01T00:00:00.000Z', null))
    process.env.ADMIN_PASSWORD_CHANGED_AT = '2026-10-03T00:00:00.000Z'
    await expect(mod.getPasswordChangedAt()).resolves.toBe('2026-10-03T00:00:00.000Z')

    process.env.ADMIN_PASSWORD_CHANGED_AT = '2026-09-01T00:00:00.000Z' // env eskiroq
    await expect(mod.getPasswordChangedAt()).resolves.toBe('2026-10-01T00:00:00.000Z')
  })

  clockTest("hech biri yo'q yoki env yaroqsiz bo'lsa: null / DB qiymati", async () => {
    const empty = load([])
    await expect(empty.mod.getPasswordChangedAt()).resolves.toBeNull()

    const withDb = load(settingsDocs('2026-10-01T00:00:00.000Z', null))
    process.env.ADMIN_PASSWORD_CHANGED_AT = 'bu sana emas'
    await expect(withDb.mod.getPasswordChangedAt()).resolves.toBe('2026-10-01T00:00:00.000Z')
  })
})
