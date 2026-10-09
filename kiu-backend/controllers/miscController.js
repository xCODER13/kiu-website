const { fail } = require('../middleware/errorHandler')
const { sendTelegram, escapeTelegramHtml } = require('../services/telegram')
const SortingHatLead = require('../models/SortingHatLead')
const { maskPhone } = require('../utils/phone')
const { sanitizeError } = require('../utils/safeError')

async function sortingHatLead(req, res) {
  try {
    // Express 5'da body yuborilmagan (yoki JSON bo'lmagan Content-Type'li) so'rovda
    // req.body === undefined bo'ladi — destructuring TypeError berib 500 qaytarardi.
    const { name, phone, faculties } = req.body || {}
    if (!name || !phone) return res.status(400).json({ error: 'Ism va telefon kerak' })

    // faculties frontenddagi qat'iy ro'yxatdan kelishi kutiladi, lekin backend
    // uni to'g'ridan-to'g'ri API orqali yuborilgan har qanday massiv sifatida
    // ko'radi — shuning uchun bo'sh/noto'g'ri qiymatdan himoyalanamiz va har
    // bir elementni ham (name/phone kabi) Telegram HTML uchun escape qilamiz.
    const facultyList = Array.isArray(faculties) ? faculties : []
    const safeName = escapeTelegramHtml(name)
    // Telefon Telegram'ga maskalangan holda ketadi (4.3); to'liq raqam faqat DB'da
    const safePhone = escapeTelegramHtml(maskPhone(phone))
    const safeFaculties = facultyList.map(f => escapeTelegramHtml(f))

    const msg = `🎓 <b>Yo'nalishni aniqlash — yangi natija</b>\n\n👤 <b>Ism:</b> ${safeName}\n📞 <b>Telefon:</b> ${safePhone}\n\n🏆 <b>Tavsiya etilgan yo'nalishlar:</b>\n${safeFaculties.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n⏰ ${new Date().toLocaleString('uz-UZ')}`

    // Admin statistikasi (band 6) uchun DB'ga ham yoziladi — bu ATAYLAB alohida
    // try/catch ichida, asosiy oqimdan (Telegram xabari) mustaqil: bu endpoint
    // tarixida "hal qilinmagan 500" xatosi bo'lgan (tests/sorting-hat.test.js'da
    // qayd etilgan), shuning uchun statistikaga yozish muvaffaqiyatsiz bo'lsa
    // ham (masalan name/phone kutilmagan tur bo'lsa) foydalanuvchi baribir
    // muvaffaqiyatli javob olishi va Telegram xabari yuborilishi shart.
    try {
      await SortingHatLead.create({
        name: String(name),
        phone: String(phone),
        faculties: facultyList.map(f => String(f)),
      })
    } catch (dbErr) {
      req.log.error({ err: sanitizeError(dbErr) }, '[SortingHat] Statistika uchun DB yozishda xatolik')
    }

    await sendTelegram(msg)
    res.json({ success: true })
  } catch (e) {
    fail(req, res, 500, e)
  }
}

function sameChannel(chat, channel) {
  const norm = v => String(v || '').replace(/^@/, '').toLowerCase()
  return !!chat?.username && norm(chat.username) === norm(channel)
}

async function telegramPosts(req, res) {
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
      // Faqat bizning kanal: bot boshqa kanal/guruhga qo'shilsa, ularning postlari saytga chiqmasin.
      // Telegram username'ni '@'siz yuboradi, env'da esa '@kanal' yoki 'kanal' bo'lishi mumkin.
      .filter(u => u.channel_post?.text && sameChannel(u.channel_post.chat, channel))
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
    fail(req, res, 500, e)
  }
}

module.exports = { sortingHatLead, telegramPosts }