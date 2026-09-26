// GET /api/telegram/posts — Telegram bot getUpdates orqali kanal postlarini qaytaradi.
// Telegram'ga HAQIQIY so'rov ketmaydi: global fetch mock qilinadi.
// Diqqat: viewLimiter 60 so'rov/daqiqa — bu faylda undan kam so'rov yuboriladi.
const request = require('supertest')
const app = require('../app')

const URL = '/api/telegram/posts'
const TOKEN = 'test-bot-token-123'

let fetchSpy

const post = (id, text, date = 1_700_000_000) => ({ update_id: id, channel_post: { message_id: id, text, date, chat: { username: 'kiu_channel' } } })
const telegramReplies = body => fetchSpy.mockResolvedValue({ ok: true, json: async () => body })

beforeEach(() => {
  process.env.BOT_TOKEN = TOKEN
  process.env.CHANNEL_USERNAME = 'kiu_channel'
  fetchSpy = jest.spyOn(global, 'fetch')
})

afterEach(() => {
  fetchSpy.mockRestore()
  delete process.env.BOT_TOKEN
  delete process.env.CHANNEL_USERNAME
})

describe('GET /api/telegram/posts — sozlamalar', () => {
  test.each([
    ['BOT_TOKEN', () => delete process.env.BOT_TOKEN],
    ['CHANNEL_USERNAME', () => delete process.env.CHANNEL_USERNAME],
  ])("%s yo'q bo'lsa 500 va Telegram'ga murojaat qilinmaydi", async (_name, unset) => {
    unset()
    const res = await request(app).get(URL)
    expect(res.status).toBe(500)
    expect(res.body.error).toMatch(/sozlamalari/i)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test("Telegram API'ga bot tokeni bilan getUpdates so'raladi (limit=20, faqat channel_post)", async () => {
    telegramReplies({ ok: true, result: [] })
    await request(app).get(URL)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const url = fetchSpy.mock.calls[0][0]
    expect(url).toContain(`https://api.telegram.org/bot${TOKEN}/getUpdates`)
    expect(url).toContain('limit=20')
    expect(url).toContain('channel_post')
  })
})

describe('GET /api/telegram/posts — natija', () => {
  test("postlar yangisi birinchi tartibda, kerakli maydonlar bilan qaytadi", async () => {
    telegramReplies({ ok: true, result: [post(1, 'Birinchi', 1_700_000_000), post(2, 'Ikkinchi', 1_700_100_000)] })
    const res = await request(app).get(URL)

    expect(res.status).toBe(200)
    expect(res.body.posts.map(p => p.id)).toEqual([2, 1])
    expect(res.body.posts[0]).toEqual({
      id: 2, text: 'Ikkinchi', type: 'announce',
      date: new Date(1_700_100_000 * 1000).toLocaleDateString('uz-UZ'),
    })
  })

  test("faqat oxirgi 10 ta post qaytadi (15 tadan — eng yangi 10 tasi)", async () => {
    telegramReplies({ ok: true, result: Array.from({ length: 15 }, (_, i) => post(i + 1, `Post ${i + 1}`)) })
    const res = await request(app).get(URL)

    expect(res.body.posts).toHaveLength(10)
    expect(res.body.posts[0].id).toBe(15)
    expect(res.body.posts[9].id).toBe(6)
  })

  test("matnsiz yangilanishlar (rasm, ovozli xabar, oddiy message) tashlab yuboriladi", async () => {
    telegramReplies({
      ok: true,
      result: [
        post(1, 'Matnli post'),
        { update_id: 2, channel_post: { message_id: 2, photo: [{}], date: 1_700_000_000 } },
        { update_id: 3, message: { message_id: 3, text: "Bu kanal posti emas" } },
        { update_id: 4 },
      ],
    })
    const res = await request(app).get(URL)

    expect(res.body.posts.map(p => p.id)).toEqual([1])
  })

  test("result yo'q yoki bo'sh bo'lsa posts: []", async () => {
    telegramReplies({ ok: true })
    expect((await request(app).get(URL)).body).toEqual({ posts: [] })
  })

  test("faqat o'z kanali postlari qaytadi: boshqa kanal (bot qo'shilgan) postlari filtrlanadi", async () => {
    const foreign = { update_id: 2, channel_post: { message_id: 2, text: 'Begona kanal', date: 1_700_000_000, chat: { username: 'boshqa_kanal' } } }
    const noUsername = { update_id: 3, channel_post: { message_id: 3, text: 'Private kanal', date: 1_700_000_000, chat: { id: -100123 } } }
    telegramReplies({ ok: true, result: [foreign, post(1, 'Bizniki'), noUsername] })
    const res = await request(app).get(URL)

    expect(res.body.posts.map(p => p.text)).toEqual(['Bizniki'])
  })

  test("CHANNEL_USERNAME '@' bilan va katta-kichik harfda yozilgan bo'lsa ham mos keladi", async () => {
    process.env.CHANNEL_USERNAME = '@KIU_Channel'
    telegramReplies({ ok: true, result: [post(1, 'Bizniki')] })
    const res = await request(app).get(URL)

    expect(res.body.posts).toHaveLength(1)
  })

  test("boshqa kanal postlari 10 talik limitni band qilmaydi (filtr slice'dan oldin)", async () => {
    const foreign = n => ({ update_id: 100 + n, channel_post: { message_id: 100 + n, text: `X${n}`, date: 1_700_000_000, chat: { username: 'boshqa_kanal' } } })
    telegramReplies({ ok: true, result: [post(1, 'A'), post(2, 'B'), ...Array.from({ length: 15 }, (_, i) => foreign(i))] })
    const res = await request(app).get(URL)

    expect(res.body.posts.map(p => p.text)).toEqual(['B', 'A'])
  })
})

describe('GET /api/telegram/posts — Telegram xatolari', () => {
  test("Telegram {ok: false} qaytarsa: 500 va aniq xabar", async () => {
    telegramReplies({ ok: false, description: 'Unauthorized' })
    const res = await request(app).get(URL)

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Telegram API xatosi')
  })

  test("tarmoq xatosi: 500 va xato matnida bot tokeni mijozga sizib chiqmaydi", async () => {
    fetchSpy.mockRejectedValue(new Error(`request to https://api.telegram.org/bot${TOKEN}/getUpdates failed`))
    const res = await request(app).get(URL)

    expect(res.status).toBe(500)
    expect(JSON.stringify(res.body)).not.toContain(TOKEN)
  })

  test("Telegram JSON bo'lmagan javob qaytarsa: 500, ichki xato matni chiqmaydi", async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('Unexpected token < in JSON') } })
    const res = await request(app).get(URL)

    expect(res.status).toBe(500)
    expect(JSON.stringify(res.body)).not.toMatch(/Unexpected token|SyntaxError/)
  })

  test("auth talab qilinmaydi (ochiq endpoint): tokensiz 200", async () => {
    telegramReplies({ ok: true, result: [] })
    expect((await request(app).get(URL)).status).toBe(200)
  })
})
