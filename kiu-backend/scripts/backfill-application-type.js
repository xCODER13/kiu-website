// ── BIR MARTALIK MIGRATSIYA ──
// Muammo: Application kolleksiyasiga 'type' maydoni keyinroq qo'shilgan, shuning uchun
// undan oldin yaratilgan hujjatlarda bu maydon umuman yo'q. server.js shu sababli
// $or bilan murakkab so'rov yozishga majbur bo'lgan.
// Bu skript 'type' yo'q/null/bo'sh barcha hujjatlarga type:'admission' yozadi.
//
// ISHGA TUSHIRISH:
//   cd kiu-backend
//   node scripts/backfill-application-type.js

require('dotenv').config()
const dns = require('dns')
const mongoose = require('mongoose')
const Application = require('../models/Application')

// Ba'zi tarmoqlarda mongodb+srv:// uchun kerak bo'ladigan DNS SRV so'rovi
// bloklanadi (ECONNREFUSED querySrv xatosi) — Node.js'ni Google/Cloudflare
// DNS orqali qidirishga majburlaymiz.
dns.setServers(['8.8.8.8', '1.1.1.1'])

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI topilmadi — .env faylini tekshiring.')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB ulandi:', mongoose.connection.name)

  const legacyFilter = { $or: [{ type: { $exists: false } }, { type: null }, { type: '' }] }

  const before = await Application.countDocuments(legacyFilter)
  console.log(`'type' maydoni yo'q/bo'sh hujjatlar soni: ${before}`)

  if (before === 0) {
    console.log('Yangilash kerak emas — barcha hujjatlarda type maydoni allaqachon bor.')
    await mongoose.disconnect()
    return
  }

  const result = await Application.updateMany(legacyFilter, { $set: { type: 'admission' } })
  console.log(`Yangilandi: ${result.modifiedCount} ta hujjat -> type: 'admission'`)

  const after = await Application.countDocuments(legacyFilter)
  console.log(`Tekshiruv — qolgan legacy hujjatlar (0 bo'lishi kerak): ${after}`)

  await mongoose.disconnect()
}

run().catch(e => {
  console.error('Migratsiya xatosi:', e)
  process.exit(1)
})