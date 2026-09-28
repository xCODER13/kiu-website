const News = require('../models/News')
const Event = require('../models/Event')
const Teacher = require('../models/Teacher')
const Application = require('../models/Application')
const Gallery = require('../models/Gallery')
const SortingHatLead = require('../models/SortingHatLead')
const { fail } = require('../middleware/errorHandler')

async function getStats(req, res) {
  try {
    const admFilter = { type: 'admission' }
    const [newsCount, eventsCount, teachersCount, appsCount, newApps, vacancyApps, galleryCount] = await Promise.all([
      News.countDocuments(),
      Event.countDocuments(),
      Teacher.countDocuments(),
      Application.countDocuments(admFilter),
      Application.countDocuments({ status: 'new' }),
      Application.countDocuments({ type: 'vacancy' }),
      Gallery.countDocuments(),
    ])
    res.json({ newsCount, eventsCount, teachersCount, appsCount, newApps, vacancyApps, galleryCount })
  } catch (e) { fail(req, res, 500, e) }
}

// ── VAQT BUCKET YORDAMCHILARI (arizalar trendi uchun) ──
// MongoDB'dagi $dateTrunc bilan AYNAN bir xil mantiqni takrorlaydi (UTC,
// hafta dushanbadan boshlanadi) — aks holda aggregatsiyadan qaytgan sanalar
// bu yerda generatsiya qilingan "to'liq oraliq" bilan mos tushmay, ba'zi
// kunlar/haftalar noto'g'ri joyga tushib yoki umuman ko'rinmay qolishi mumkin.
function truncateToUnit(date, unit) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  if (unit === 'day') return d
  // getUTCDay(): 0=yakshanba..6=shanba. Dushanbagacha (yoki dushanbaning o'ziga) orqaga suramiz.
  const dow = d.getUTCDay()
  const diffToMonday = dow === 0 ? -6 : 1 - dow
  d.setUTCDate(d.getUTCDate() + diffToMonday)
  return d
}

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

const UNIT_MS = { day: 24 * 60 * 60 * 1000, week: 7 * 24 * 60 * 60 * 1000 }

// GET /api/stats/applications-trend?granularity=day|week&range=N
// Qabul (admission) va vakansiya (vacancy) arizalari sonini kun yoki hafta
// bo'yicha ikkita seriya sifatida qaytaradi. Bo'sh kun/haftalar ham 0 bilan
// to'ldiriladi — aks holda grafikda uzilishlar noto'g'ri talqin qilinishi mumkin.
async function getApplicationsTrend(req, res) {
  try {
    const granularity = req.query.granularity === 'week' ? 'week' : 'day'
    const defaultRange = granularity === 'week' ? 12 : 30
    const maxRange = granularity === 'week' ? 52 : 90
    const range = Math.min(Math.max(parseInt(req.query.range) || defaultRange, 1), maxRange)

    const startTrunc = truncateToUnit(new Date(Date.now() - (range - 1) * UNIT_MS[granularity]), granularity)

    const rows = await Application.aggregate([
      { $match: { createdAt: { $gte: startTrunc }, type: { $in: ['admission', 'vacancy'] } } },
      {
        $group: {
          _id: {
            date: {
              $dateTrunc: {
                date: '$createdAt',
                unit: granularity,
                timezone: 'UTC',
                ...(granularity === 'week' ? { startOfWeek: 'monday' } : {}),
              },
            },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
    ])

    const byKey = new Map()
    for (const r of rows) {
      const key = isoDate(r._id.date)
      const entry = byKey.get(key) || { date: key, admission: 0, vacancy: 0 }
      entry[r._id.type] = r.count
      byKey.set(key, entry)
    }

    const buckets = []
    for (let i = 0; i < range; i++) {
      const d = new Date(startTrunc.getTime() + i * UNIT_MS[granularity])
      const key = isoDate(d)
      buckets.push(byKey.get(key) || { date: key, admission: 0, vacancy: 0 })
    }

    res.json({ granularity, buckets })
  } catch (e) { fail(req, res, 500, e) }
}

// GET /api/stats/top-news?limit=N — eng ko'p ko'rilgan yangiliklar
async function getTopNews(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 20)
    const rows = await News.find({}, 'title views category createdAt')
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
    res.json(rows)
  } catch (e) { fail(req, res, 500, e) }
}

// GET /api/stats/top-events?limit=N — eng ko'p ko'rilgan tadbirlar
async function getTopEvents(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 20)
    const rows = await Event.find({}, 'title views eventDate type')
      .sort({ views: -1, eventDate: -1 })
      .limit(limit)
    res.json(rows)
  } catch (e) { fail(req, res, 500, e) }
}

// GET /api/stats/sortinghat-faculties?limit=N — SortingHat orqali eng ko'p
// tavsiya etilgan fakultetlar. Faqat AGREGATSIYA qaytariladi (fakultet nomi +
// sanoq) — individual ism/telefon bu yerdan hech qachon chiqmaydi, chunki bu
// admin panelda ko'rsatiladigan ommaviy statistika, individual lead ma'lumoti emas.
async function getSortingHatFaculties(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 20)
    const [rows, total] = await Promise.all([
      SortingHatLead.aggregate([
        { $unwind: '$faculties' },
        { $group: { _id: '$faculties', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, faculty: '$_id', count: 1 } },
      ]),
      SortingHatLead.countDocuments(),
    ])
    res.json({ total, faculties: rows })
  } catch (e) { fail(req, res, 500, e) }
}

module.exports = { getStats, getApplicationsTrend, getTopNews, getTopEvents, getSortingHatFaculties }
