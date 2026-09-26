// config/db.js — server ishga tushganda MongoDB'ga ulanadi va admin parol hash'ini
// (hamda parol o'zgargan vaqtni) `settings` kolleksiyasidan process.env'ga yuklaydi.
// Testlarda Mongoose allaqachon (setup.js orqali) shu URI'ga ulangan, shuning uchun
// connectDB() ni chaqirish xavfsiz (bir xil URI — yangi ulanish ochilmaydi).
const mongoose = require('mongoose')
const logger = require('../logger')
const { connectDB } = require('../config/db')

const settings = () => mongoose.connection.db.collection('settings')
const setSetting = (key, value) => settings().updateOne({ key }, { $set: { value } }, { upsert: true })

let infoSpy

beforeEach(() => {
  delete process.env.ADMIN_PASSWORD_HASH
  delete process.env.ADMIN_PASSWORD_CHANGED_AT
  infoSpy = jest.spyOn(logger, 'info')
})

afterEach(() => { infoSpy.mockRestore() })

describe('connectDB — settings yuklash', () => {
  test("DB'dagi parol hash'i va o'zgargan vaqt process.env'ga yuklanadi", async () => {
    await setSetting('admin_password_hash', '$2a$12$hash-from-db')
    await setSetting('admin_password_changed_at', '2026-01-01T00:00:00.000Z')

    await connectDB()

    expect(process.env.ADMIN_PASSWORD_HASH).toBe('$2a$12$hash-from-db')
    expect(process.env.ADMIN_PASSWORD_CHANGED_AT).toBe('2026-01-01T00:00:00.000Z')
  })

  test("faqat hash bor bo'lsa: ADMIN_PASSWORD_CHANGED_AT o'rnatilmaydi", async () => {
    await setSetting('admin_password_hash', '$2a$12$only-hash')

    await connectDB()

    expect(process.env.ADMIN_PASSWORD_HASH).toBe('$2a$12$only-hash')
    expect(process.env.ADMIN_PASSWORD_CHANGED_AT).toBeUndefined()
  })

  test("DB'da settings bo'lmasa: env'dagi mavjud qiymat (masalan .env'dan) o'zgarmaydi", async () => {
    process.env.ADMIN_PASSWORD_HASH = '$2a$12$from-env'

    await connectDB()

    expect(process.env.ADMIN_PASSWORD_HASH).toBe('$2a$12$from-env')
    expect(process.env.ADMIN_PASSWORD_CHANGED_AT).toBeUndefined()
  })

  test("DB'dagi qiymat env'dagidan ustun (parol Admin paneldan o'zgartirilgan bo'lsa, u kuchda)", async () => {
    process.env.ADMIN_PASSWORD_HASH = '$2a$12$old-from-env'
    await setSetting('admin_password_hash', '$2a$12$new-from-db')

    await connectDB()

    expect(process.env.ADMIN_PASSWORD_HASH).toBe('$2a$12$new-from-db')
  })

  test("bo'sh qiymatli setting e'tiborga olinmaydi (env buzilmaydi)", async () => {
    process.env.ADMIN_PASSWORD_HASH = '$2a$12$from-env'
    await setSetting('admin_password_hash', '')
    await setSetting('admin_password_changed_at', '')

    await connectDB()

    expect(process.env.ADMIN_PASSWORD_HASH).toBe('$2a$12$from-env')
    expect(process.env.ADMIN_PASSWORD_CHANGED_AT).toBeUndefined()
  })

  test("parol hash'i logga yozilmaydi (faqat 'yuklandi' xabari)", async () => {
    await setSetting('admin_password_hash', '$2a$12$SECRET-HASH-VALUE')

    await connectDB()

    const logged = JSON.stringify(infoSpy.mock.calls)
    expect(logged).toContain('Admin parol hash yuklandi')
    expect(logged).not.toContain('SECRET-HASH-VALUE')
  })
})

describe('connectDB — ulanish xatolari', () => {
  test("ulanish xatosi tashqariga uzatiladi (server.js uni ushlab, jarayonni to'xtatadi)", async () => {
    const connectSpy = jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('ECONNREFUSED'))
    try {
      await expect(connectDB()).rejects.toThrow('ECONNREFUSED')
    } finally {
      connectSpy.mockRestore()
    }
  })

  test("ulanish xatosida settings'ga umuman murojaat qilinmaydi va env o'zgarmaydi", async () => {
    process.env.ADMIN_PASSWORD_HASH = '$2a$12$from-env'
    await setSetting('admin_password_hash', '$2a$12$from-db')
    const connectSpy = jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('ETIMEDOUT'))
    try {
      await expect(connectDB()).rejects.toThrow()
    } finally {
      connectSpy.mockRestore()
    }
    expect(process.env.ADMIN_PASSWORD_HASH).toBe('$2a$12$from-env')
  })
})