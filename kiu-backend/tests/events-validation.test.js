// 1.4 (DESIGN.md 10.4): Event.type — 7 qiymatli ro'yxat (kichik harfda saqlanadi), Event.eventDate — haqiqiy sana
// va 2000-yildan keyin / hozirdan 10 yildan oshmagan oraliq. Eski (qoida kiritilishidan oldingi) `type` o'zgarmasdan
// qaytsa tahrirlash bloklanmaydi.
const fs = require('fs')
const path = require('path')
const request = require('supertest')
const app = require('../app')
const Event = require('../models/Event')
const { EVENT_TYPES } = require('../utils/eventTypes')
const { getAuthToken } = require('./helpers')

let auth
beforeAll(() => { auth = { Authorization: `Bearer ${getAuthToken()}` } })

const post = body => request(app).post('/api/events').set(auth).send({ title: 'Tadbir', eventDate: '2026-10-15', ...body })
const put = (id, body) => request(app).put(`/api/events/${id}`).set(auth).send(body)

async function insertLegacy(type) {
  const ins = await Event.collection.insertOne({ title: 'Eski', desc: '', eventDate: new Date('2026-01-01'), type, image: '', views: 0, createdAt: new Date(), updatedAt: new Date() })
  return ins.insertedId
}

describe('Event.type', () => {
  test("ro'yxatdagi 7 ta qiymatning hammasi qabul qilinadi", async () => {
    expect(EVENT_TYPES).toHaveLength(7)
    for (const type of EVENT_TYPES) {
      const res = await post({ type })
      expect(res.status).toBe(200)
      expect(res.body.type).toBe(type)
    }
  })

  test("`type` yuborilmasa 'general'; bo'shliq va katta harf tuzatiladi", async () => {
    expect((await post({})).body.type).toBe('general')
    expect((await post({ type: '  SPORT ' })).body.type).toBe('sport')
  })

  test("POST: ro'yxatda yo'q tur 400 beradi va tadbir yaratilmaydi", async () => {
    expect((await post({ type: 'bayram' })).status).toBe(400)
    expect((await post({ type: '<script>x</script>' })).status).toBe(400)
    expect(await Event.countDocuments()).toBe(0)
  })

  test("PUT: noto'g'ri tur 400, hujjat o'zgarmaydi", async () => {
    const ev = await Event.create({ title: 'Eski', eventDate: '2026-01-01', type: 'sport' })
    const res = await put(ev._id, { title: 'Yangi', eventDate: '2026-01-01', type: 'bayram' })
    expect(res.status).toBe(400)
    const after = await Event.findById(ev._id)
    expect(after.title).toBe('Eski')
    expect(after.type).toBe('sport')
  })

  test("PUT: eski (ro'yxatdan tashqari) tur o'zgarmasdan qaytsa — tahrirlash o'tadi va tur saqlanadi", async () => {
    const id = await insertLegacy('workshop')
    const res = await put(id, { title: 'Yangilandi', eventDate: '2026-01-01', type: 'workshop' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Yangilandi')
    expect(res.body.type).toBe('workshop')
  })

  test("PUT: eski tur boshqa noto'g'ri qiymatga o'zgartirilsa 400; to'g'riga o'zgartirilsa 200", async () => {
    const id = await insertLegacy('workshop')
    expect((await put(id, { title: 'Y', eventDate: '2026-01-01', type: 'boshqa' })).status).toBe(400)
    const ok = await put(id, { title: 'Y', eventDate: '2026-01-01', type: 'science' })
    expect(ok.status).toBe(200)
    expect(ok.body.type).toBe('science')
  })

  test("ro'yxat frontend bilan bir xil (admin shared/constants.js va ommaviy Events.jsx)", () => {
    const root = path.join(__dirname, '..', '..', 'src', 'pages')
    const constants = fs.readFileSync(path.join(root, 'admin', 'shared', 'constants.js'), 'utf8')
    const block = constants.match(/export const EVENT_TYPES = \[([\s\S]*?)\n\]/)[1]
    const adminValues = [...block.matchAll(/value: '([^']+)'/g)].map(m => m[1])
    expect([...adminValues].sort()).toEqual([...EVENT_TYPES].sort())

    const publicSrc = fs.readFileSync(path.join(root, 'Events.jsx'), 'utf8')
    const publicValues = [...publicSrc.match(/const EVENT_TYPES = \[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map(m => m[1])
    expect([...publicValues].sort()).toEqual([...EVENT_TYPES].sort())
  })
})

describe('Event.eventDate', () => {
  test.each([
    ['matn', 'abc'],
    ['mavjud bo\'lmagan sana', '2026-13-45'],
    ['2000-yildan oldin', '1999-12-31'],
    ['yil xatosi (0226)', '0226-05-01'],
    ['yil xatosi (20260)', '+020260-01-01'],
    ['10 yildan uzoq kelajak', '2100-01-01'],
  ])("POST: noto'g'ri sana (%s) 400 beradi", async (_n, eventDate) => {
    const res = await post({ eventDate })
    expect(res.status).toBe(400)
    expect(await Event.countDocuments()).toBe(0)
  })

  test('POST: chegaradagi sana (2000-01-01) qabul qilinadi', async () => {
    expect((await post({ eventDate: '2000-01-01' })).status).toBe(200)
  })

  test("PUT: noto'g'ri sana 400, hujjat o'zgarmaydi", async () => {
    const ev = await Event.create({ title: 'Eski', eventDate: '2026-01-01' })
    expect((await put(ev._id, { eventDate: '1970-01-01' })).status).toBe(400)
    expect((await Event.findById(ev._id)).eventDate.toISOString()).toBe('2026-01-01T00:00:00.000Z')
  })
})
