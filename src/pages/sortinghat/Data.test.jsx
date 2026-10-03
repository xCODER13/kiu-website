import { describe, it, expect } from 'vitest'
import { QUESTIONS, FACULTIES, RANKS } from './Data'
import uz from '../../i18n/locales/uz.json'
import en from '../../i18n/locales/en.json'

// Ma'lumot yaxlitligi: ball kaliti FACULTIES da bo'lmasa, natija sahifasi
// o'sha yo'nalishni jimgina tashlab yuboradi (ResultStage: `if (!fac) return null`).
describe('Sorting Hat ma\'lumotlari', () => {
  it('savollar bor, har birida 4 ta variant', () => {
    expect(QUESTIONS.length).toBeGreaterThan(0)
    for (const q of QUESTIONS) expect(q.opts).toHaveLength(4)
  })
  it('savol id lari noyob', () => {
    const ids = QUESTIONS.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('har variantda musbat ballar berilgan', () => {
    for (const q of QUESTIONS) for (const o of q.opts) {
      const vals = Object.values(o.s)
      expect(vals.length).toBeGreaterThan(0)
      vals.forEach(v => expect(v).toBeGreaterThan(0))
    }
  })
  it('barcha ball kalitlari FACULTIES da mavjud', () => {
    const keys = new Set(QUESTIONS.flatMap(q => q.opts.flatMap(o => Object.keys(o.s))))
    for (const k of keys) expect(FACULTIES, `noma'lum yo'nalish kaliti: ${k}`).toHaveProperty(k)
  })
  it('har yo\'nalishda name, desc, career, subjects (rang maydoni yo\'q — 6.19)', () => {
    for (const [k, f] of Object.entries(FACULTIES)) {
      expect(f.name, k).toBeTruthy()
      expect(f, k).not.toHaveProperty('color')
      expect(f, k).not.toHaveProperty('grad')
      for (const [lang, loc] of Object.entries({ uz, en })) {
        const t = loc.sortingHat.faculties[k]
        expect(t?.name, `${lang}.${k}.name`).toBeTruthy(); expect(t?.desc, `${lang}.${k}.desc`).toBeTruthy()
        expect(t?.career.length, `${lang}.${k}.career`).toBeGreaterThan(0); expect(t?.subjects.length, `${lang}.${k}.subjects`).toBeGreaterThan(0)
      }
    }
  })
  it("matnlar (savol, variant, yo'nalish, o'rin) uz va en da to'liq", () => {
    for (const [lang, loc] of Object.entries({ uz, en })) {
      for (const q of QUESTIONS) {
        const t = loc.sortingHat.questions[q.id]
        expect(t?.q, `${lang} q${q.id}`).toBeTruthy()
        for (const o of q.opts) expect(t?.opts[o.id], `${lang} q${q.id}.${o.id}`).toBeTruthy()
      }
      for (const r of RANKS) expect(loc.sortingHat.result.ranks[r], `${lang} rank ${r}`).toBeTruthy()
    }
  })
  it("backend'ga yuboriladigan nom (FACULTIES.name) o'zbekcha tarjima bilan bir xil (admin statistikasi buzilmasin)", () => {
    for (const [k, f] of Object.entries(FACULTIES)) expect(uz.sortingHat.faculties[k].name, k).toBe(f.name)
  })
  it('ilova top-3 uchun kamida 3 ta yo\'nalish mavjud', () => {
    expect(Object.keys(FACULTIES).length).toBeGreaterThanOrEqual(3)
  })
})
