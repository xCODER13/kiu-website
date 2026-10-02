/* global process */
// public/theme-init.js — React yuklanishidan oldin <html data-theme> ni qo'yadi (FOUC oldini olish).
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'

const script = readFileSync(resolve(process.cwd(), 'public/theme-init.js'), 'utf8')
const run = () => new Function(script)()

describe('theme-init.js', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('saqlangan "dark" → data-theme="dark"', () => {
    localStorage.setItem('theme', 'dark')
    run()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('saqlangan "light" → data-theme="light" (tizim dark bo\'lsa ham Light ustun)', () => {
    localStorage.setItem('theme', 'light')
    run()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('saqlangan tanlov yo\'q → atribut qo\'yilmaydi (tizim sozlamasi CSS\'da)', () => {
    run()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('begona qiymat → e\'tiborga olinmaydi', () => {
    localStorage.setItem('theme', '<script>')
    run()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
