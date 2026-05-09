const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'https://kiu-university.vercel.app', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const News        = require('./models/News')
const Event       = require('./models/Event')
const Teacher     = require('./models/Teacher')
const Application = require('./models/Application')

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB ulandi'))
  .catch(err => console.log('MongoDB xatosi:', err))

// ── AUTH MIDDLEWARE ──
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token kerak' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: "Token noto'g'ri" })
  }
}

// ── AUTH ROUTES ──
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Login va parol kerak' })

  if (username !== process.env.ADMIN_USERNAME)
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" })

  let passwordOk = false
  if (process.env.ADMIN_PASSWORD_HASH) {
    passwordOk = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
  } else {
    passwordOk = password === process.env.ADMIN_PASSWORD
  }

  if (!passwordOk) return res.status(401).json({ error: "Login yoki parol noto'g'ri" })

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

app.post('/api/admin/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!newPassword || newPassword.length < 8)
    return res.status(400).json({ error: "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak" })

  let currentOk = false
  if (process.env.ADMIN_PASSWORD_HASH) {
    currentOk = await bcrypt.compare(currentPassword, process.env.ADMIN_PASSWORD_HASH)
  } else {
    currentOk = currentPassword === process.env.ADMIN_PASSWORD
  }

  if (!currentOk) return res.status(401).json({ error: "Joriy parol noto'g'ri" })

  try {
    const hash = await bcrypt.hash(newPassword, 12)
    const envPath = path.resolve(__dirname, '.env')
    let envContent = fs.readFileSync(envPath, 'utf8')

    if (envContent.includes('ADMIN_PASSWORD_HASH=')) {
      envContent = envContent.replace(/ADMIN_PASSWORD_HASH=.*/, `ADMIN_PASSWORD_HASH=${hash}`)
    } else {
      envContent += `\nADMIN_PASSWORD_HASH=${hash}`
    }
    envContent = envContent.replace(/\nADMIN_PASSWORD=.*/g, '')

    fs.writeFileSync(envPath, envContent)
    process.env.ADMIN_PASSWORD_HASH = hash
    delete process.env.ADMIN_PASSWORD

    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: "Parol o'zgartirib bo'lmadi: " + e.message })
  }
})

// ── NEWS ──
app.get('/api/news', async (req, res) => {
  try { res.json(await News.find().sort({ createdAt: -1 })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})
app.post('/api/news', auth, async (req, res) => {
  try {
    const { title, content, category, image, videoId } = req.body
    const shortsUrl = req.body.shortsUrl || req.body.shortsURL || ''
    res.json(await News.create({ title, content, category, image, shortsUrl, videoId: videoId || '' }))
  } catch (e) { res.status(400).json({ error: e.message }) }
})
app.put('/api/news/:id', auth, async (req, res) => {
  try {
    const { title, content, category, image, videoId } = req.body
    const shortsUrl = req.body.shortsUrl || req.body.shortsURL || ''
    res.json(await News.findByIdAndUpdate(req.params.id, { title, content, category, image, shortsUrl, videoId: videoId || '' }, { new: true }))
  } catch (e) { res.status(400).json({ error: e.message }) }
})
app.delete('/api/news/:id', auth, async (req, res) => {
  try { await News.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

// ── EVENTS ──
app.get('/api/events', async (req, res) => {
  try { res.json(await Event.find().sort({ createdAt: -1 })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})
app.post('/api/events', auth, async (req, res) => {
  try { res.json(await Event.create(req.body)) }
  catch (e) { res.status(400).json({ error: e.message }) }
})
app.put('/api/events/:id', auth, async (req, res) => {
  try { res.json(await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (e) { res.status(400).json({ error: e.message }) }
})
app.delete('/api/events/:id', auth, async (req, res) => {
  try { await Event.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

// ── TEACHERS ──
app.get('/api/teachers', async (req, res) => {
  try { res.json(await Teacher.find().sort({ createdAt: -1 })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})
app.post('/api/teachers', auth, async (req, res) => {
  try { res.json(await Teacher.create(req.body)) }
  catch (e) { res.status(400).json({ error: e.message }) }
})
app.put('/api/teachers/:id', auth, async (req, res) => {
  try { res.json(await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (e) { res.status(400).json({ error: e.message }) }
})
app.delete('/api/teachers/:id', auth, async (req, res) => {
  try { await Teacher.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
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
    res.json(await Application.find(filter).sort({ createdAt: -1 }))
  } catch (e) { res.status(500).json({ error: e.message }) }
})
app.post('/api/applications', async (req, res) => {
  try {
    const body = { ...req.body }
    if (!body.type) body.type = 'admission'
    res.json(await Application.create(body))
  } catch (e) { res.status(400).json({ error: e.message }) }
})
app.put('/api/applications/:id', auth, async (req, res) => {
  try { res.json(await Application.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (e) { res.status(400).json({ error: e.message }) }
})
app.delete('/api/applications/:id', auth, async (req, res) => {
  try { await Application.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

// ── STATS ──
app.get('/api/stats', auth, async (req, res) => {
  try {
    const admFilter = { $or: [{ type: 'admission' }, { type: { $exists: false } }, { type: null }, { type: '' }] }
    const [newsCount, eventsCount, teachersCount, appsCount, newApps, vacancyApps] = await Promise.all([
      News.countDocuments(),
      Event.countDocuments(),
      Teacher.countDocuments(),
      Application.countDocuments(admFilter),
      Application.countDocuments({ status: 'new' }),
      Application.countDocuments({ type: 'vacancy' }),
    ])
    res.json({ newsCount, eventsCount, teachersCount, appsCount, newApps, vacancyApps })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── TELEGRAM ──
app.get('/api/telegram/posts', async (req, res) => {
  try {
    const token = process.env.BOT_TOKEN
    const channel = process.env.CHANNEL_USERNAME
    if (!token || !channel) return res.status(500).json({ error: 'Telegram sozlamalari topilmadi' })

    const response = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates?limit=20&allowed_updates=["channel_post"]`
    )
    const data = await response.json()
    if (!data.ok) return res.status(500).json({ error: 'Telegram API xatosi' })

    const posts = (data.result || [])
      .filter(u => u.channel_post?.text)
      .slice(-10)
      .reverse()
      .map(u => ({
        id: u.channel_post.message_id,
        text: u.channel_post.text,
        date: new Date(u.channel_post.date * 1000).toLocaleDateString('uz-UZ'),
        type: 'announce',
      }))

    res.json({ posts })
  } catch (e) {
    res.status(500).json({ error: "Telegram bilan bog'lanib bo'lmadi: " + e.message })
  }
})

// ── SERVER ──
const PORT = process.env.PORT || 5000
const SELF_URL = process.env.BACKEND_URL
if (SELF_URL) {
  setInterval(async () => {
    try { await fetch(`${SELF_URL}/api/telegram/posts`); console.log('Keep-alive OK') }
    catch { console.log('Keep-alive failed') }
  }, 14 * 60 * 1000)
}

app.listen(PORT, () => console.log(`Server ishlamoqda: http://localhost:${PORT}`))