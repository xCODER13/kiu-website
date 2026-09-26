import { describe, it, expect } from 'vitest'
import { decodeJwtPayload, isTokenValid } from './auth'

// base64url (JWT kabi): +/ o'rniga -_, padding'siz; UTF-8 uchun
const b64url = obj => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const tok = payload => `h.${b64url(payload)}.s`
const NOW = 1_700_000_000_000

describe('decodeJwtPayload', () => {
  it('payload ni o\'qiydi', () => expect(decodeJwtPayload(tok({ username: 'admin', exp: 5 }))).toEqual({ username: 'admin', exp: 5 }))
  it('base64url (-_ belgilari, padding\'siz) bilan ishlaydi', () => {
    const p = { u: '???>>>~~~', n: 'Gʻayrat' }
    expect(decodeJwtPayload(tok(p))).toEqual(p)
  })
  it.each([null, undefined, 42, {}, '', 'abc', 'a.b', 'a.b.c.d', 'a.!!!.c', `a.${btoa('not json')}.c`, `a.${btoa('123')}.c`, `a.${btoa('null')}.c`])(
    'yaroqsiz %j → null', t => expect(decodeJwtPayload(t)).toBeNull())
})

describe('isTokenValid', () => {
  it('muddati o\'tmagan — true', () => expect(isTokenValid(tok({ exp: NOW / 1000 + 60 }), NOW)).toBe(true))
  it('muddati o\'tgan — false', () => expect(isTokenValid(tok({ exp: NOW / 1000 - 1 }), NOW)).toBe(false))
  it('aynan exp paytida — false (chegara)', () => expect(isTokenValid(tok({ exp: NOW / 1000 }), NOW)).toBe(false))
  it('exp yo\'q yoki son emas — false', () => {
    expect(isTokenValid(tok({ username: 'a' }), NOW)).toBe(false)
    expect(isTokenValid(tok({ exp: '9999999999' }), NOW)).toBe(false)
  })
  it('null/bo\'sh — false', () => { expect(isTokenValid(null)).toBe(false); expect(isTokenValid('')).toBe(false) })
  it('standart vaqt — hozirgi Date.now()', () => {
    expect(isTokenValid(tok({ exp: Math.floor(Date.now() / 1000) + 100 }))).toBe(true)
    expect(isTokenValid(tok({ exp: Math.floor(Date.now() / 1000) - 100 }))).toBe(false)
  })
})
