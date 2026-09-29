import { describe, it, expect } from 'vitest'
import {
  LANGS, DEFAULT_LANG, TRANSLATED_PATHS,
  getLangFromPath, stripLangPrefix, localizePath, localizeTo, switchLangPath,
} from './locale'

describe('getLangFromPath', () => {
  it.each([
    ['/', 'uz'], ['/about', 'uz'], ['/news/123', 'uz'], ['/admin', 'uz'],
    ['/en', 'en'], ['/en/', 'en'], ['/en/about', 'en'], ['/en/news/123', 'en'],
  ])('%s → %s', (path, lang) => {
    expect(getLangFromPath(path)).toBe(lang)
  })

  it("prefiksga o'xshash, lekin til bo'lmagan yo'llarni tilga chalkashtirmaydi", () => {
    expect(getLangFromPath('/english')).toBe('uz')
    expect(getLangFromPath('/entrance')).toBe('uz')
    expect(getLangFromPath('/news/en')).toBe('uz')
  })

  it("argumentsiz chaqirilganda standart til", () => {
    expect(getLangFromPath()).toBe(DEFAULT_LANG)
  })
})

describe('stripLangPrefix', () => {
  it.each([
    ['/en', '/'], ['/en/', '/'], ['/en/about', '/about'], ['/en/news/5', '/news/5'],
    ['/about', '/about'], ['/', '/'], ['/english', '/english'],
  ])('%s → %s', (input, expected) => {
    expect(stripLangPrefix(input)).toBe(expected)
  })
})

describe('localizePath', () => {
  it("inglizchada ichki yo'llarga /en qo'shadi, bosh sahifa /en bo'ladi", () => {
    expect(localizePath('/', 'en')).toBe('/en')
    expect(localizePath('/faculty', 'en')).toBe('/en/faculty')
    expect(localizePath('/news/abc', 'en')).toBe('/en/news/abc')
  })

  it("o'zbekchada prefikssiz qoladi va mavjud /en prefiksini olib tashlaydi", () => {
    expect(localizePath('/faculty', 'uz')).toBe('/faculty')
    expect(localizePath('/en/faculty', 'uz')).toBe('/faculty')
    expect(localizePath('/en', 'uz')).toBe('/')
  })

  it("idempotent: allaqachon prefiksli yo'lga ikkinchi marta /en qo'shmaydi", () => {
    expect(localizePath('/en/faculty', 'en')).toBe('/en/faculty')
    expect(localizePath(localizePath('/faq', 'en'), 'en')).toBe('/en/faq')
  })

  it("?query va #hash saqlanadi", () => {
    expect(localizePath('/news?cat=sport#top', 'en')).toBe('/en/news?cat=sport#top')
    expect(localizePath('/?x=1', 'en')).toBe('/en?x=1')
    expect(localizePath('/en/news?cat=sport', 'uz')).toBe('/news?cat=sport')
  })

  it("/admin hech qachon tilga bog'lanmaydi", () => {
    expect(localizePath('/admin', 'en')).toBe('/admin')
    expect(localizePath('/admin/login', 'en')).toBe('/admin/login')
    // /administrator kabi o'xshash yo'l esa oddiy sahifa
    expect(localizePath('/administrator', 'en')).toBe('/en/administrator')
  })

  it("tashqi URL, protokolsiz URL, hash-only va nisbiy yo'llarga tegmaydi", () => {
    expect(localizePath('https://t.me/kiu_uz', 'en')).toBe('https://t.me/kiu_uz')
    expect(localizePath('//cdn.example.com/a.js', 'en')).toBe('//cdn.example.com/a.js')
    expect(localizePath('#apply', 'en')).toBe('#apply')
    expect(localizePath('mailto:info@kiu.uz', 'en')).toBe('mailto:info@kiu.uz')
    expect(localizePath('news', 'en')).toBe('news')
  })

  it("noma'lum til uchun standart (prefikssiz) yo'l qaytadi", () => {
    expect(localizePath('/faq', 'de')).toBe('/faq')
  })

  it("string bo'lmagan qiymatni o'zgartirmaydi", () => {
    expect(localizePath(undefined, 'en')).toBeUndefined()
    expect(localizePath(5, 'en')).toBe(5)
  })
})

describe('localizeTo', () => {
  it("{ pathname, search } obyektida faqat pathname'ni moslaydi", () => {
    expect(localizeTo({ pathname: '/news', search: '?a=1' }, 'en')).toEqual({ pathname: '/en/news', search: '?a=1' })
  })
  it("string va boshqa turlar", () => {
    expect(localizeTo('/faq', 'en')).toBe('/en/faq')
    expect(localizeTo(-1, 'en')).toBe(-1)
    expect(localizeTo({ search: '?a=1' }, 'en')).toEqual({ search: '?a=1' })
  })
})

describe('switchLangPath', () => {
  it("joriy sahifaning boshqa tildagi ekvivalentini beradi", () => {
    expect(switchLangPath('/faculty', 'en')).toBe('/en/faculty')
    expect(switchLangPath('/en/faculty', 'uz')).toBe('/faculty')
    expect(switchLangPath('/', 'en')).toBe('/en')
    expect(switchLangPath('/en', 'uz')).toBe('/')
    expect(switchLangPath('/en/news/42', 'uz')).toBe('/news/42')
  })
})

describe('konfiguratsiya', () => {
  it("standart til LANGS ichida; TRANSLATED_PATHS faqat '/' bilan boshlanadi", () => {
    expect(LANGS).toContain(DEFAULT_LANG)
    for (const p of TRANSLATED_PATHS) expect(p.startsWith('/')).toBe(true)
  })
})
