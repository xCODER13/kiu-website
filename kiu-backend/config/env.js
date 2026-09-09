// ── STARTUP ENV VALIDATSIYASI ──
// Muammo: avval JWT_SECRET yoki MONGODB_URI kabi kritik o'zgaruvchilar yo'qligi
// faqat BIRINCHI so'rov kelganda, tushunarsiz xato bilan namoyon bo'lardi.
// Endi server ishga tushishning boshidayoq tekshiradi — noto'g'ri deploy
// darhol, aniq xabar bilan aniqlanadi (server umuman ishga tushmaydi).

const REQUIRED = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME']

// Bular bo'lmasa ham server ishlaydi, lekin tegishli funksiyalar (Supabase upload,
// Telegram xabarnoma) jimgina ishlamay qoladi — shuning uchun faqat ogohlantirish.
const RECOMMENDED = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'FRONTEND_URL']

function validateEnv(logger) {
  const missing = REQUIRED.filter(key => !process.env[key])
  if (missing.length > 0) {
    // Bu bosqichda logger hali ishlamagan bo'lishi mumkin — shuning uchun
    // ham console.error, ham logger (agar berilgan bo'lsa) ishlatiladi.
    console.error(`[FATAL] Kritik environment o'zgaruvchilar topilmadi: ${missing.join(', ')}`)
    console.error('Server ishga tushirilmaydi. .env faylini (yoki Render Environment sozlamalarini) tekshiring.')
    process.exit(1)
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