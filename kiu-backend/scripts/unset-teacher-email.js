// ── Bir martalik migratsiya: `teachers` kolleksiyasidan eski `email` maydonini o'chiradi ──
//
// Nega kerak: model/controller'dan `email` olib tashlandi, lekin Mongoose strict rejimi
// bazadagi MAVJUD qiymatlarni o'chirmaydi. Ular API javobidan yashiriladi (`.select('-email')`),
// ammo bazada qolib ketadi — shaxsiy ma'lumot, shuning uchun bir marta tozalanadi.
//
// Ishlatish (MONGODB_URI muhit o'zgaruvchisidan olinadi, hech qachon logga chiqarilmaydi):
//   node scripts/unset-teacher-email.js                              → DRY-RUN (hech narsa o'zgarmaydi)
//   node scripts/unset-teacher-email.js --apply --backup <fayl.json> → zaxira yozadi, so'ng $unset qiladi
//
// DIQQAT:
//   • O'zgarish QAYTARIB BO'LMAYDI — shuning uchun `--apply` zaxira faylsiz ishlamaydi.
//   • Zaxira fayl shaxsiy ma'lumot (email) saqlaydi: gitga TUSHIRMANG, ish tugagach xavfsiz joyda saqlang/o'chiring.
//   • Avval Atlas'da snapshot/backup olinganini tekshiring.
const fs = require('fs')
const path = require('path')

// Sinov oson bo'lishi uchun asosiy mantiq `collection` qabul qiladi (DB ulanishsiz).
async function run(collection, { apply = false, backupPath = null, log = console.log } = {}) {
  const filter = { email: { $exists: true } }
  const docs = await collection.find(filter, { projection: { _id: 1, email: 1 } }).toArray()
  const withValue = docs.filter(d => typeof d.email === 'string' && d.email.trim() !== '').length
  log(`Topildi: ${docs.length} ta hujjatda \`email\` maydoni bor (shundan ${withValue} tasida qiymat bor).`)

  if (!apply) {
    log('DRY-RUN: hech narsa o\'zgartirilmadi. Qo\'llash uchun: --apply --backup <fayl.json>')
    return { matched: docs.length, modified: 0, backedUp: false }
  }
  if (!backupPath) throw new Error('`--apply` uchun `--backup <fayl.json>` majburiy (o\'zgarish qaytarilmaydi).')
  if (docs.length === 0) { log('Tozalanadigan narsa yo\'q.'); return { matched: 0, modified: 0, backedUp: false } }

  // 'wx' — mavjud faylni ustidan yozmaydi; 0o600 — faqat egasi o'qiy oladi.
  fs.writeFileSync(backupPath, JSON.stringify(docs.map(d => ({ _id: String(d._id), email: d.email })), null, 2), { flag: 'wx', mode: 0o600 })
  log(`Zaxira yozildi: ${path.resolve(backupPath)} (${docs.length} ta yozuv). Uni gitga tushirmang!`)

  const res = await collection.updateMany(filter, { $unset: { email: '' } })
  log(`Tayyor: ${res.modifiedCount} ta hujjatdan \`email\` o'chirildi.`)
  return { matched: docs.length, modified: res.modifiedCount, backedUp: true }
}

function parseArgs(argv) {
  const apply = argv.includes('--apply')
  const i = argv.indexOf('--backup')
  const backupPath = i !== -1 ? argv[i + 1] : null
  if (i !== -1 && (!backupPath || backupPath.startsWith('--'))) throw new Error('`--backup` dan keyin fayl yo\'li kerak.')
  return { apply, backupPath }
}

async function main() {
  const mongoose = require('mongoose')
  const uri = process.env.MONGODB_URI
  if (!uri) { console.error('MONGODB_URI o\'rnatilmagan.'); process.exit(1) }
  let opts
  try { opts = parseArgs(process.argv.slice(2)) } catch (e) { console.error(e.message); process.exit(1) }
  try {
    await mongoose.connect(uri) // URI hech qayerga chiqarilmaydi
    await run(mongoose.connection.db.collection('teachers'), opts)
  } catch (e) {
    console.error('Xatolik:', e.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect().catch(() => {})
  }
}

if (require.main === module) main()

module.exports = { run, parseArgs }
