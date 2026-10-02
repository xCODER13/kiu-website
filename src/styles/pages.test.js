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

  // 6.11a: `--card` (e'lon qilinmagan token) va `transparent` fon endi yo'q — tab pill'i `--color-surface-3` ustida (spec 6.11).
  it("Faculty tab: mobil qoidalar `!important`siz, `--card` ishlatilmaydi; pill `--color-surface-3` fonida", () => {
    expect(code).not.toMatch(/!important/)
    expect(code).not.toMatch(/var\(--card\)/)
    expect(code).toMatch(/\.kiu-tab-wrap \{[^}]*background: var\(--color-surface-3\);/)
  })

  // 6.11a: hover chegarasi `var(--accent)` (har yo'nalishning o'z rangi) edi; endi hamma karta bitta brand rangida.
  it("karta hover'i va fokusi CSS da: `.card.faculty-card:hover/:focus-visible` — brand chegara, `--accent` yo'q", () => {
    expect(code).toMatch(/\.card\.faculty-card:hover,\s*\.card\.faculty-card:focus-visible \{[^}]*border-color: var\(--color-brand\);/)
    expect(code).not.toMatch(/var\(--accent\)/)
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

describe('Bosqich 6.11a: umumiy ichki hero, Qabul, Yo\'nalishlar', () => {
  const tokens = read('src/styles/tokens.css')
  const global = read('src/styles/global.css').replace(/\/\*[\s\S]*?\*\//g, '')
  const inline = f => (read(f).match(/style=\{\{/g) ?? []).length

  it("hero `.inner-hero`: nuqtali qatlam (`::before`), pastda so'nish (`::after`), h1 `clamp` ≤ 3rem/800, ta'rif 1.125rem", () => {
    expect(code).toMatch(/\.inner-hero \{[^}]*background-image: var\(--gradient-hero-glow\);/)
    expect(code).toMatch(/\.inner-hero::before \{[^}]*var\(--hero-dot\)/)
    expect(code).toMatch(/\.inner-hero::after \{[^}]*var\(--color-bg\)/)
    expect(code).toMatch(/\.inner-hero__title \{[^}]*font-size: clamp\(2rem, [^)]*3rem\);[^}]*font-weight: 800;[^}]*letter-spacing: -0\.025em;/)
    expect(code).toMatch(/\.inner-hero__sub \{[^}]*font-size: 1\.125rem;/)
  })

  it("badge nuqtasi oltin; pulsatsiya faqat `prefers-reduced-motion: no-preference` da", () => {
    expect(code).toMatch(/\.hero-badge__dot \{[^}]*background: var\(--color-accent\);/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.hero-badge__dot \{ animation: pulse/)
  })

  it("yangi tokenlar Light'da e'lon qilingan; Dark'da `--color-accent-text` = #e6c04f (oltin matn ikkala temada o'qiladi)", () => {
    for (const n of ['--color-accent-text', '--color-accent-subtle', '--color-accent-border', '--color-banner-bg', '--gradient-banner',
      '--gradient-hairline', '--hero-dot', '--gradient-hero-glow', '--gradient-card', '--shadow-card-inset', '--shadow-card-hover', '--color-modal-overlay'])
      expect(tokens, n).toMatch(new RegExp(`${n}:`))
    expect(tokens).toMatch(/--color-accent-text:\s*#8a600a/)
    expect(tokens).toMatch(/--color-accent-text:\s*#e6c04f/)
    expect(tokens).toMatch(/--color-modal-overlay:\s*rgb\(28 12 22 \/ 0\.66\)/)
    expect(tokens).toMatch(/--color-modal-overlay:\s*rgb\(10 6 9 \/ 0\.74\)/)
  })

  it("Qabul banneri: to'q wine gradient + tepada oltin hairline; muddat chipi oltin tonda", () => {
    expect(code).toMatch(/\.apply-banner \{[^}]*background: var\(--gradient-banner\);/)
    expect(code).toMatch(/\.apply-banner::before \{[^}]*var\(--gradient-hairline\)/)
    expect(code).toMatch(/\.deadline-chip \{[^}]*var\(--color-accent-subtle\)/)
  })

  it("Yo'nalish kartasi: hover/fokus faqat brand + wine glow; `translateY(-3px)` faqat `no-preference` da", () => {
    expect(code).toMatch(/box-shadow: var\(--shadow-card-inset\), var\(--shadow-card-hover\);/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.card\.faculty-card:hover,\s*\.card\.faculty-card:focus-visible \{ transform: translateY\(-3px\); \}/)
  })

  it("tab: faol holat `data-active`, faol fon `--color-brand-fill` + `--glow-brand`, badge `rgb(255 255 255 / .22)`", () => {
    expect(code).toMatch(/\.kiu-tab-btn\[data-active="true"\] \{[^}]*var\(--color-brand-fill\);[^}]*var\(--glow-brand\)/)
    expect(code).toMatch(/\.kiu-tab-btn\[data-active="true"\] \.kiu-tab-badge \{[^}]*rgb\(255 255 255 \/ 0\.22\)/)
  })

  it("`.faculty-grid-*` qoidalari global.css dan (qatlamsiz — gap'ni bosib o'tardi) pages.css ga ko'chgan", () => {
    expect(global).not.toMatch(/faculty-grid/)
    expect(code).toMatch(/\.faculty-grid-bakalavr \{[^}]*repeat\(5, minmax\(0, 1fr\)\)/)
    expect(code).toMatch(/\.faculty-grid \{ gap: 16px; \}/)
  })

  it("Admission, Faculty, FacultyModal: inline style yo'q; FacultyCard — faqat animation-delay (1 ta); hex/rgba yo'q", () => {
    expect(inline('src/pages/Admission.jsx')).toBe(0)
    expect(inline('src/pages/Faculty.jsx')).toBe(0)
    expect(inline('src/pages/faculty/FacultyModal.jsx')).toBe(0)
    expect(inline('src/pages/faculty/FacultyCard.jsx')).toBe(1)
    for (const f of ['src/pages/Admission.jsx', 'src/pages/Faculty.jsx', 'src/pages/faculty/FacultyCard.jsx', 'src/pages/faculty/FacultyModal.jsx', 'src/components/PageHero.jsx'])
      expect(read(f), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|\bf\.color\b/i)
  })
})
