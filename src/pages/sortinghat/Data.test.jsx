import { describe, it, expect } from 'vitest'
import { QUESTIONS, FACULTIES } from './Data'

// Ma'lumot yaxlitligi: ball kaliti FACULTIES da bo'lmasa, natija sahifasi
// o'sha yo'nalishni jimgina tashlab yuboradi (ResultStage: `if (!fac) return null`).
describe('Sorting Hat ma\'lumotlari', () => {
  it('savollar bor, har birida 4 ta variant', () => {
    expect(QUESTIONS.length).toBeGreaterThan(0)
    for (const q of QUESTIONS) { expect(q.q).toBeTruthy(); expect(q.opts).toHaveLength(4) }
  })
  it('savol id lari noyob', () => {
    const ids = QUESTIONS.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('har variantda musbat ballar berilgan', () => {
    for (const q of QUESTIONS) for (const o of q.opts) {
      expect(o.t).toBeTruthy()
      const vals = Object.values(o.s)
      expect(vals.length).toBeGreaterThan(0)
      vals.forEach(v => expect(v).toBeGreaterThan(0))
    }
  })
  it('barcha ball kalitlari FACULTIES da mavjud', () => {
    const keys = new Set(QUESTIONS.flatMap(q => q.opts.flatMap(o => Object.keys(o.s))))
    for (const k of keys) expect(FACULTIES, `noma'lum yo'nalish kaliti: ${k}`).toHaveProperty(k)
  })
  it('har yo\'nalishda name, desc, career, subjects, color', () => {
    for (const [k, f] of Object.entries(FACULTIES)) {
      expect(f.name, k).toBeTruthy(); expect(f.desc, k).toBeTruthy()
      expect(f.career.length, k).toBeGreaterThan(0); expect(f.subjects.length, k).toBeGreaterThan(0)
      expect(f.color, k).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
  it('ilova top-3 uchun kamida 3 ta yo\'nalish mavjud', () => {
    expect(Object.keys(FACULTIES).length).toBeGreaterThanOrEqual(3)
  })
})
