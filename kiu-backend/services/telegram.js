const logger = require('../logger')

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

module.exports = { sendTelegram }