// ── `npm run test:docker` ──
// Test Mongo konteynerini ko'taradi (healthcheck kutiladi), Jest'ni ishga tushiradi va
// test o'tsa ham, yiqilsa ham (yoki Ctrl+C bosilsa ham) konteyner va ma'lumotni o'chiradi.
// Windows/macOS/Linux'da bir xil ishlashi uchun shell (`&&`, `$?`) emas, Node ishlatilgan.
const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const cwd = path.join(__dirname, '..')
const compose = ['compose', '-f', 'docker-compose.test.yml']
const run = (cmd, args) => spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })

// Ctrl+C bu jarayonni darhol o'ldirmasin — finally (down -v) ishlab ulgursin.
// Jest o'zi ham Ctrl+C ni oladi va to'xtaydi.
process.on('SIGINT', () => {})

// Jest o'rnatilganini Docker'ni ko'tarishdan OLDIN tekshiramiz (bekor konteyner ko'tarmaslik uchun).
// Diqqat: Jest 30 `exports` xaritasi ishlatadi, shuning uchun 'jest/bin/jest.js' EMAS,
// eksport qilingan 'jest/bin/jest' yo'li resolve qilinadi.
let jestBin
try {
  jestBin = require.resolve('jest/bin/jest', { paths: [cwd] })
} catch {
  console.error("Jest topilmadi. Avval bog'liqliklarni o'rnating:  cd kiu-backend && npm ci")
  console.error(`(qidirilgan papka: ${fs.existsSync(path.join(cwd, 'node_modules')) ? 'node_modules bor, lekin jest yo\'q' : 'node_modules yo\'q'})`)
  process.exit(1)
}

let exitCode = 1
try {
  const up = run('docker', [...compose, 'up', '-d', '--wait'])
  if (up.status !== 0) {
    console.error('Test MongoDB konteyneri ishga tushmadi. Docker ishlayaptimi?')
  } else {
    // Qo'shimcha argumentlar Jest'ga uzatiladi: npm run test:docker -- tests/news.test.js
    const jest = spawnSync(process.execPath, [jestBin, '--runInBand', ...process.argv.slice(2)], { cwd, stdio: 'inherit' })
    exitCode = jest.status ?? 1
  }
} finally {
  run('docker', [...compose, 'down', '-v', '--remove-orphans'])
}
process.exit(exitCode)