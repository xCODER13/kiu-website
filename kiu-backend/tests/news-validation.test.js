// 1.3 (DESIGN.md 10.4): News.videoId — faqat 11 belgili YouTube ID (u ommaviy sahifada
// `youtube.com/embed/${videoId}` ga qo'yiladi), News.category — ro'yxatdan, kichik harfda saqlanadi.
const fs = require('fs')
const path = require('path')
const request = require('supertest')
const app = require('../app')
const News = require('../models/News')
const { NEWS_CATEGORIES } = require('../utils/newsCategories')
const { getAuthToken } = require('./helpers')

let auth
beforeAll(() => { auth = { Authorization: `Bearer ${getAuthToken()}` } })

const post = body => request(app).post('/api/news').set(auth).send({ title: 'Sarlavha', ...body })

describe('News.videoId', () => {
  test('11 belgili ID (harf, raqam, _ va -) qabul qilinadi; bo\'sh ham', async () => {
    expect((await post({ videoId: 'abcDEF_-123' })).status).toBe(200)
    expect((await post({ videoId: '' })).status).toBe(200)
    expect((await post({})).status).toBe(200)
  })

  test.each([
    ['qisqa', 'abc'],
    ['uzun (12)', 'abcDEF123456'],
    ['HTML/skript', '"><script>x</script>'],
    ['bo\'shliq', 'abc DEF 123'],
    ['URL', 'https://evil.example/x'],
    ['slash', 'abc/../1234'],
  ])('POST: noto\'g\'ri videoId (%s) 400 beradi va yangilik yaratilmaydi', async (_n, videoId) => {
    const res = await post({ videoId })
    expect(res.status).toBe(400)
    expect(await News.countDocuments()).toBe(0)
  })

  test("PUT: noto'g'ri videoId ham 400 (update validatorlari), hujjat o'zgarmaydi", async () => {
    const news = await News.create({ title: 'Eski', videoId: 'abcDEF_-123' })
    const res = await request(app).put(`/api/news/${news._id}`).set(auth).send({ title: 'Yangi', category: 'sport', videoId: 'x' })
    expect(res.status).toBe(400)
    expect((await News.findById(news._id)).title).toBe('Eski')
  })
})

describe('News.category', () => {
  test("bosh harfli qiymat kichik harfga keltiriladi (POST va PUT)", async () => {
    const created = await post({ category: "Ta'lim" })
    expect(created.status).toBe(200)
    expect(created.body.category).toBe("ta'lim")

    const updated = await request(app).put(`/api/news/${created.body._id}`).set(auth).send({ title: 'Y', category: 'Sport' })
    expect(updated.status).toBe(200)
    expect(updated.body.category).toBe('sport')
    expect((await News.findById(created.body._id)).category).toBe('sport')
  })

  test("kategoriya yuborilmasa — standart 'umumiy'", async () => {
    const res = await post({})
    expect(res.status).toBe(200)
    expect(res.body.category).toBe('umumiy')
  })

  test("ro'yxatda yo'q kategoriya 400 beradi (POST va PUT), yangilik o'zgarmaydi", async () => {
    expect((await post({ category: 'hujum' })).status).toBe(400)
    expect(await News.countDocuments()).toBe(0)

    const news = await News.create({ title: 'Eski', category: 'fan' })
    const res = await request(app).put(`/api/news/${news._id}`).set(auth).send({ title: 'Y', category: 'hujum' })
    expect(res.status).toBe(400)
    expect((await News.findById(news._id)).category).toBe('fan')
  })

  test("eski hujjatdagi ro'yxatdan tashqari kategoriya o'qishga ta'sir qilmaydi (tekshiruv faqat yozishda)", async () => {
    await News.collection.insertOne({ title: 'Eski yozuv', category: 'Boshqa', createdAt: new Date() })
    const res = await request(app).get('/api/news')
    expect(res.status).toBe(200)
    expect(res.body[0].category).toBe('Boshqa')
  })

  test("backend ro'yxati frontend manbalari bilan bir xil (newsCategories.js kalitlari, admin NEWS_CATEGORIES)", () => {
    const root = path.join(__dirname, '..', '..', 'src')
    const meta = fs.readFileSync(path.join(root, 'utils', 'newsCategories.js'), 'utf8')
    const block = meta.slice(meta.indexOf('const CATEGORY_META = {'), meta.indexOf('\n}\n', meta.indexOf('const CATEGORY_META = {')))
    const keys = [...block.matchAll(/^ {2}(?:"([^"]+)"|(\w+)): \{/gm)].map(m => m[1] || m[2])
    expect(keys.length).toBeGreaterThan(0)
    expect([...keys].sort()).toEqual([...NEWS_CATEGORIES].sort())

    const adminSrc = fs.readFileSync(path.join(root, 'pages', 'admin', 'shared', 'constants.js'), 'utf8')
    const arr = adminSrc.match(/export const NEWS_CATEGORIES = \[(.*?)\]/)[1]
    const adminLabels = [...arr.matchAll(/"([^"]+)"|'([^']+)'/g)].map(m => (m[1] || m[2]).toLowerCase())
    expect([...adminLabels].sort()).toEqual([...NEWS_CATEGORIES].sort())
  })
})
