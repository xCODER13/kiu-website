const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const { v4: uuidv4 } = require('uuid')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)


const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'https://kiu-university.vercel.app', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const News        = require('./models/News')
const Event       = require('./models/Event')
const Teacher     = require('./models/Teacher')
const Application = require('./models/Application')

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB ulandi')
    const setting = await mongoose.connection.db.collection('settings').findOne({ key: 'admin_password_hash' })
    if (setting?.value) {
      process.env.ADMIN_PASSWORD_HASH = setting.value
      console.log('Admin parol hash yuklandi')
    }
  })
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
    
    await mongoose.connection.db.collection('settings').updateOne(
      { key: 'admin_password_hash' },
      { $set: { value: hash } },
      { upsert: true }
    )

    process.env.ADMIN_PASSWORD_HASH = hash
    delete process.env.ADMIN_PASSWORD

    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: "Parol o'zgartirib bo'lmadi: " + e.message })
  }
})

// ── IMAGE UPLOAD (Signed URL) ──
app.post('/api/upload/news-image', auth, async (req, res) => {
  try {
    const { fileName } = req.body
    const uniqueName = uuidv4() + '-' + (fileName || 'image')
    const { data, error } = await supabase.storage
      .from('news-images')
      .createSignedUploadUrl(uniqueName)
    if (error) throw error
    const { data: urlData } = supabase.storage.from('news-images').getPublicUrl(uniqueName)
    res.json({ signedUrl: data.signedUrl, publicUrl: urlData.publicUrl })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── NEWS ──
app.get('/api/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
    if (!news) return res.status(404).json({ error: 'Topilmadi' })
    res.json(news)
  } catch (e) { res.status(500).json({ error: e.message }) }
})
app.get('/api/news', async (req, res) => {
  try { res.json(await News.find().sort({ createdAt: -1 })) }
  catch (e) { res.status(500).json({ error: e.message }) }
})
app.post('/api/news', auth, async (req, res) => {
  try {
    const { title, content, category, videoId, shortsUrl, image } = req.body
    res.json(await News.create({ title, content, category, image: image || '', shortsUrl: shortsUrl || '', videoId: videoId || '' }))
  } catch (e) { res.status(400).json({ error: e.message }) }
})
app.put('/api/news/:id', auth, async (req, res) => {
  try {
    const { title, content, category, videoId, shortsUrl, image } = req.body
    res.json(await News.findByIdAndUpdate(req.params.id,
      { title, content, category, image: image || '', shortsUrl: shortsUrl || '', videoId: videoId || '' },
      { new: true }
    ))
  } catch (e) { res.status(400).json({ error: e.message }) }
})
app.put('/api/news/:id/view', async (req, res) => {
  try {
    await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
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
    const application = await Application.create(body)
    const isVacancy = application.type === 'vacancy'
    let msg = ""
    if (isVacancy) {
  msg = "\uD83D\uDCCB Vakansiya arizasi\n\n\uD83D\uDC64 " + application.name + "\n\uD83D\uDCDE " + application.phone
  if (application.email) msg += "\n\uD83D\uDCE7 " + application.email
  if (application.position) msg += "\n\uD83D\uDCBC " + application.position
  if (application.faculty) msg += "\n\uD83C\uDFEB " + application.faculty
  if (application.education) msg += "\n\uD83C\uDF93 " + application.education
  if (application.experience) msg += "\n\uD83D\uDCC5 " + application.experience
  if (application.message) msg += "\n\uD83D\uDCAC " + application.message.slice(0, 200)

    } else {
      msg = "\uD83C\uDF93 Qabul arizasi\n\n\uD83D\uDC64 " + application.name + "\n\uD83D\uDCDE " + application.phone
      if (application.email) msg += "\n\uD83D\uDCE7 " + application.email
      if (application.faculty) msg += "\n\uD83D\uDCDA " + application.faculty
      if (application.message) msg += "\n\uD83D\uDCAC " + application.message.slice(0, 200)
    }
    sendTelegram(msg)
    res.json(application)
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
// ── TELEGRAM NOTIFY ──
async function sendTelegram(text) {
  try {
    const token = process.env.BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (!token || !chatId) return
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    })
  } catch (e) { console.log('Telegram xatosi:', e.message) }
}

// ── SORTING HAT LEAD ──
app.post('/api/sorting-hat-lead', async (req, res) => {
  try {
    const { name, phone, faculties } = req.body
    if (!name || !phone) return res.status(400).json({ error: 'Ism va telefon kerak' })

    const msg = `🎓 <b>Yo'nalishni aniqlash — yangi natija</b>\n\n👤 <b>Ism:</b> ${name}\n📞 <b>Telefon:</b> ${phone}\n\n🏆 <b>Tavsiya etilgan yo'nalishlar:</b>\n${faculties.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n⏰ ${new Date().toLocaleString('uz-UZ')}`

    await sendTelegram(msg)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
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