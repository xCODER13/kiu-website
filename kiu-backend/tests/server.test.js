// server.js: ishga tushirish (start), toza yopish (shutdown), keep-alive (pingSelf) va
// process handlerlari. Production'da bu kod har deploy'da ishlaydi, lekin oldin uni
// `require` qilib bo'lmasdi (yuklanishi bilan darhol .listen() va DB ulanishi boshlanardi).
//
// Har testda server.js `jest.isolateModules` ichida YANGI yuklanadi: modul ichidagi holat
// (server, keepAliveTimer) testlar orasida aralashib ketmaydi. Shu sababli ichkaridagi
// `mongoose` va `app` — test faylining o'z nusxasidan alohida instance'lar. Haqiqiy
// process.exit hech qachon chaqirilmaydi: `exit` parametri orqali mock beriladi.
// Faqat `config/db` (connectDB) almashtiriladi, shunda MONGODB_URI'ga tegilmaydi.
const request = require('supertest')

const TEST_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27018/kiu-test'
const MONGO_OPTS = { serverSelectionTimeoutMS: 2000, runtimeAdapters: { os: require('os') } }

const ENV_KEYS = ['MONGODB_URI', 'PORT', 'BACKEND_URL']
let savedEnv
let loaded

// server.js'ni toza holatda yuklaydi. Qaytaradi: eksportlar + ichki (izolyatsiyalangan) logger/mongoose/app.
function loadServer({ connectDB = jest.fn().mockResolvedValue(undefined), dotenv } = {}) {
  let result
  jest.isolateModules(() => {
    jest.doMock('../config/db', () => ({ connectDB }))
    if (dotenv) jest.doMock('dotenv', () => dotenv)
    const mod = require('../server')
    result = {
      ...mod,
      connectDB,
      logger: require('../logger'),
      mongoose: require('mongoose'),
      app: require('../app'),
    }
  })
  loaded.push(result)
  return result
}

const messages = spy => spy.mock.calls.map(c => (typeof c[0] === 'string' ? c[0] : c[1]))

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map(k => [k, process.env[k]]))
  process.env.MONGODB_URI = TEST_URI // validateEnv talab qiladi; connectDB mock qilingani uchun ishlatilmaydi
  process.env.PORT = '0' // 0 = tizim bo'sh port beradi, 5000 bilan to'qnashmaydi
  delete process.env.BACKEND_URL
  loaded = []
})

afterEach(async () => {
  // Ochiq qolgan server / Mongo ulanish / interval bo'lsa yopamiz (o'zimiz yozgan shutdown orqali).
  for (const s of loaded) {
    await s.shutdown('TEST-CLEANUP', jest.fn())
    if (s.mongoose.connection.readyState !== 0) await s.mongoose.disconnect().catch(() => {})
  }
  jest.useRealTimers()
  jest.restoreAllMocks()
  jest.dontMock('dotenv')
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]
    else process.env[k] = savedEnv[k]
  }
})

// ───────────────────────── yuklanish ─────────────────────────
describe('server.js — require qilinganda', () => {
  test("hech narsa o'zi ishga tushmaydi: DB ulanmaydi, listen chaqirilmaydi, process handlerlar qo'shilmaydi", () => {
    const onSpy = jest.spyOn(process, 'on')
    const { connectDB, app } = loadServer()
    const listenSpy = jest.spyOn(app, 'listen')

    expect(connectDB).not.toHaveBeenCalled()
    expect(listenSpy).not.toHaveBeenCalled()
    const events = onSpy.mock.calls.map(c => c[0])
    expect(events).not.toEqual(expect.arrayContaining(['SIGTERM']))
    expect(events).not.toContain('uncaughtException')
    expect(events).not.toContain('unhandledRejection')
  })

  test(".env yuklanmaydi (lokal .env dagi production qiymatlari testga tushib qolmasligi kerak)", () => {
    const dotenv = { config: jest.fn() }
    loadServer({ dotenv })

    expect(dotenv.config).not.toHaveBeenCalled()
  })

  test("kerakli funksiyalar eksport qilinadi", () => {
    const s = loadServer()

    for (const name of ['start', 'shutdown', 'pingSelf', 'registerProcessHandlers']) {
      expect(typeof s[name]).toBe('function')
    }
  })
})

// ───────────────────────── start() ─────────────────────────
describe('start()', () => {
  test("tartib: avval MongoDB ulanadi, KEYIN server so'rov qabul qila boshlaydi", async () => {
    const s = loadServer()
    const listenSpy = jest.spyOn(s.app, 'listen')

    await s.start(jest.fn())

    expect(s.connectDB).toHaveBeenCalledTimes(1)
    expect(listenSpy).toHaveBeenCalledTimes(1)
    expect(s.connectDB.mock.invocationCallOrder[0]).toBeLessThan(listenSpy.mock.invocationCallOrder[0])
  })

  test("MongoDB ulanmasa: exit(1), logger.fatal, server umuman ishga tushmaydi", async () => {
    const s = loadServer({ connectDB: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')) })
    const listenSpy = jest.spyOn(s.app, 'listen')
    const fatal = jest.spyOn(s.logger, 'fatal')
    const exit = jest.fn()

    const result = await s.start(exit)

    expect(exit).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(1)
    expect(fatal).toHaveBeenCalled()
    expect(listenSpy).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })

  test("kritik env yo'q (MONGODB_URI): exit(1), DB'ga ulanishga ham urinilmaydi, server ko'tarilmaydi", async () => {
    delete process.env.MONGODB_URI
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const s = loadServer()
    const listenSpy = jest.spyOn(s.app, 'listen')
    // Haqiqiy process.exit qaytmaydi — shuni taqlid qilish uchun mock xato tashlaydi
    const exit = code => { throw new Error(`EXIT:${code}`) }

    await expect(s.start(exit)).rejects.toThrow('EXIT:1')

    expect(s.connectDB).not.toHaveBeenCalled()
    expect(listenSpy).not.toHaveBeenCalled()
  })

  test("PORT env'dan o'qiladi va startdan keyin ham (yuklanish paytida qotib qolmaydi)", async () => {
    const s = loadServer() // PORT yuklanishdan keyin o'zgartiriladi
    process.env.PORT = '4321'
    const fake = { close: cb => cb() }
    const listenSpy = jest.spyOn(s.app, 'listen').mockImplementation((port, cb) => { cb(); return fake })
    const info = jest.spyOn(s.logger, 'info')

    await s.start(jest.fn())

    expect(listenSpy.mock.calls[0][0]).toBe('4321')
    expect(messages(info)).toContain('Server ishlamoqda: http://localhost:4321')
  })

  test("PORT berilmasa standart 5000 (haqiqiy portni band qilmasdan)", async () => {
    delete process.env.PORT
    const s = loadServer()
    const listenSpy = jest.spyOn(s.app, 'listen').mockImplementation((port, cb) => { cb(); return { close: c => c() } })

    await s.start(jest.fn())

    expect(listenSpy.mock.calls[0][0]).toBe(5000)
  })

  test("haqiqiy server: /health javob beradi; start() ishlayotgan server qaytaradi", async () => {
    const s = loadServer()

    const server = await s.start(jest.fn())
    expect(server.listening).toBe(true)

    const res = await request(server).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  describe('keep-alive interval', () => {
    test("BACKEND_URL berilgan bo'lsa: 14 daqiqalik interval o'rnatiladi", async () => {
      process.env.BACKEND_URL = 'https://kiu.example.com'
      const s = loadServer()
      const intervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue(123)
      jest.spyOn(s.app, 'listen').mockImplementation((p, cb) => { cb(); return { close: c => c() } })

      await s.start(jest.fn())

      const calls = intervalSpy.mock.calls.filter(c => c[1] === s.KEEP_ALIVE_INTERVAL_MS)
      expect(calls).toHaveLength(1)
      expect(calls[0][0]).toBe(s.pingSelf)
      expect(s.KEEP_ALIVE_INTERVAL_MS).toBe(14 * 60 * 1000)
    })

    test("BACKEND_URL yo'q bo'lsa: interval o'rnatilmaydi", async () => {
      const s = loadServer()
      const intervalSpy = jest.spyOn(global, 'setInterval')
      jest.spyOn(s.app, 'listen').mockImplementation((p, cb) => { cb(); return { close: c => c() } })

      await s.start(jest.fn())

      expect(intervalSpy.mock.calls.filter(c => c[1] === s.KEEP_ALIVE_INTERVAL_MS)).toHaveLength(0)
    })
  })
})

// ───────────────────────── shutdown() ─────────────────────────
describe('shutdown()', () => {
  test("ketma-ketlik: keep-alive to'xtaydi → HTTP server yopiladi → Mongo yopiladi → exit(0)", async () => {
    process.env.BACKEND_URL = 'https://kiu.example.com'
    const s = loadServer()
    await s.mongoose.connect(TEST_URI, MONGO_OPTS)
    const intervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue(777)
    const clearSpy = jest.spyOn(global, 'clearInterval')
    const server = await s.start(jest.fn())
    const serverClose = jest.spyOn(server, 'close')
    const mongoClose = jest.spyOn(s.mongoose.connection, 'close')
    const exit = jest.fn()

    await s.shutdown('SIGTERM', exit)

    expect(intervalSpy).toHaveBeenCalled()
    expect(clearSpy).toHaveBeenCalledWith(777)
    expect(server.listening).toBe(false)
    expect(serverClose.mock.invocationCallOrder[0]).toBeLessThan(mongoClose.mock.invocationCallOrder[0])
    expect(s.mongoose.connection.readyState).toBe(0)
    expect(exit).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(0)
  })

  test("signal nomi logga yoziladi", async () => {
    const s = loadServer()
    const info = jest.spyOn(s.logger, 'info')

    await s.shutdown('SIGINT', jest.fn())

    expect(messages(info)).toContain('SIGINT qabul qilindi — server yopilmoqda...')
  })

  test("hali start qilinmagan bo'lsa ham xatosiz tugaydi: exit(0)", async () => {
    const s = loadServer()
    const exit = jest.fn()

    await s.shutdown('SIGTERM', exit)

    expect(exit).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(0)
  })

  test("Mongo ulanmagan bo'lsa (readyState 0) connection.close() chaqirilmaydi", async () => {
    const s = loadServer()
    const mongoClose = jest.spyOn(s.mongoose.connection, 'close')

    await s.shutdown('SIGTERM', jest.fn())

    expect(s.mongoose.connection.readyState).toBe(0)
    expect(mongoClose).not.toHaveBeenCalled()
  })

  test("HTTP server yopilmasa (xato): exit(1), Mongo yopilmaydi, logger.error", async () => {
    const s = loadServer()
    const fake = { close: cb => cb(new Error('server.close xatosi')) }
    jest.spyOn(s.app, 'listen').mockImplementation((p, cb) => { cb(); return fake })
    await s.start(jest.fn())
    const mongoClose = jest.spyOn(s.mongoose.connection, 'close')
    const error = jest.spyOn(s.logger, 'error')
    const exit = jest.fn()

    await s.shutdown('SIGTERM', exit)

    expect(exit).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(1)
    expect(error).toHaveBeenCalled()
    expect(mongoClose).not.toHaveBeenCalled()
  })

  test("Mongo yopishda xato: exit(1) (0 emas) va logger.error", async () => {
    const s = loadServer()
    Object.defineProperty(s.mongoose.connection, 'readyState', { get: () => 1, configurable: true })
    jest.spyOn(s.mongoose.connection, 'close').mockRejectedValue(new Error('close xatosi'))
    const error = jest.spyOn(s.logger, 'error')
    const exit = jest.fn()

    await s.shutdown('SIGTERM', exit)

    expect(exit).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(1)
    expect(error).toHaveBeenCalled()
  })

  // BILINGAN KAMCHILIK: ikkinchi signal (masalan dev'da Ctrl+C ikki marta) shutdown davom
  // etayotganda yana shutdown'ni boshlaydi. server.close() ikkinchi marta ERR_SERVER_NOT_RUNNING
  // beradi → exit(1): birinchi shutdown hali tugamagan bo'lsa ham jarayon xato kodi bilan
  // o'ladi. Tuzatish: `let shuttingDown = false` bayrog'i (takroriy chaqiruvni e'tiborsiz qoldirish).
  // Tuzatilgach `.failing` olib tashlanadi.
  test.failing("KNOWN: ketma-ket ikki signal yopilishni buzmaydi (exit(1) chaqirilmaydi)", async () => {
    const s = loadServer()
    await s.start(jest.fn())
    const exit = jest.fn()

    await Promise.all([s.shutdown('SIGTERM', exit), s.shutdown('SIGINT', exit)])

    expect(exit).not.toHaveBeenCalledWith(1)
  })

  test("muvaffaqiyatli yopishda exit(1) HECH QACHON chaqirilmaydi", async () => {
    const s = loadServer()
    await s.start(jest.fn())
    const exit = jest.fn()

    await s.shutdown('SIGTERM', exit)

    expect(exit).not.toHaveBeenCalledWith(1)
  })
})

// ───────────────────────── process handlerlar ─────────────────────────
describe('registerProcessHandlers()', () => {
  // Haqiqiy process'ga handler qo'shilmaydi (aks holda Jest'ning o'z xatolari yutilib ketardi):
  // process.on chaqiruvlarini ushlab, handlerlarni qo'lda ishga tushiramiz.
  function capture(s, exit) {
    const handlers = {}
    jest.spyOn(process, 'on').mockImplementation((event, fn) => { handlers[event] = fn; return process })
    s.registerProcessHandlers(exit)
    return handlers
  }

  test("to'rtta hodisaga handler qo'yiladi", () => {
    const handlers = capture(loadServer(), jest.fn())

    expect(Object.keys(handlers).sort()).toEqual(['SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection'])
  })

  test("uncaughtException: logger.fatal + exit(1) (jimgina davom etmaydi)", () => {
    const s = loadServer()
    const fatal = jest.spyOn(s.logger, 'fatal')
    const exit = jest.fn()
    const handlers = capture(s, exit)

    handlers.uncaughtException(new Error('kutilmagan'))

    expect(fatal).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(1)
  })

  test("unhandledRejection: logger.fatal + exit(1), sabab (Error bo'lmasa ham) logga tushadi", () => {
    const s = loadServer()
    const fatal = jest.spyOn(s.logger, 'fatal')
    const exit = jest.fn()
    const handlers = capture(s, exit)

    handlers.unhandledRejection('oddiy matn sabab')

    expect(fatal.mock.calls[0][0]).toEqual({ err: 'oddiy matn sabab' })
    expect(exit).toHaveBeenCalledWith(1)
  })

  test.each(['SIGTERM', 'SIGINT'])("%s: graceful shutdown ishga tushadi (server yopiladi, exit(0))", async signal => {
    const s = loadServer()
    const server = await s.start(jest.fn())
    const exit = jest.fn()
    const handlers = capture(s, exit)

    handlers[signal]()
    await new Promise(resolve => server.once('close', resolve))
    await new Promise(resolve => setImmediate(resolve)) // shutdown'ning qolgan qadamlari tugashi uchun

    expect(server.listening).toBe(false)
    expect(exit).toHaveBeenCalledWith(0)
  })
})

// ───────────────────────── pingSelf() ─────────────────────────
describe('pingSelf() — keep-alive so\'rovi', () => {
  let fetchSpy
  beforeEach(() => {
    process.env.BACKEND_URL = 'https://kiu.example.com'
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  const flush = () => new Promise(resolve => setImmediate(resolve))

  test("BACKEND_URL yo'q bo'lsa hech qanday so'rov yuborilmaydi", () => {
    delete process.env.BACKEND_URL
    const s = loadServer()

    s.pingSelf()

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test("<BACKEND_URL>/health ga AbortSignal bilan so'rov ketadi; muvaffaqiyat logga yoziladi", async () => {
    fetchSpy.mockResolvedValue({ ok: true })
    const s = loadServer()
    const info = jest.spyOn(s.logger, 'info')

    s.pingSelf()
    await flush()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy.mock.calls[0][0]).toBe('https://kiu.example.com/health')
    expect(fetchSpy.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
    expect(messages(info)).toContain('Keep-alive OK')
  })

  test("tarmoq xatosi: tashlanmaydi (unhandled rejection yo'q), logger.warn yoziladi", async () => {
    fetchSpy.mockRejectedValue(new Error('ENOTFOUND'))
    const s = loadServer()
    const warn = jest.spyOn(s.logger, 'warn')

    expect(() => s.pingSelf()).not.toThrow()
    await flush()

    expect(warn).toHaveBeenCalledWith({ err: 'ENOTFOUND' }, 'Keep-alive failed')
  })

  // Fake timer FAQAT test ichida va modul yuklangandan KEYIN yoqiladi (limiter'lar yuklanishda
  // o'z taymerlarini yaratadi), va finally'da qaytariladi — aks holda tests/setup.js dagi
  // afterEach (Mongo tozalash) fake taymerlar bilan osilib qoladi.
  test("javob 10 soniyada kelmasa so'rov bekor qilinadi (osilib qolmaydi)", async () => {
    // Signal abort bo'lguncha hech qachon hal bo'lmaydigan fetch
    fetchSpy.mockImplementation((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')))
    }))
    const s = loadServer()
    const warn = jest.spyOn(s.logger, 'warn')
    jest.useFakeTimers()
    try {
      s.pingSelf()
      await jest.advanceTimersByTimeAsync(9_999)
      expect(warn).not.toHaveBeenCalled()

      await jest.advanceTimersByTimeAsync(1)
      expect(warn).toHaveBeenCalledWith({ err: 'aborted' }, 'Keep-alive failed')
    } finally {
      jest.useRealTimers()
    }
  })

  test("javob kelgach timeout taymeri tozalanadi (taymer qolib ketmaydi)", async () => {
    fetchSpy.mockResolvedValue({ ok: true })
    const s = loadServer()
    jest.useFakeTimers()
    try {
      s.pingSelf()
      expect(jest.getTimerCount()).toBe(1) // 10 soniyalik abort taymeri
      await jest.advanceTimersByTimeAsync(0)

      expect(jest.getTimerCount()).toBe(0)
    } finally {
      jest.useRealTimers()
    }
  })
})