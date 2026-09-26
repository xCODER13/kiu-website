import { describe, it, expect } from 'vitest'
import config from './config'

describe('config', () => {
  it('kerakli bo\'limlar bor', () => {
    for (const k of ['university', 'stats', 'contact', 'social', 'telegram', 'admission', 'search'])
      expect(config).toHaveProperty(k)
  })
  it('ijtimoiy tarmoq havolalari https', () => {
    for (const url of [...Object.values(config.social), config.telegram.url])
      expect(url).toMatch(/^https:\/\//)
  })
  it('qidiruv yozuvlari: title va "/" bilan boshlanuvchi url', () => {
    expect(config.search.length).toBeGreaterThan(0)
    for (const s of config.search) {
      expect(s.title).toBeTruthy()
      expect(s.url).toMatch(/^\//)
    }
  })
  it('statistika: n va l maydonlari', () => {
    for (const s of config.stats) { expect(s.n).toBeTruthy(); expect(s.l).toBeTruthy() }
  })
  it('email formati to\'g\'ri', () => expect(config.contact.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))
})
