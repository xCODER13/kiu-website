// Mongoose 9 `new` / `returnOriginal` opsiyalarini eskirgan deb ogohlantiradi (5.8).
// Kod yangi `returnDocument: 'after'` ga o'tkazilgan — bu test eskisining qaytib kelishini ushlaydi.
const fs = require('fs')
const path = require('path')

const DIRS = ['controllers', 'services', 'middleware', 'routes', 'utils']

function sources() {
  return DIRS.flatMap(dir => {
    const abs = path.join(__dirname, '..', dir)
    return fs.readdirSync(abs).filter(f => f.endsWith('.js')).map(f => ({ file: `${dir}/${f}`, code: fs.readFileSync(path.join(abs, f), 'utf8') }))
  })
}

describe('eskirgan Mongoose opsiyalari', () => {
  test.each([['new: true', /\bnew:\s*(true|false)\b/], ['returnOriginal', /\breturnOriginal\b/]])('%s ishlatilmaydi', (_name, re) => {
    const offenders = sources().filter(s => re.test(s.code)).map(s => s.file)
    expect(offenders).toEqual([])
  })
})
