const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = express()
app.use(cors({ origin:'https://kiu-university.vercel.app', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const DEBUG_LOG = path.resolve(__dirname, 'news_payload_debug.log')
const News = require('./models/News')
const Event = require('./models/Event')
const Teacher = require('./models/Teacher')
const Application = require('./models/Application')

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB ulandi'))
  .catch(err => console.log('MongoDB xatosi:', err))

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token kerak' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token noto\'g\'ri' })
  }
}

// ── AUTH ──
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Login yoki parol noto\'g\'ri' })
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

app.post('/api/admin/change-password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (currentPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Joriy parol noto\'g\'ri' })
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
  }
  try {
    const envPath = path.resolve(__dirname, '.env')
    let envContent = fs.readFileSync(envPath, 'utf8')
    envContent = envContent.replace(/ADMIN_PASSWORD=.*/, `ADMIN_PASSWORD=${newPassword}`)
    fs.writeFileSync(envPath, envContent)
    process.env.ADMIN_PASSWORD = newPassword
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: '.env faylga yozib bo\'lmadi: ' + e.message })
  }
})

// ── NEWS ──
app.get('/api/news', async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 })
  res.json(news)
})
app.post('/api/news', auth, async (req, res) => {
  try {
    const { title, content, category, image, videoId } = req.body
    const shortsUrl = req.body.shortsUrl || req.body.shortsURL || ''
    const payload = { title, content, category, image, shortsUrl, videoId: videoId || '' }
    fs.appendFileSync(DEBUG_LOG, `POST ${new Date().toISOString()} payload=${JSON.stringify(payload)}\n`)
    const n = await News.create(payload)
    fs.appendFileSync(DEBUG_LOG, `POST result=${JSON.stringify(n.toObject())}\n`)
    res.json(n)
  } catch (e) { fs.appendFileSync(DEBUG_LOG, `POST error=${e.message}\n`); res.status(400).json({ error: e.message }) }
})
app.put('/api/news/:id', auth, async (req, res) => {
  const { title, content, category, image, videoId } = req.body
  const shortsUrl = req.body.shortsUrl || req.body.shortsURL || ''
  const payload = { title, content, category, image, shortsUrl, videoId: videoId || '' }
  fs.appendFileSync(DEBUG_LOG, `PUT ${new Date().toISOString()} id=${req.params.id} payload=${JSON.stringify(payload)}\n`)
  const n = await News.findByIdAndUpdate(req.params.id, payload, { new: true })
  fs.appendFileSync(DEBUG_LOG, `PUT result=${JSON.stringify(n ? n.toObject() : null)}\n`)
  res.json(n)
})
app.delete('/api/news/:id', auth, async (req, res) => {
  await News.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

// ── EVENTS ──
app.get('/api/events', async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 })
  res.json(events)
})
app.post('/api/events', auth, async (req, res) => {
  try { const e = await Event.create(req.body); res.json(e) }
  catch (e) { res.status(400).json({ error: e.message }) }
})
app.put('/api/events/:id', auth, async (req, res) => {
  const e = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(e)
})
app.delete('/api/events/:id', auth, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

// ── TEACHERS ──
app.get('/api/teachers', async (req, res) => {
  const teachers = await Teacher.find().sort({ createdAt: -1 })
  res.json(teachers)
})
app.post('/api/teachers', auth, async (req, res) => {
  try { const t = await Teacher.create(req.body); res.json(t) }
  catch (e) { res.status(400).json({ error: e.message }) }
})
app.put('/api/teachers/:id', auth, async (req, res) => {
  const t = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(t)
})
app.delete('/api/teachers/:id', auth, async (req, res) => {
  await Teacher.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

// ── APPLICATIONS ──
app.get('/api/applications', auth, async (req, res) => {
  try {
    const { type } = req.query
    let filter = {}
    if (type === 'vacancy') {
      filter = { type: 'vacancy' }
    } else if (type === 'admission') {
      filter = { $or: [{ type: 'admission' }, { type: { $exists: false } }, { type: null }, { type: '' }] }
    }
    const apps = await Application.find(filter).sort({ createdAt: -1 })
    res.json(apps)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/applications', async (req, res) => {
  try {
    const body = { ...req.body }
    if (!body.type) body.type = 'admission'
    const a = await Application.create(body)
    res.json(a)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

app.put('/api/applications/:id', auth, async (req, res) => {
  const a = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(a)
})

app.delete('/api/applications/:id', auth, async (req, res) => {
  await Application.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

// ── STATS ──
app.get('/api/stats', auth, async (req, res) => {
  const [newsCount, eventsCount, teachersCount, appsCount, newApps, vacancyApps] = await Promise.all([
    News.countDocuments(),
    Event.countDocuments(),
    Teacher.countDocuments(),
    Application.countDocuments({ $or: [{ type: 'admission' }, { type: { $exists: false } }, { type: null }, { type: '' }] }),
    Application.countDocuments({ status: 'new' }),
    Application.countDocuments({ type: 'vacancy' }),
  ])
  res.json({ newsCount, eventsCount, teachersCount, appsCount, newApps, vacancyApps })
})

// ── TELEGRAM ──
app.get('/api/telegram/posts', (req, res) => {
  res.json({ posts: [
    { id: 1, text: "Qabul hujjatlari to'plami yangilandi.", date: 'Bugun', type: 'announce' },
    { id: 2, text: 'Stipendiya arizalari: 25 mart gacha.', date: 'Kecha', type: 'edu' },
    { id: 3, text: 'Ochiq eshiklar kuni — 28 mart, soat 10:00.', date: '13 mart', type: 'calendar' },
    { id: 4, text: "Yangi laboratoriya jihozlari o'rnatildi.", date: '12 mart', type: 'check' },
  ]})
})
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server ishlamoqda: http://localhost:${PORT}`))