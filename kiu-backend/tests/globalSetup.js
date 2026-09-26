// Jest globalSetup — butun test to'plami boshlanishidan OLDIN, BIR MARTA test Mongo'ga
// ulanib ko'radi. Ulanmasa, 45 ta bir xil xato bloki o'rniga darhol BITTA aniq xabar
// bilan to'xtaydi (aks holda har bir test 10 soniya "buffering timed out" kutib, run
// daqiqalab cho'zilar va log yuzlab qator bo'lar edi).
const path = require('path')
const { MongoClient } = require('mongodb')
const { assertSafeTestUri } = require('./testDbGuard')

require('dotenv').config({ path: path.join(__dirname, '..', '.env.test'), quiet: true })

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = async () => {
  const uri = assertSafeTestUri(process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27018/kiu-test')
  const attempts = 30
  let lastError

  for (let i = 1; i <= attempts; i++) {
    // Har urinishda YANGI client va oxirida yopish — muvaffaqiyatsiz ulanishlar
    // keyingi urinishga ta'sir qilmasin.
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000, runtimeAdapters: { os: require('os') } })
    try {
      await client.connect()
      await client.db().command({ ping: 1 })
      return
    } catch (err) {
      lastError = err
    } finally {
      await client.close().catch(() => {})
    }
    await sleep(1000)
  }

  throw new Error(
    [
      `Test MongoDB'ga ulanib bo'lmadi (${attempts} urinishdan keyin): ${uri}`,
      `Oxirgi xato: ${lastError && lastError.message}`,
      '',
      "Tekshiring:  docker ps  |  docker logs kiu-mongo-test",
      "Konteyner yo'q bo'lsa:  npm run test:db:up   (yoki  npm run test:docker)",
    ].join('\n')
  )
}
