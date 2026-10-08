// Admin JWT tokenlarini bekor qilish (revocation) uchun markaziy joy.
//
// Muammo: JWT 7 kun amal qiladi va server holat saqlamaydi. Token o'g'irlansa, parol
// almashtirilmaguncha uni to'xtatishning yo'li yo'q edi. Yechim: «shu vaqtdan oldin
// chiqarilgan tokenlar yaroqsiz» degan chegara (cutoff) vaqtlari `settings` kolleksiyasida
// saqlanadi va `auth` middleware tokenning `iat` (soniyada) claim'ini ular bilan solishtiradi.
//
//   admin_password_changed_at  — parol almashtirilgan vaqt (iat < chegara => rad)
//   admin_tokens_valid_after   — «barcha qurilmalardan chiqish» vaqti (iat <= chegara => rad)
//
// Nega DB'dan o'qiladi: ilgari chegara faqat process.env'da edi, ya'ni har bir server
// instance'da alohida. Render'da bir nechta instance bo'lsa yoki qayta ishga tushsa, boshqa
// instance'lar bekor qilishni bilmay qolardi. Endi har instance DB'dagi qiymatni o'qiydi.
//
// Nega kesh: `auth` har so'rovda ishlaydi — har safar DB'ga bormaslik uchun natija
// CACHE_TTL_MS davomida xotirada turadi. Shu instance'ning o'z o'zgarishlari (logout-all,
// parol almashtirish) darhol ta'sir qiladi; BOSHQA instance'larda kechikish eng ko'pi bilan
// CACHE_TTL_MS (30 soniya).
//
// DB vaqtincha ishlamasa: oxirgi ma'lum kesh (va env'dagi qiymat) bilan davom etamiz.
// Token imzosi baribir tekshiriladi, faqat bekor qilish shu paytda kechikishi mumkin.
const mongoose = require('mongoose')
const logger = require('../logger')

const CACHE_TTL_MS = 30 * 1000
const RETRY_AFTER_FAILURE_MS = 5 * 1000
const KEY_PASSWORD_CHANGED_AT = 'admin_password_changed_at'
const KEY_TOKENS_VALID_AFTER = 'admin_tokens_valid_after'

let cache = { loadedAt: 0, passwordChangedAt: null, tokensValidAfter: null }
let inflight = null

const settings = () => mongoose.connection.db.collection('settings')

function toSeconds(value) {
  if (!value) return null
  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null
}

// Ikki ISO satrdan kattasi (bir xil formatdagi ISO satrlar leksikografik tartiblanadi).
const laterOf = (a, b) => (a && b ? (a > b ? a : b) : a || b || null)

async function loadFromDb() {
  const docs = await settings().find({ key: { $in: [KEY_PASSWORD_CHANGED_AT, KEY_TOKENS_VALID_AFTER] } }).toArray()
  const byKey = Object.fromEntries(docs.map(d => [d.key, d.value]))
  // Kesh orqaga ketmasligi uchun (masalan, shu instance'da hozirgina yozilgan qiymat bor,
  // lekin o'qish undan oldin boshlangan bo'lsa) — kattasini saqlaymiz.
  cache = {
    loadedAt: Date.now(),
    passwordChangedAt: laterOf(byKey[KEY_PASSWORD_CHANGED_AT] || null, cache.passwordChangedAt),
    tokensValidAfter: laterOf(byKey[KEY_TOKENS_VALID_AFTER] || null, cache.tokensValidAfter),
  }
}

async function ensureFresh() {
  if (Date.now() - cache.loadedAt < CACHE_TTL_MS) return
  // Bir vaqtda kelgan ko'p so'rov bitta DB o'qishini bo'lishadi.
  if (!inflight) {
    inflight = loadFromDb()
      .catch(e => {
        logger.warn({ err: e }, "Admin sessiya chegaralarini DB'dan o'qib bo'lmadi — keshlangan qiymat ishlatilmoqda")
        // Har so'rovda DB'ni urmaslik uchun qisqa pauzadan keyin qayta urinamiz.
        cache.loadedAt = Date.now() - (CACHE_TTL_MS - RETRY_AFTER_FAILURE_MS)
      })
      .finally(() => { inflight = null })
  }
  await inflight
}

// Tokenni rad etish chegaralari (soniyada). Hech biri o'rnatilmagan bo'lsa — null.
async function getCutoffs() {
  await ensureFresh()
  // Env qiymati (shu instance'da change-password darhol yozadi; .env'da qo'lda berilgan bo'lishi
  // ham mumkin, formati ISO bo'lmasligi mumkin) soniyaga o'tkazib solishtiriladi.
  const fromEnv = toSeconds(process.env.ADMIN_PASSWORD_CHANGED_AT)
  const fromDb = toSeconds(cache.passwordChangedAt)
  return {
    passwordChangedSec: fromEnv != null && fromDb != null ? Math.max(fromEnv, fromDb) : fromEnv ?? fromDb,
    tokensValidAfterSec: toSeconds(cache.tokensValidAfter),
  }
}

// `iat` chegaradan oldin chiqarilganmi? Parol o'zgarishida `iat < chegara` (yangi parol bilan
// shu soniyada kirgan token yaroqli), logout-all'da `iat <= chegara` (so'rovni yuborgan token
// ham yaroqsiz bo'lishi uchun). Natijada logout-all'dan keyin 1 soniya ichida olingan token
// ham rad etiladi — foydalanuvchi qayta kirishi uchun bu sezilarsiz.
function revocationReason(iat, { passwordChangedSec, tokensValidAfterSec }) {
  if (passwordChangedSec != null && iat < passwordChangedSec) return 'password_changed'
  if (tokensValidAfterSec != null && iat <= tokensValidAfterSec) return 'logged_out_everywhere'
  return null
}

// Hozirgacha chiqarilgan HAMMA admin tokenlarini bekor qiladi.
async function revokeAllTokens() {
  const at = new Date().toISOString()
  // $max — soati orqada qolgan instance chegarani orqaga surib yubormasligi uchun.
  await settings().updateOne({ key: KEY_TOKENS_VALID_AFTER }, { $max: { value: at } }, { upsert: true })
  cache.tokensValidAfter = laterOf(cache.tokensValidAfter, at)
  return at
}

// Testlar va qo'lda tozalash uchun.
function resetCache() {
  cache = { loadedAt: 0, passwordChangedAt: null, tokensValidAfter: null }
  inflight = null
}

module.exports = { getCutoffs, revocationReason, revokeAllTokens, resetCache, CACHE_TTL_MS }
