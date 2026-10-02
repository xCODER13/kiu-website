/* global process */
// pages.css (Bosqich 5b): token qoidasi, qatlam va inline-style/JS-hover o'rnini bosgan qoidalar.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = f => readFileSync(resolve(process.cwd(), f), 'utf8')
const css = read('src/styles/pages.css')
const code = css.replace(/\/\*[\s\S]*?\*\//g, '')

describe('pages.css', () => {
  it("hex rang yo'q; rgb faqat oq/qora + alfa (to'q yuza ustidagi matn, qoplama, soya)", () => {
    expect(code).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    const rgbs = code.match(/rgba?\([^)]*\)/g) ?? []
    expect(rgbs.every(c => /^rgb\((255 255 255|0 0 0) \//.test(c))).toBe(true)
  })

  it('hammasi `@layer components` ichida', () => {
    expect(code.trim()).toMatch(/^@layer components \{/)
    expect(code.trim()).toMatch(/\}$/)
  })

  it("outline yo'qotilmagan", () => {
    expect(code).not.toMatch(/outline:\s*(none|0)\b/)
  })

  it("faol holat atributlar bo'yicha: tab, toifa tugmasi, karusel nuqtasi", () => {
    expect(code).toMatch(/\.tab\[data-active="true"\]/)
    expect(code).toMatch(/\.news-cat\[data-active="true"\]/)
    expect(code).toMatch(/\.carousel-dot\[aria-current="true"\]/)
  })

  it("hover'lar CSS da (oldin JS `onMouseEnter/Leave` edi)", () => {
    expect(code).toMatch(/\.card\.news-card:hover \{ transform: translateY\(-4px\); box-shadow: 0 12px 32px rgb\(0 0 0 \/ 0\.12\); \}/)
    expect(code).toMatch(/\.news-card-btn:hover \{ opacity: 0\.85; \}/)
    expect(code).toMatch(/\.carousel-more:hover \{ background: rgb\(255 255 255 \/ 0\.25\); \}/)
  })

  it("karta hover'i `.card:is(.card-link):hover` dan kuchli (3 klass), shuning uchun eski inline qiymatlar saqlanadi", () => {
    expect(code).toMatch(/\.card\.news-card \{/)
    expect(code).toMatch(/\.card\.news-card:hover/)
  })

  it('keyframes: pulse global.css da, carouselFadeIn shu faylda; `<style>` teglaridan ko\'chgan', () => {
    expect(read('src/styles/global.css')).toMatch(/@keyframes pulse \{/)
    expect(code).toMatch(/@keyframes carouselFadeIn \{/)
  })

  it('uchinchi tomon brend ranglari tokendan (YouTube, Telegram) — hex tokens.css da', () => {
    expect(code).toMatch(/var\(--brand-youtube\)/)
    expect(code).toMatch(/var\(--brand-telegram\)/)
    expect(read('src/styles/tokens.css')).toMatch(/--brand-youtube:\s*#ff0000/)
  })

  it('main.jsx da components.css va site.css dan KEYIN import qilingan', () => {
    const main = read('src/main.jsx')
    const order = ['components.css', 'site.css', 'pages.css', 'global.css'].map(f => main.indexOf(f))
    expect(order.every(i => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })
})

describe('vacancies/*, news/* manba kodi (Bosqich 5b)', () => {
  const files = [
    'src/pages/Vacancies.jsx', 'src/pages/News.jsx',
    ...['InfoTab', 'ApplicationForm'].map(n => `src/pages/vacancies/${n}.jsx`),
    ...['NewsTab', 'NewsCard', 'FeaturedCarousel', 'ShortsTab', 'TelegramBanner'].map(n => `src/pages/news/${n}.jsx`),
  ]
  it("`<style>` teglari yo'q", () => {
    for (const f of files) expect(read(f), f).not.toMatch(/<style[\s>]/)
  })
  it("hex rang va rgba() qatorlari yo'q (qiymatlar CSS/token da)", () => {
    for (const f of files) {
      const src = read(f).replace(/\/\/.*$/gm, '')
      // NewsTab: 'all' toifasi uchun `#7c3aed` — 6.11 da `--chart-*` ga o'tadi (ro'yxatda alohida ko'rsatilgan)
      const hexes = (src.match(/#[0-9a-f]{3,8}\b/gi) ?? []).filter(h => !(f.endsWith('NewsTab.jsx') && h === '#7c3aed'))
      expect(hexes, f).toEqual([])
      expect(src, f).not.toMatch(/rgba?\(/)
    }
  })
  it("`onMouseEnter/Leave` faqat karusel pauzasi uchun (holat mantig'i, stil emas)", () => {
    for (const f of files) {
      const src = read(f)
      const uses = src.match(/onMouse(Enter|Leave)=\{[^}]*\}/g) ?? []
      if (f.endsWith('FeaturedCarousel.jsx')) expect(uses).toEqual(['onMouseEnter={() => setPaused(true)}', 'onMouseLeave={() => setPaused(false)}'])
      else expect(uses, f).toEqual([])
    }
  })
})

describe('Bosqich 5c: qolgan <style> teglari, JS hover va `!important`', () => {
  const global = read('src/styles/global.css').replace(/\/\*[\s\S]*?\*\//g, '')
  const site = read('src/styles/site.css').replace(/\/\*[\s\S]*?\*\//g, '')
  const tokens = read('src/styles/tokens.css')
  const exists = f => { try { readFileSync(resolve(process.cwd(), f)); return true } catch { return false } }

  it("`<style>` teglari va CSS-inject yo'q: Home, NewsDetail, Faculty, faculty-styles.js o'chirilgan", () => {
    for (const f of ['src/pages/Home.jsx', 'src/pages/NewsDetail.jsx', 'src/pages/Faculty.jsx', 'src/pages/faculty/FacultyCard.jsx', 'src/pages/QRCode.jsx'])
      expect(read(f), f).not.toMatch(/<style[\s>]|createElement\('style'\)/)
    expect(exists('src/pages/faculty/faculty-styles.js')).toBe(false)
    expect(read('src/pages/Faculty.jsx')).not.toMatch(/faculty-styles/)
  })

  it('keyframes pages.css ga ko\'chgan (Home, NewsDetail, Faculty); `spin` va `pulse` global.css da qolgan', () => {
    for (const k of ['homeCarouselFade', 'homeSkelShimmer', 'homeSectionFadeIn', 'slide-in-right', 'slide-in-left', 'cardFadeIn'])
      expect(code, k).toMatch(new RegExp(`@keyframes ${k} \\{`))
    expect(global).toMatch(/@keyframes spin \{/)
    expect(global).toMatch(/@keyframes pulse \{/)
  })

  it("Home hero qoidalari `!important`siz; qatlamsiz (global.css) bo'lgani uchun `.stats-grid` ni bosib o'tadi", () => {
    expect(read('src/pages/Home.jsx')).not.toMatch(/!important/)
    const hero = global.slice(global.indexOf('.hero-grid {'))
    expect(hero).not.toMatch(/!important/)
    expect(hero).toMatch(/\.hero-grid \.stats-grid \{ margin: 0; max-width: 480px; \}/)
    expect(hero).toMatch(/@media \(max-width: 1080px\)[\s\S]*\.hero-grid \.stats-grid \{ grid-template-columns: repeat\(2, 1fr\); max-width: 320px; \}/)
    expect(hero).toMatch(/@media \(max-width: 860px\)[\s\S]*\.hero-grid \{ grid-template-columns: 1fr; \}/)
    // HeroSection'da bu qiymatlar inline emas
    expect(read('src/pages/home/HeroSection.jsx')).not.toMatch(/gridTemplateColumns|maxWidth: 480/)
  })

  it("Faculty tab mobil qoidalari `!important`siz; `--card` (e'lon qilinmagan) o'rniga `transparent` (vizual farq 0)", () => {
    expect(code).not.toMatch(/!important/)
    expect(code).toMatch(/\.kiu-tab-wrap \{[^}]*background: transparent;/)
    expect(code).not.toMatch(/var\(--card\)/)
  })

  it("karta hover'i CSS da: `.card.faculty-card:hover` (3 klass — `.card:is([role=button]):hover` ga teng, tartib hal qiladi)", () => {
    expect(code).toMatch(/\.card\.faculty-card:hover \{[^}]*border-color: var\(--accent\);/)
  })

  it("SortingHat: tanlangan variant `data-selected`, hover `:not(:disabled, [data-selected])`; input fokusi `:focus`", () => {
    expect(code).toMatch(/\.sh-opt\[data-selected="true"\] \{/)
    expect(code).toMatch(/\.sh-opt:hover:not\(:disabled, \[data-selected="true"\]\)/)
    expect(code).toMatch(/\.sh-start:hover \{ transform: translateY\(-2px\); \}/)
    expect(code).toMatch(/\.input--lg:focus \{ border-color: var\(--color-brand\); \}/)
  })

  it("hover'lar CSS da: galereya o'qlari, orqaga tugmalari, ijtimoiy havola", () => {
    expect(code).toMatch(/\.gallery-arrow:hover \{ background: rgb\(0 0 0 \/ 0\.7\); \}/)
    expect(code).toMatch(/\.back-link:hover \{ opacity: 0\.7; \}/)
    expect(code).toMatch(/\.back-btn:hover \{ opacity: 0\.85; \}/)
    expect(code).toMatch(/\.social-link:hover \{ opacity: 0\.85; \}/)
  })

  it("`onMouseEnter/Leave/Focus/Blur` stil uchun ishlatilmaydi (Home news karuseli — faqat pauza mantig'i)", () => {
    const files = [
      'src/pages/NewsDetail.jsx', 'src/pages/QRCode.jsx', 'src/pages/faculty/FacultyCard.jsx',
      'src/pages/sortinghat/IntroStage.jsx', 'src/pages/sortinghat/QuizStage.jsx', 'src/pages/sortinghat/RegisterStage.jsx',
      'src/components/ApplyModal.jsx', 'src/components/TelegramPanel.jsx',
    ]
    for (const f of files) expect(read(f), f).not.toMatch(/onMouse(Enter|Leave)|onFocus|onBlur/)
    const carousel = read('src/pages/home/NewsCarousel.jsx').match(/onMouse(Enter|Leave)=\{[^}]*\}/g)
    expect(carousel).toEqual(['onMouseEnter={() => setPaused(true)}', 'onMouseLeave={() => setPaused(false)}'])
  })

  it("ApplyModal va TelegramPanel: inline stil yo'q, `errorBorder` ishlatilmaydi; klasslar site.css da, token orqali", () => {
    for (const f of ['src/components/ApplyModal.jsx', 'src/components/TelegramPanel.jsx']) {
      const src = read(f)
      expect(src, f).not.toMatch(/style=\{/)
      expect(src, f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    }
    expect(read('src/components/ApplyModal.jsx')).not.toMatch(/errorBorder/)
    expect(read('src/pages/sortinghat/RegisterStage.jsx')).not.toMatch(/errorBorder/)
    expect(site).toMatch(/\.modal-overlay \{[^}]*background: var\(--color-overlay\);[^}]*z-index: var\(--z-modal\);/)
    expect(site).toMatch(/\.modal-alert \{[^}]*color-mix\(in srgb, var\(--color-danger\) 8%, transparent\)/)
    // Telegram gradienti: ikkala uchi ham token (`-deep` EMAS — u boshqa qiymat, #006aa3)
    expect(site).toMatch(/\.tg-avatar \{[^}]*linear-gradient\(135deg, var\(--brand-telegram\), var\(--brand-telegram-end\)\)/)
    expect(site).toMatch(/\.tg-subscribe \{[^}]*linear-gradient\(135deg, var\(--brand-telegram\), var\(--brand-telegram-end\)\)/)
    expect(tokens).toMatch(/--brand-telegram-end:\s*#0055aa/)
    expect(tokens).toMatch(/--brand-telegram-deep:\s*#006aa3/)
  })
})
