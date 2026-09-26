// Test bazasi xavfsizlik to'sig'i (tests/testDbGuard.js): production bazasini
// tasodifan tozalab yuborishning oldini oladi.
const { assertSafeTestUri } = require('./testDbGuard')

describe('assertSafeTestUri', () => {
  test.each([
    'mongodb://127.0.0.1:27018/kiu-test',
    'mongodb://localhost:27017/kiu-test',
    'mongodb://mongo-test:27017/kiu-test',
    'mongodb://[::1]:27018/anything-test',
    'mongodb://user:pass@127.0.0.1:27018/kiu-test?authSource=admin',
  ])('xavfsiz URI qabul qilinadi: %s', uri => {
    expect(assertSafeTestUri(uri)).toBe(uri)
  })

  test.each([
    ['Atlas (srv)', 'mongodb+srv://user:secret@cluster0.abc.mongodb.net/kiu-test'],
    ['Atlas (oddiy)', 'mongodb://user:secret@cluster0-shard-00-00.abc.mongodb.net:27017/kiu-test'],
    ['begona host', 'mongodb://10.0.0.5:27017/kiu-test'],
    ['-test bilan tugamaydigan baza', 'mongodb://127.0.0.1:27018/kiu'],
    ['baza nomi yo\'q', 'mongodb://127.0.0.1:27018'],
    ['"-test" o\'rtada', 'mongodb://127.0.0.1:27018/kiu-test-prod'],
    ['bir nechta host', 'mongodb://127.0.0.1:27017,10.0.0.5:27017/kiu-test'],
    ['URI emas', 'bu-uri-emas'],
    ['bo\'sh', ''],
  ])('xavfli URI rad etiladi: %s', (_label, uri) => {
    expect(() => assertSafeTestUri(uri)).toThrow()
  })

  test("xato xabarida parol ko'rinmaydi", () => {
    let message = ''
    try { assertSafeTestUri('mongodb+srv://admin:SuperSecret123@cluster0.abc.mongodb.net/kiu-test') } catch (e) { message = e.message }
    expect(message).not.toBe('')
    expect(message).not.toContain('SuperSecret123')
  })
})
