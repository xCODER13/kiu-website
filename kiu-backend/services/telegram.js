const logger = require('../logger')

// Telegram HTML parse_mode uchun rasmiy hujjatda ko'rsatilgan uchta belgi:
// https://core.telegram.org/bots/api#html-style
// Tartib muhim — avval & escape qilinadi, aks holda keyingi < > escape'laridan
// hosil bo'lgan &lt; &gt; ichidagi & belgisi ikkinchi marta escape qilinib
// (&amp;lt;) natijani buzib qo'yadi.
function escapeTelegramHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

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
  } catch (e) { logger.error({ err: e }, 'Telegram xatosi') }
}

module.exports = { sendTelegram, escapeTelegramHtml }