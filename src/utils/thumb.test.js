import { describe, it, expect } from 'vitest'
import { thumbUrl } from './thumb'

const BASE = 'https://abc.supabase.co/storage/v1/object/public/uploads'

describe('thumbUrl (backend 2.2 nom qoidasi)', () => {
  it.each(['news', 'events', 'teachers', 'gallery'])("%s/ ostidagi o'z Storage URL'iga `.thumb.webp` qo'shadi", folder => {
    expect(thumbUrl(`${BASE}/${folder}/1a2b-rasm.png`)).toBe(`${BASE}/${folder}/1a2b-rasm.png.thumb.webp`)
  })

  it("kodlangan fayl nomini o'zgartirmaydi", () => {
    expect(thumbUrl(`${BASE}/news/a%20b.jpg`)).toBe(`${BASE}/news/a%20b.jpg.thumb.webp`)
  })

  it.each([
    ['tashqi URL', 'https://example.com/rasm.png'],
    ['lokal rasm', '/gallery/2-kampus.png'],
    ['blob', 'blob:https://kiu.uz/1234'],
    ['data', 'data:image/png;base64,AAAA'],
    ['begona papka', `${BASE}/other/x.png`],
    ['ichma-ich papka', `${BASE}/news/a/x.png`],
    ['query bilan', `${BASE}/news/x.png?v=1`],
    ['allaqachon thumbnail', `${BASE}/news/x.png.thumb.webp`],
    ['bo\'sh', ''],
    ['null', null],
    ['undefined', undefined],
    ['massiv', [`${BASE}/news/x.png`]],
  ])('%s -> null', (_, v) => {
    expect(thumbUrl(v)).toBeNull()
  })
})
