// Migratsiya (4.4): `type` maydoni yo'q (yoki bo'sh) eski arizalarni `type: 'admission'` qiladi.
// Sabab: statistika (`/api/stats`) faqat `type: 'admission'` ni sanaydi, ro'yxat esa shu paytgacha
// bunday hujjatlarni klient tomonida «qabul arizasi» deb hisoblagan. Idempotent — qayta ishga tushirish xavfsiz.
//
// Foydalanish (default — faqat sanaydi, hech narsa yozmaydi):
//   MONGODB_URI="mongodb+srv://..." node scripts/backfill-application-type.js           # dry-run
//   MONGODB_URI="mongodb+srv://..." node scripts/backfill-application-type.js --apply   # yozadi
// Diqqat: production bazaga ulanishdan oldin Atlas'da zaxira (snapshot) borligini tekshiring.
const mongoose = require('mongoose')

const MISSING_TYPE = { $or: [{ type: { $exists: false } }, { type: null }, { type: '' }] }

// `collection` — Mongo driver kolleksiyasi (testda ham, skriptda ham bir xil).
async function backfillApplicationType(collection, { apply = false } = {}) {
  const missing = await collection.countDocuments(MISSING_TYPE)
  if (!apply || missing === 0) return { missing, updated: 0 }
  // `updatedAt` ataylab o'zgartirilmaydi — bu texnik tuzatish, arizaga tegish emas.
  const res = await collection.updateMany(MISSING_TYPE, { $set: { type: 'admission' } })
  return { missing, updated: res.modifiedCount }
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) { console.error('MONGODB_URI berilmagan'); process.exit(1) }
  const apply = process.argv.includes('--apply')
  await mongoose.connect(uri)
  try {
    const { missing, updated } = await backfillApplicationType(mongoose.connection.db.collection('applications'), { apply })
    console.log(`type'siz arizalar: ${missing}`)
    console.log(apply ? `yangilandi: ${updated}` : "dry-run: hech narsa yozilmadi (yozish uchun --apply)")
  } finally {
    await mongoose.disconnect()
  }
}

if (require.main === module) main().catch(err => { console.error(err.message); process.exit(1) })

module.exports = { backfillApplicationType, MISSING_TYPE }
