import { describe, it, expect, vi } from 'vitest'
import { API, H, HF, installUnauthorizedHandler } from './api'

describe('admin api helpers', () => {
  it('API — VITE_API_URL + /api', () => expect(API).toBe('http://api.test/api'))

  it('H() — JSON header va joriy token', () => {
    localStorage.setItem('kiu_token', 'tok1')
    expect(H()).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer tok1' })
    localStorage.setItem('kiu_token', 'tok2')
    expect(H().Authorization).toBe('Bearer tok2') // har chaqiruvda yangidan o'qiladi
  })

  it('HF() — Content-Type YO\'Q (multipart boundary brauzerga qoladi)', () => {
    localStorage.setItem('kiu_token', 'tok1')
    const h = HF()
    expect(h).toEqual({ Authorization: 'Bearer tok1' })
    expect(h).not.toHaveProperty('Content-Type')
  })

  it('token yo\'q — Authorization headeri umuman yuborilmaydi', () => {
    expect(H()).toEqual({ 'Content-Type': 'application/json' })
    expect(HF()).toEqual({})
  })
})

describe('installUnauthorizedHandler', () => {
  const setup = status => {
    const fake = vi.fn(() => Promise.resolve({ status }))
    vi.stubGlobal('fetch', fake)
    const cb = vi.fn()
    const cleanup = installUnauthorizedHandler(cb)
    return { fake, cb, cleanup }
  }
  const authed = { headers: { Authorization: 'Bearer t' } }

  it('API dan 401 (Authorization bilan) — token o\'chadi, callback chaqiriladi, javob qaytadi', async () => {
    localStorage.setItem('kiu_token', 't')
    const { cb } = setup(401)
    const res = await fetch(`${API}/news`, authed)
    expect(res.status).toBe(401)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('kiu_token')).toBeNull()
  })

  it('401 bo\'lmasa — hech narsa qilmaydi', async () => {
    localStorage.setItem('kiu_token', 't')
    const { cb } = setup(200)
    await fetch(`${API}/news`, authed)
    expect(cb).not.toHaveBeenCalled()
    expect(localStorage.getItem('kiu_token')).toBe('t')
  })

  it('500 va 403 sessiyani tugatmaydi', async () => {
    localStorage.setItem('kiu_token', 't')
    for (const s of [403, 500]) {
      const { cb } = setup(s)
      await fetch(`${API}/news`, authed)
      expect(cb).not.toHaveBeenCalled()
    }
    expect(localStorage.getItem('kiu_token')).toBe('t')
  })

  it('Authorization\'siz 401 (masalan login) e\'tiborga olinmaydi', async () => {
    const { cb } = setup(401)
    await fetch(`${API}/admin/login`, { method: 'POST' })
    expect(cb).not.toHaveBeenCalled()
  })

  it('begona domendan 401 — tokenni o\'chirmaydi', async () => {
    localStorage.setItem('kiu_token', 't')
    const { cb } = setup(401)
    await fetch('https://third.party/x', authed)
    expect(cb).not.toHaveBeenCalled()
    expect(localStorage.getItem('kiu_token')).toBe('t')
  })

  it('cleanup asl fetch ni tiklaydi', () => {
    const original = vi.fn()
    vi.stubGlobal('fetch', original)
    const cleanup = installUnauthorizedHandler(() => {})
    expect(window.fetch).not.toBe(original)
    cleanup()
    expect(window.fetch).toBe(original)
  })
})
