const { fail } = require('../middleware/errorHandler')
const { sendTelegram } = require('../services/telegram')

async function sortingHatLead(req, res) {
  try {
    const { name, phone, faculties } = req.body
    if (!name || !phone) return res.status(400).json({ error: 'Ism va telefon kerak' })

    const msg = `🎓 <b>Yo'nalishni aniqlash — yangi natija</b>\n\n👤 <b>Ism:</b> ${name}\n📞 <b>Telefon:</b> ${phone}\n\n🏆 <b>Tavsiya etilgan yo'nalishlar:</b>\n${faculties.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n⏰ ${new Date().toLocaleString('uz-UZ')}`

    await sendTelegram(msg)
    res.json({ success: true })
  } catch (e) {
    fail(req, res, 500, e)
  }
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
    fail(req, res, 500, e)
  }
}

module.exports = { sortingHatLead, telegramPosts }