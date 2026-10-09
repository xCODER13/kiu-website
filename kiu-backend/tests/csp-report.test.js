// POST /api/csp-report (5.1): autentifikatsiyasiz endpoint — kirish ishonchsiz, shuning uchun testlar
// tozalash (URL query/hash, maydonlar, uzunlik), kengaytma shovqini, limitlar va CORS'dan oldin turishini tekshiradi.
const request = require('supertest')
const app = require('../app')
const { normalizeCspReports, MAX_REPORTS_PER_REQUEST, MAX_FIELD_LENGTH } = require('../utils/cspReport')
const { receive } = require('../controllers/cspController')
const { resetCspReportGlobalLimit } = require('../middleware/rateLimiters')

let n = 0
const nextIp = () => `10.60.${Math.floor(++n / 250)}.${n % 250}`

const legacy = (over = {}) => ({
  'csp-report': {
    'document-uri': 'https://kiu.example/news/n1?token=SECRET#frag',
    'effective-directive': 'script-src-elem',
    'violated-directive': "script-src-elem 'self'",
    'blocked-uri': 'https://evil.example/x.js?uid=42',
    'source-file': 'https://kiu.example/assets/app.js',
    'line-number': 12,
    'column-number': 7,
    disposition: 'report',
    ...over
  }
})

describe('normalizeCspReports — tozalash', () => {
  test("eski format: maydonlar bitta shaklga keladi, URL'lardan query va hash tushadi", () => {
    expect(normalizeCspReports(legacy())).toEqual([{
      directive: 'script-src-elem',
      blocked: 'https://evil.example/x.js',
      document: 'https://kiu.example/news/n1',
      source: 'https://kiu.example/assets/app.js',
      line: 12,
      column: 7,
      disposition: 'report'
    }])
  })

  test('yangi format (Reporting API): faqat csp-violation turi olinadi', () => {
    const body = [
      { type: 'csp-violation', body: { effectiveDirective: 'img-src', blockedURL: 'https://cdn.example/a.png?x=1', documentURL: 'https://kiu.example/?q=secret', lineNumber: 3, disposition: 'report' } },
      { type: 'deprecation', body: { blockedURL: 'https://nope.example/' } }
    ]
    expect(normalizeCspReports(body)).toEqual([{ directive: 'img-src', blocked: 'https://cdn.example/a.png', document: 'https://kiu.example/', line: 3, disposition: 'report' }])
  })

  test('effective-directive yo\'q bo\'lsa — violated-directive ning birinchi so\'zi', () => {
    const r = normalizeCspReports(legacy({ 'effective-directive': undefined, 'violated-directive': "style-src 'self' https://fonts.googleapis.com" }))
    expect(r[0].directive).toBe('style-src')
  })

  test("data:/blob: faqat sxema sifatida; inline/eval o'zgarishsiz; yaroqsiz URL query'siz qisqartiriladi", () => {
    const blocked = b => normalizeCspReports(legacy({ 'blocked-uri': b }))[0].blocked
    expect(blocked('data:image/png;base64,AAAA')).toBe('data')
    expect(blocked('blob:https://kiu.example/uuid')).toBe('blob')
    expect(blocked('inline')).toBe('inline')
    expect(blocked('eval')).toBe('eval')
    expect(blocked('not a url?secret=1')).toBe('not a url')
  })

  test("noma'lum maydonlar tashlanadi, noto'g'ri tur/qiymatlar e'tiborsiz", () => {
    const r = normalizeCspReports(legacy({ sample: 'document.cookie', referrer: 'https://x.example/?a=b', 'line-number': '12', 'column-number': -1, disposition: 'hack', 'original-policy': 'x' }))
    expect(r).toEqual([{
      directive: 'script-src-elem',
      blocked: 'https://evil.example/x.js',
      document: 'https://kiu.example/news/n1',
      source: 'https://kiu.example/assets/app.js'
    }])
  })

  test('uzun matn qisqartiriladi', () => {
    const r = normalizeCspReports(legacy({ 'blocked-uri': `https://evil.example/${'a'.repeat(5000)}` }))
    expect(r[0].blocked.length).toBeLessThanOrEqual(MAX_FIELD_LENGTH)
  })

  test.each([
    ['chrome-extension://abc/content.js'],
    ['moz-extension://abc/content.js'],
    ['safari-web-extension://abc/x.js']
  ])('brauzer kengaytmasi shovqini (%s) — hisobot emas', ext => {
    expect(normalizeCspReports(legacy({ 'blocked-uri': ext }))).toEqual([])
    expect(normalizeCspReports(legacy({ 'source-file': ext }))).toEqual([])
  })

  test("bir so'rovda ko'pi bilan MAX_REPORTS_PER_REQUEST ta", () => {
    const many = Array.from({ length: 50 }, () => ({ type: 'csp-violation', body: { effectiveDirective: 'img-src', blockedURL: 'https://a.example/' } }))
    expect(normalizeCspReports(many)).toHaveLength(MAX_REPORTS_PER_REQUEST)
  })

  test.each([[undefined], [null], ['text'], [42], [[]], [{}], [{ 'csp-report': 'x' }], [{ 'csp-report': {} }], [[null, 1, 'x']]])('axlat (%j) — bo\'sh natija, xato yo\'q', body => {
    expect(normalizeCspReports(body)).toEqual([])
  })
})

describe('receive — log', () => {
  const run = body => {
    const warn = jest.fn()
    const res = { status: jest.fn().mockReturnThis(), end: jest.fn() }
    receive({ body, log: { warn } }, res)
    return { warn, res }
  }

  test("har bir tozalangan hisobot bitta `[CSP]` log; javob 204", () => {
    const { warn, res } = run(legacy())
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0].csp.blocked).toBe('https://evil.example/x.js')
    expect(warn.mock.calls[0][1]).toContain('[CSP]')
    expect(res.status).toHaveBeenCalledWith(204)
  })

  test("kengaytma shovqini va axlat loglanmaydi, javob baribir 204", () => {
    const a = run(legacy({ 'blocked-uri': 'chrome-extension://x/y.js' }))
    const b = run(undefined)
    expect(a.warn).not.toHaveBeenCalled()
    expect(b.warn).not.toHaveBeenCalled()
    expect(a.res.status).toHaveBeenCalledWith(204)
    expect(b.res.status).toHaveBeenCalledWith(204)
  })
})

describe('POST /api/csp-report — endpoint', () => {
  const post = (ip = nextIp()) => request(app).post('/api/csp-report').set('X-Forwarded-For', ip)

  test.each([
    ['application/csp-report', JSON.stringify(legacy())],
    ['application/reports+json', JSON.stringify([{ type: 'csp-violation', body: { effectiveDirective: 'img-src', blockedURL: 'https://a.example/' } }])],
    ['application/json', JSON.stringify(legacy())]
  ])('%s -> 204, tanasiz', async (type, body) => {
    const res = await post().set('Content-Type', type).send(body)
    expect(res.status).toBe(204)
    expect(res.text).toBe('')
  })

  test("begona Content-Type (text/plain) yoki bo'sh tana -> 204, xato yo'q", async () => {
    expect((await post().set('Content-Type', 'text/plain').send('x')).status).toBe(204)
    expect((await post().send()).status).toBe(204)
  })

  test("8 KB dan katta tana -> 413 (jim, JSON xato matnisiz)", async () => {
    const big = JSON.stringify(legacy({ 'blocked-uri': `https://a.example/${'a'.repeat(9000)}` }))
    const res = await post().set('Content-Type', 'application/csp-report').send(big)
    expect(res.status).toBe(413)
    expect(res.text).toBe('')
  })

  test("buzilgan JSON -> 400 (jim)", async () => {
    const res = await post().set('Content-Type', 'application/csp-report').send('{"csp-report": ')
    expect(res.status).toBe(400)
    expect(res.text).toBe('')
  })

  test("CORS'dan oldin: ruxsatsiz Origin'dan ham 204 (403/CORS xatosi emas)", async () => {
    const res = await post().set('Origin', 'https://boshqa-sayt.example').set('Content-Type', 'application/csp-report').send(JSON.stringify(legacy()))
    expect(res.status).toBe(204)
  })

  test("faqat POST: GET -> 404 (umumiy notFound)", async () => {
    expect((await request(app).get('/api/csp-report')).status).toBe(404)
  })

  test("IP bo'yicha limit: 31-so'rov 429 (jim), boshqa IP ta'sirlanmaydi", async () => {
    const ip = nextIp()
    for (let i = 0; i < 30; i++) expect((await post(ip).set('Content-Type', 'application/csp-report').send(JSON.stringify(legacy()))).status).toBe(204)
    const blocked = await post(ip).set('Content-Type', 'application/csp-report').send(JSON.stringify(legacy()))
    expect(blocked.status).toBe(429)
    expect(blocked.text).toBe('')
    expect((await post().set('Content-Type', 'application/csp-report').send(JSON.stringify(legacy()))).status).toBe(204)
  })

  // Eng oxirida: umumiy byudjetni tugatadi, so'ng tozalaydi (boshqa fayllarga ta'sir qilmasligi uchun).
  test("umumiy limit: barcha IP'lardan 600 tadan keyin yangi IP ham 429", async () => {
    resetCspReportGlobalLimit()
    try {
      let last
      for (let i = 0; i < 601; i++) last = await post().set('Content-Type', 'application/csp-report').send('{}')
      expect(last.status).toBe(429)
    } finally {
      resetCspReportGlobalLimit()
    }
  })
})
