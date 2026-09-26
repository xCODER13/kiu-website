// ── TEST BAZASI XAVFSIZLIK TO'SIG'I ──
// tests/setup.js har testdan keyin barcha kolleksiyalarga deleteMany({}) va oxirida
// dropDatabase() chaqiradi. Noto'g'ri sozlangan URI (masalan production Atlas)
// bilan ishga tushirilsa, haqiqiy ma'lumotlar o'chib ketardi. Shuning uchun URI
// faqat lokal host va "-test" bilan tugaydigan baza nomiga ruxsat beradi.
const ALLOWED_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]', 'mongo-test'])

function assertSafeTestUri(uri) {
  let parsed
  try {
    parsed = new URL(uri)
  } catch {
    throw new Error(`Test MongoDB URI noto'g'ri formatda (yoki bir nechta host ko'rsatilgan): ${maskUri(uri)}`)
  }

  if (parsed.protocol !== 'mongodb:') {
    throw new Error(`Test MongoDB URI faqat "mongodb://" bo'lishi kerak ("mongodb+srv://" Atlas uchun — ruxsat yo'q): ${maskUri(uri)}`)
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`Test MongoDB hosti lokal bo'lishi shart (127.0.0.1/localhost/mongo-test), lekin: "${parsed.hostname}"`)
  }
  const dbName = parsed.pathname.replace(/^\//, '')
  if (!/-test$/.test(dbName)) {
    throw new Error(`Test bazasi nomi "-test" bilan tugashi shart (masalan kiu-test), lekin: "${dbName}"`)
  }
  return uri
}

// Xato xabariga parol tushib qolmasligi uchun user:parol qismini yashiramiz.
function maskUri(uri) {
  return String(uri).replace(/\/\/[^@/]*@/, '//***@')
}

module.exports = { assertSafeTestUri }
