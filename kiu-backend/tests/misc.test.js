const request = require('supertest')
const app = require('../app')

describe('Misc / infra', () => {
  test('GET /health status ok qaytaradi', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(typeof res.body.uptime).toBe('number')
  })

  test("mavjud bo'lmagan route 404 qaytaradi (global notFound handler)", async () => {
    const res = await request(app).get('/api/mavjud-emas')
    expect(res.status).toBe(404)
  })

  test('POST /api/sorting-hat-lead ism/telefon bo\'lmasa 400', async () => {
    const res = await request(app).post('/api/sorting-hat-lead').send({})
    expect(res.status).toBe(400)
  })

  test(
    'POST /api/sorting-hat-lead BOT_TOKEN sozlanmagan bo\'lsa ham 200 qaytaradi (sendTelegram jimgina skip qiladi)',
    async () => {
      const res = await request(app)
        .post('/api/sorting-hat-lead')
        .send({ name: 'Test', phone: '+998901234567', faculties: ['IT', 'Iqtisodiyot'] })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    }
  )

  test('GET /api/telegram/posts BOT_TOKEN sozlanmasa 500 aniq xato bilan', async () => {
    const res = await request(app).get('/api/telegram/posts')
    expect(res.status).toBe(500)
  })
})
