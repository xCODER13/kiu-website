// GET /api/stats — admin panel bosh sahifasi uchun sanoqlar. Faqat auth bilan.
// Asosiy xavf: noto'g'ri filtr (masalan appsCount vakansiyalarni ham sanab yuborishi) admin
// panelda noto'g'ri raqam ko'rsatadi.
const request = require('supertest')
const app = require('../app')
const News = require('../models/News')
const Event = require('../models/Event')
const Teacher = require('../models/Teacher')
const Application = require('../models/Application')
const Gallery = require('../models/Gallery')
const SortingHatLead = require('../models/SortingHatLead')
const { getAuthToken } = require('./helpers')

const PHONE = '+998901234567'
const getStats = () => request(app).get('/api/stats').set('Authorization', `Bearer ${getAuthToken()}`)
const application = (overrides = {}) => Application.create({ name: 'Ali', phone: PHONE, ...overrides })

describe('GET /api/stats', () => {
  test("auth'siz 401", async () => {
    expect((await request(app).get('/api/stats')).status).toBe(401)
  })

  test("bo'sh bazada barcha sanoqlar 0, javob aynan 8 ta raqamli maydondan iborat", async () => {
    const res = await getStats()
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ newsCount: 0, shortsCount: 0, eventsCount: 0, teachersCount: 0, appsCount: 0, newApps: 0, vacancyApps: 0, galleryCount: 0 })
  })

  test("newsCount faqat yangiliklarni, shortsCount faqat YouTube Shorts videolarni sanaydi (saytdagi ajratish bilan bir xil)", async () => {
    await News.create([
      { title: 'maqola-1' },                                  // videoId default ''
      { title: 'maqola-2', videoId: '' },
      { title: 'video-1', videoId: 'SUzoqeWvQHY', shortsUrl: 'https://www.youtube.com/shorts/SUzoqeWvQHY' },
      { title: 'video-2', videoId: 'zKzMdF3MtkU' },
      { title: 'video-3', videoId: 'eOlgKMWoHrc' },
    ])
    // eski hujjatlarda `videoId` maydoni umuman bo'lmasligi ham mumkin — u ham yangilik hisoblanadi
    await News.collection.insertOne({ title: 'eski-maqola', views: 0 })

    const { body } = await getStats()
    expect(body.newsCount).toBe(3)
    expect(body.shortsCount).toBe(3)
  })

  test("news, events, teachers va gallery sanoqlari to'g'ri", async () => {
    await News.create([{ title: 'a' }, { title: 'b' }])
    await Event.create([
      { title: 'e1', eventDate: '2026-01-01' },
      { title: 'e2', eventDate: '2026-02-02' },
      { title: 'e3', eventDate: '2026-03-03' },
    ])
    await Teacher.create({ name: 'T', role: 'R', dept: 'Aniq fanlar kafedrasi' })
    await Gallery.create([
      { title: '1-kampus', images: ['https://x/1.jpg'] },
      { title: '2-kampus', images: ['https://x/2.jpg'] },
    ])

    const { body } = await getStats()
    expect(body.newsCount).toBe(2)
    expect(body.eventsCount).toBe(3)
    expect(body.teachersCount).toBe(1)
    expect(body.galleryCount).toBe(2)
  })

  test("appsCount faqat qabul (admission) arizalarini sanaydi; vakansiyalar alohida", async () => {
    await application({ type: 'admission' })
    await application({ type: 'admission', status: 'accepted' })
    await application({ type: 'vacancy' })
    await application({ type: 'vacancy', status: 'reviewed' })
    await application({ type: 'vacancy', status: 'rejected' })

    const { body } = await getStats()
    expect(body.appsCount).toBe(2)
    expect(body.vacancyApps).toBe(3) // holatidan qat'i nazar barcha vakansiyalar
  })

  test("newApps: holati 'new' bo'lgan arizalar — ikkala turdan ham (admission + vacancy)", async () => {
    await application({ type: 'admission' })                        // new
    await application({ type: 'vacancy' })                          // new
    await application({ type: 'admission', status: 'reviewed' })    // sanalmaydi
    await application({ type: 'vacancy', status: 'accepted' })      // sanalmaydi

    expect((await getStats()).body.newApps).toBe(2)
  })

  test("holat o'zgarsa sanoq ham o'zgaradi (yangi → ko'rib chiqilgan)", async () => {
    const a = await application()
    expect((await getStats()).body.newApps).toBe(1)

    await Application.findByIdAndUpdate(a._id, { status: 'reviewed' })
    expect((await getStats()).body.newApps).toBe(0)
  })

  test("HOZIRGI XATTI-HARAKAT: 'type' maydoni yo'q eski (legacy) ariza appsCount'ga kirmaydi, newApps'ga kiradi", async () => {
    // scripts/backfill-application-type.js migratsiyasi bajarilmagan bazada admin panel
    // qabul arizalari sonini kam ko'rsatadi. Migratsiya bajarilsa, appsCount 1 bo'ladi va
    // bu test yiqiladi — shunda kutilgan qiymatni 1 ga o'zgartiring.
    await Application.collection.insertOne({
      name: 'Eski ariza', phone: PHONE, status: 'new', createdAt: new Date(), updatedAt: new Date(),
    })

    const { body } = await getStats()
    expect(body.appsCount).toBe(0)
    expect(body.newApps).toBe(1)
  })
})

// GET /api/stats/applications-trend — arizalar trendi (band 6, admin dashboard grafigi)
const authed = url => request(app).get(url).set('Authorization', `Bearer ${getAuthToken()}`)

describe('GET /api/stats/applications-trend', () => {
  test("auth'siz 401", async () => {
    expect((await request(app).get('/api/stats/applications-trend')).status).toBe(401)
  })

  test("standart (day, 30 kun) — bo'sh bazada hammasi 0, oxirgi bucket bugungi kun", async () => {
    const res = await authed('/api/stats/applications-trend')
    expect(res.status).toBe(200)
    expect(res.body.granularity).toBe('day')
    expect(res.body.buckets).toHaveLength(30)
    expect(res.body.buckets.every(b => b.admission === 0 && b.vacancy === 0)).toBe(true)
    const today = new Date().toISOString().slice(0, 10)
    expect(res.body.buckets.at(-1).date).toBe(today)
  })

  test("admission va vacancy alohida seriya sifatida, to'g'ri kunga sanaladi", async () => {
    const now = new Date()
    await Application.collection.insertMany([
      { name: 'A', phone: PHONE, type: 'admission', status: 'new', createdAt: now, updatedAt: now },
      { name: 'B', phone: PHONE, type: 'admission', status: 'new', createdAt: now, updatedAt: now },
      { name: 'C', phone: PHONE, type: 'vacancy', status: 'new', createdAt: now, updatedAt: now },
    ])
    const res = await authed('/api/stats/applications-trend')
    const todayStr = now.toISOString().slice(0, 10)
    const todayBucket = res.body.buckets.find(b => b.date === todayStr)
    expect(todayBucket.admission).toBe(2)
    expect(todayBucket.vacancy).toBe(1)
  })

  test("granularity=week — har bir bucket dushanba sanasi bilan qaytadi", async () => {
    const res = await authed('/api/stats/applications-trend?granularity=week')
    expect(res.status).toBe(200)
    expect(res.body.granularity).toBe('week')
    expect(res.body.buckets).toHaveLength(12)
    for (const b of res.body.buckets) {
      expect(new Date(b.date + 'T00:00:00Z').getUTCDay()).toBe(1) // 1 = dushanba
    }
  })

  test("range parametri bucket sonini belgilaydi, lekin maksimal chegaradan oshmaydi", async () => {
    expect((await authed('/api/stats/applications-trend?range=7')).body.buckets).toHaveLength(7)
    expect((await authed('/api/stats/applications-trend?range=9999')).body.buckets).toHaveLength(90)
    expect((await authed('/api/stats/applications-trend?granularity=week&range=9999')).body.buckets).toHaveLength(52)
  })
})

describe('GET /api/stats/top-news', () => {
  test("auth'siz 401", async () => {
    expect((await request(app).get('/api/stats/top-news')).status).toBe(401)
  })

  test("views bo'yicha kamayish tartibida qaytaradi", async () => {
    await News.create([
      { title: "Kam ko'rilgan", views: 2 },
      { title: "Eng ko'p ko'rilgan", views: 50 },
      { title: "O'rtacha", views: 10 },
    ])
    const res = await authed('/api/stats/top-news')
    expect(res.status).toBe(200)
    expect(res.body.map(n => n.title)).toEqual(["Eng ko'p ko'rilgan", "O'rtacha", "Kam ko'rilgan"])
  })

  test('limit parametri natijalar sonini cheklaydi', async () => {
    await News.create([{ title: 'a', views: 1 }, { title: 'b', views: 2 }, { title: 'c', views: 3 }])
    expect((await authed('/api/stats/top-news?limit=2')).body).toHaveLength(2)
  })

  test("YouTube Shorts (videoId bor) yozuvlar ro'yxatga umuman kirmaydi, hatto views eng katta bo'lsa ham", async () => {
    await News.create([
      { title: 'Maqola A', views: 5 },
      { title: 'Maqola B', views: 0 },
      { title: 'Video X', videoId: 'SUzoqeWvQHY', views: 999 },
      { title: 'Video Y', videoId: 'zKzMdF3MtkU', views: 0 },
    ])
    await News.collection.insertOne({ title: 'Eski maqola (videoId maydoni yo\'q)', views: 3 })

    const res = await authed('/api/stats/top-news?limit=20')
    expect(res.status).toBe(200)
    expect(res.body.map(n => n.title)).toEqual(['Maqola A', "Eski maqola (videoId maydoni yo'q)", 'Maqola B'])
  })
})

describe('GET /api/stats/top-events', () => {
  test("auth'siz 401", async () => {
    expect((await request(app).get('/api/stats/top-events')).status).toBe(401)
  })

  test("views bo'yicha kamayish tartibida qaytaradi", async () => {
    await Event.create([
      { title: 'Kam', eventDate: '2026-01-01', views: 1 },
      { title: "Ko'p", eventDate: '2026-01-02', views: 20 },
    ])
    const res = await authed('/api/stats/top-events')
    expect(res.status).toBe(200)
    expect(res.body[0].title).toBe("Ko'p")
  })
})

describe('GET /api/stats/sortinghat-faculties', () => {
  test("auth'siz 401", async () => {
    expect((await request(app).get('/api/stats/sortinghat-faculties')).status).toBe(401)
  })

  test("bo'sh bazada total=0, faculties=[]", async () => {
    const res = await authed('/api/stats/sortinghat-faculties')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ total: 0, faculties: [] })
  })

  test("fakultetlar bo'yicha to'g'ri agregatsiya qiladi, individual ism/telefon HECH QACHON qaytarmaydi", async () => {
    await SortingHatLead.create([
      { name: 'Ali', phone: PHONE, faculties: ['Informatika', 'Iqtisodiyot'] },
      { name: 'Vali', phone: PHONE, faculties: ['Informatika'] },
      { name: 'Guli', phone: PHONE, faculties: ['Psixologiya'] },
    ])
    const res = await authed('/api/stats/sortinghat-faculties')
    expect(res.body.total).toBe(3)
    expect(res.body.faculties[0]).toEqual({ faculty: 'Informatika', count: 2 })
    // Xavfsizlik: bu — ommaviy statistika endpointi, individual PII (ism/telefon) sizib chiqmasin
    expect(JSON.stringify(res.body)).not.toContain('Ali')
    expect(JSON.stringify(res.body)).not.toContain(PHONE)
  })
})

describe('GET /api/stats/applications-faculties', () => {
  test("auth'siz 401", async () => {
    expect((await request(app).get('/api/stats/applications-faculties')).status).toBe(401)
  })

  test("bo'sh bazada total=0, faculties=[]", async () => {
    const res = await authed('/api/stats/applications-faculties')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ total: 0, faculties: [] })
  })

  test("faqat yo'nalishi ko'rsatilgan qabul arizalari sanaladi; vakansiya va bo'sh yo'nalish hisobga olinmaydi", async () => {
    await Application.create([
      { name: 'A', phone: PHONE, type: 'admission', faculty: 'Informatika' },
      { name: 'B', phone: PHONE, type: 'admission', faculty: 'Informatika' },
      { name: 'C', phone: PHONE, type: 'admission', faculty: 'Iqtisodiyot' },
      { name: 'D', phone: PHONE, type: 'admission', faculty: '' },
      { name: 'E', phone: PHONE, type: 'admission', faculty: '   ' },
      { name: 'F', phone: PHONE, type: 'vacancy', faculty: 'Informatika' },
    ])
    const res = await authed('/api/stats/applications-faculties')
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(3)
    expect(res.body.faculties).toEqual([
      { faculty: 'Informatika', count: 2 },
      { faculty: 'Iqtisodiyot', count: 1 },
    ])
  })

  test("teng sanoqda tartib barqaror (nom bo'yicha), limit natijalarni cheklaydi", async () => {
    await Application.create([
      { name: 'A', phone: PHONE, type: 'admission', faculty: 'Psixologiya' },
      { name: 'B', phone: PHONE, type: 'admission', faculty: 'Filologiya' },
      { name: 'C', phone: PHONE, type: 'admission', faculty: 'Buxgalteriya' },
    ])
    const res = await authed('/api/stats/applications-faculties?limit=2')
    expect(res.body.faculties.map(f => f.faculty)).toEqual(['Buxgalteriya', 'Filologiya'])
    expect(res.body.total).toBe(3) // total limitdan mustaqil
  })

  test("xavfsizlik: ariza beruvchining ismi/telefoni javobda HECH QACHON chiqmaydi", async () => {
    await Application.create({ name: 'Maxfiy Ism', phone: PHONE, type: 'admission', faculty: 'Informatika' })
    const res = await authed('/api/stats/applications-faculties')
    const json = JSON.stringify(res.body)
    expect(json).not.toContain('Maxfiy')
    expect(json).not.toContain(PHONE)
  })
})

// ── Brauzer keshi va indekslar (5.2) ──
describe('Stats: Cache-Control', () => {
  const ENDPOINTS = [
    '/api/stats', '/api/stats/applications-trend', '/api/stats/top-news',
    '/api/stats/top-events', '/api/stats/sortinghat-faculties', '/api/stats/applications-faculties',
  ]
  let n = 0
  const get = (url, token = true) => {
    const r = request(app).get(url).set('X-Forwarded-For', `10.60.0.${++n}`)
    return token ? r.set('Authorization', `Bearer ${getAuthToken()}`) : r
  }

  test.each(ENDPOINTS)('%s: muvaffaqiyatli javob 30 soniya private keshlanadi (Vary: Authorization)', async url => {
    const res = await get(url)
    expect(res.status).toBe(200)
    expect(res.headers['cache-control']).toBe('private, max-age=30')
    expect(res.headers.vary).toMatch(/Authorization/i)
  })

  test("xato javoblar keshlanmaydi: auth'siz 401 da Cache-Control yo'q", async () => {
    const res = await get('/api/stats', false)
    expect(res.status).toBe(401)
    expect(res.headers['cache-control']).toBeUndefined()
  })
})

describe('Stats: indekslar', () => {
  test('top-news va top-events sort kalitlari uchun indekslar mavjud', async () => {
    await Promise.all([News.init(), Event.init()])
    const hasIndex = async (Model, key) => (await Model.collection.indexes()).some(i => JSON.stringify(i.key) === JSON.stringify(key))
    expect(await hasIndex(News, { views: -1, createdAt: -1 })).toBe(true)
    expect(await hasIndex(Event, { views: -1, eventDate: -1 })).toBe(true)
  })
})
