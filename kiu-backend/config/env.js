// ── STARTUP ENV VALIDATSIYASI ──
// Muammo: avval JWT_SECRET yoki MONGODB_URI kabi kritik o'zgaruvchilar yo'qligi
// faqat BIRINCHI so'rov kelganda, tushunarsiz xato bilan namoyon bo'lardi.
// Endi server ishga tushishning boshidayoq tekshiradi — noto'g'ri deploy
// darhol, aniq xabar bilan aniqlanadi (server umuman ishga tushmaydi).

const REQUIRED = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME']

// Bular bo'lmasa ham server ishlaydi, lekin tegishli funksiyalar (Supabase upload,
// Telegram xabarnoma) jimgina ishlamay qoladi — shuning uchun faqat ogohlantirish.
const RECOMMENDED = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'FRONTEND_URL']

const JWT_SECRET_MIN_LENGTH = 32

// .env.example'dagi namuna matn — agar kimdir shuni o'zgartirmasdan nusxalab qo'ysa,
// "mavjud" deb hisoblanib o'tib ketmasligi kerak.
const KNOWN_PLACEHOLDERS = [
  'bu_yerga_kamida_64_belgili_tasodifiy_matn_kiriting_masalan_openssl_rand',
]

// `exit` parametr sifatida in'ektsiya qilinadi — shu tufayli funksiya unit test
// qilinganda haqiqiy process.exit() chaqirilib, jest process'ini o'ldirmaydi.
// Testda: validateEnv(logger, jest.fn()) deb chaqirib, chaqirilganini tekshirish mumkin.
function validateEnv(logger, exit = process.exit) {
  // Bu bosqichda logger hali ishlamagan bo'lishi mumkin — shuning uchun
  // ham console.error, ham logger (agar berilgan bo'lsa) ishlatiladi.
  function fail(message) {
    console.error(`[FATAL] ${message}`)
    console.error('Server ishga tushirilmaydi. .env faylini (yoki Render Environment sozlamalarini) tekshiring.')
    exit(1)
  }

  const missing = REQUIRED.filter(key => !process.env[key])
  if (missing.length > 0) {
    fail(`Kritik environment o'zgaruvchilar topilmadi: ${missing.join(', ')}`)
    return // exit mock qilingan testlarda kod pastga davom etib ketmasin
  }

  // JWT_SECRET mavjudligi yetarli emas — zaif yoki placeholder qiymat bilan
  // server "muvaffaqiyatli" ishga tushib, xavfsiz bo'lmagan tokenlar chiqarishi mumkin.
  if (KNOWN_PLACEHOLDERS.includes(process.env.JWT_SECRET)) {
    fail('JWT_SECRET .env.example dagi namuna qiymat bilan bir xil — buni haqiqiy tasodifiy matn bilan almashtiring (masalan: openssl rand -hex 64)')
    return
  }

  if (process.env.JWT_SECRET.length < JWT_SECRET_MIN_LENGTH) {
    fail(`JWT_SECRET juda qisqa (${process.env.JWT_SECRET.length} belgi) — kamida ${JWT_SECRET_MIN_LENGTH} belgi bo'lishi kerak`)
    return
  }

  const missingRecommended = RECOMMENDED.filter(key => !process.env[key])
  if (missingRecommended.length > 0 && logger) {
    logger.warn(
      { missing: missingRecommended },
      "Tavsiya etilgan environment o'zgaruvchilar yo'q — mos funksiyalar (Supabase/Telegram) ishlamasligi mumkin"
    )
  }
}

module.exports = { validateEnv }