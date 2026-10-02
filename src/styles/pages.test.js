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

  // 6.11b: hover/fokus qiymatlari qayta dizayn qilindi (toifa rangidagi chegara + wine glow tokeni); tugma hover'i `.btn-primary` dan keladi.
  it("hover'lar CSS da (oldin JS `onMouseEnter/Leave` edi): karta — `--cat` chegara + `--shadow-card-hover`, karusel o'qi — `--color-brand-fill`", () => {
    expect(code).toMatch(/\.card\.news-card:hover,\s*\.card\.news-card:focus-within \{[^}]*border-color: var\(--cat\);[^}]*box-shadow: var\(--shadow-card-hover\);/)
    expect(code).toMatch(/\.carousel-nav:hover \{ background: var\(--color-brand-fill\); \}/)
    expect(code).not.toMatch(/\.news-card-btn|\.carousel-more/)
  })

  it("karta hover'i `.card:is(.card-link):hover` dan kuchli (`.card.news-card`, 3 klass) — toifa rangidagi chegara umumiy brand chegarasini bosib o'tadi", () => {
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

  // 6.11b: o'qlar hover'i `--color-brand-fill`, "Orqaga" tepada pill (`.back-link`), pastda `.btn-primary` (alohida `.back-btn:hover` kerak emas).
  it("hover'lar CSS da: galereya o'qlari, tepadagi orqaga havolasi (ijtimoiy havola 6.11c2 da `.btn-primary` ga o'tdi)", () => {
    expect(code).toMatch(/\.gallery-arrow:hover \{ background: var\(--color-brand-fill\); \}/)
    expect(code).toMatch(/\.back-link:hover \{[^}]*border-color: var\(--color-brand\);[^}]*background: var\(--color-brand-subtle\);/)
    expect(code).not.toMatch(/\.social-link/)
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
    // Telegram gradienti: ikkala uchi ham token (`-deep` EMAS — u boshqa qiymat, #006aa3).
    // 6.11b: gradient faqat kanal belgisida (avatar) qoldi; "Obuna" tugmasi — umumiy `.btn-primary` (wine), `.tg-subscribe` o'z fonini bermaydi.
    expect(site).toMatch(/\.tg-avatar \{[^}]*linear-gradient\(135deg, var\(--brand-telegram\), var\(--brand-telegram-end\)\)/)
    expect(site).not.toMatch(/\.tg-subscribe/)
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

describe('Bosqich 6.11b: Yangiliklar, Yangilik sahifasi, karusel, Telegram paneli', () => {
  const tokens = read('src/styles/tokens.css')
  const site = read('src/styles/site.css').replace(/\/\*[\s\S]*?\*\//g, '')
  const inline = f => (read(f).match(/style=\{/g) ?? []).length // `style={{…}}` va `style={cond ? {…} : undefined}`

  it("toifa tokenlari: chip/placeholder ulushlari Light va Dark'da (Dark kuchliroq); karusel qoplamasi va scrim tokenlari e'lon qilingan", () => {
    for (const n of ['--cat-chip-mix', '--cat-ph-1', '--cat-ph-2', '--carousel-tint', '--color-scrim-pill', '--color-scrim-ctrl'])
      expect(tokens, n).toMatch(new RegExp(`${n}:`))
    expect(tokens).toMatch(/--cat-chip-mix:\s*12%/)
    expect(tokens).toMatch(/--cat-chip-mix:\s*18%/)
    expect(tokens).toMatch(/--cat-ph-1:\s*16%/)
    expect(tokens).toMatch(/--cat-ph-1:\s*22%/)
  })

  it("toifa chipi: fon `color-mix(--cat …)`, MATN `--color-text` (`--chart-3/4/5` oq fonda 4.5:1 dan past); nuqta `--cat`", () => {
    expect(code).toMatch(/\.news-card-cat \{[^}]*color-mix\(in oklab, var\(--cat\) var\(--cat-chip-mix\), transparent\);[^}]*color: var\(--color-text\);/)
    expect(code).toMatch(/\.cat-dot \{[^}]*background: var\(--cat\);/)
    expect(code).toMatch(/\.news-cat\[data-active="true"\] \{[^}]*border-color: var\(--cat\);[^}]*color-mix\(in oklab, var\(--cat\) var\(--cat-chip-mix\), transparent\);/)
    expect(code).toMatch(/\.news-card-ph \{[^}]*var\(--cat-ph-1\)[^}]*var\(--cat-ph-2\)/)
  })

  it("karusel: wine qoplama tokendan, nuqta 24px bosish hududi (faol — oltin), tor ekranda o'qlar tepada; harakat `reduce` da o'chadi", () => {
    expect(code).toMatch(/\.carousel-tint \{[^}]*var\(--carousel-tint\)/)
    expect(code).toMatch(/\.carousel-dot,\s*\.gallery-dot \{[^}]*height: 24px;/)
    expect(code).toMatch(/\.carousel-dot\[aria-current="true"\]::before,\s*\.gallery-dot\[aria-current="true"\]::before \{[^}]*background: var\(--color-accent\);/)
    expect(code).toMatch(/@media \(max-width: 640px\) \{\s*\.carousel \{[\s\S]*\.carousel-nav \{ top: 12px;/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.carousel-bg \{ animation: none; \}/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.gallery-img\[data-slide\] \{ animation: none; \}/)
  })

  it("galereya: yuklanmagan rasm va siljish `data-*` orqali (inline emas); o'qlar 44px", () => {
    expect(code).toMatch(/\.gallery-img\[data-slide="right"\] \{ animation: slide-in-right/)
    expect(code).toMatch(/\.gallery\[data-broken="true"\] \{ display: none; \}/)
    expect(code).toMatch(/\.gallery-arrow \{[^}]*width: 44px;[^}]*height: 44px;/)
  })

  it("Video tabi: YouTube qizili faqat kanal belgisida; havola matni brend rangida (qizil oq fonda 4.5:1 dan past)", () => {
    expect(code).toMatch(/\.shorts-channel-icon \{ fill: var\(--brand-youtube\); \}/)
    expect(code).toMatch(/\.shorts-watch \{[^}]*color: var\(--color-brand\);/)
    expect(code).not.toMatch(/\.shorts-(link|watch) \{[^}]*color: var\(--brand-youtube\)/)
  })

  it("Telegram paneli: 2×2 to'r, `single` — 1 ustun; LIVE `--color-brand-fill` + oltin nuqta (pulsatsiya faqat `no-preference`)", () => {
    expect(site).toMatch(/\.tg-msgs \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/)
    expect(site).toMatch(/\.tg-box\[data-layout="single"\] \.tg-msgs \{ grid-template-columns: minmax\(0, 1fr\); \}/)
    expect(site).toMatch(/\.tg-head \{[^}]*background: var\(--color-brand-subtle\);/)
    expect(site).toMatch(/\.tg-live \{[^}]*background: var\(--color-brand-fill\);/)
    expect(site).toMatch(/\.tg-live-dot \{[^}]*background: var\(--color-accent\);/)
    expect(site).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.tg-live-dot \{ animation: pulse/)
  })

  it("inline stil: faqat dinamik qiymatlar — NewsCard 1 (`--cat`), NewsTab 1, FeaturedCarousel 2 (`background-image`, `--cat`), NewsDetail 1 (`--cat`); ShortsTab/TelegramPanel/News 0; hex/rgba yo'q", () => {
    expect(inline('src/pages/news/NewsCard.jsx')).toBe(1)
    expect(inline('src/pages/news/NewsTab.jsx')).toBe(1)
    expect(inline('src/pages/news/FeaturedCarousel.jsx')).toBe(2)
    expect(inline('src/pages/NewsDetail.jsx')).toBe(1)
    expect(inline('src/pages/news/ShortsTab.jsx')).toBe(0)
    expect(inline('src/components/TelegramPanel.jsx')).toBe(0)
    expect(inline('src/pages/News.jsx')).toBe(0)
    for (const f of ['src/pages/News.jsx', 'src/pages/NewsDetail.jsx', 'src/pages/news/NewsTab.jsx', 'src/pages/news/NewsCard.jsx', 'src/pages/news/FeaturedCarousel.jsx', 'src/pages/news/ShortsTab.jsx'])
      expect(read(f), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|getCategoryColor/i)
  })
})

describe('Bosqich 6.11c1: umumiy primitivlar + About, Xalqaro, Hujjatlar, Yutuqlar', () => {
  const tokens = read('src/styles/tokens.css')
  const inline = f => (read(f).match(/style=\{/g) ?? []).length

  it("yangi tokenlar: banner matni Light `#ecd0e1` / Dark `#c3b9be` (ikkala Dark blokda), oltin-on-dark `#e6c04f`", () => {
    expect(tokens).toMatch(/--color-banner-text:\s*#ecd0e1/)
    expect((tokens.match(/--color-banner-text:\s*#c3b9be/g) ?? []).length).toBe(2)
    expect(tokens).toMatch(/--color-accent-on-dark:\s*#e6c04f/)
  })

  it("`.reveal` o'rami va hover ajratilgan: `.card.card--lift` hover — brand chegara + wine glow, ko'tarilish faqat `no-preference` da", () => {
    expect(code).toMatch(/\.rv-item > \.card \{ flex: 1; min-width: 0; \}/)
    expect(code).toMatch(/\.card\.card--lift:hover,\s*\.card\.card--lift:focus-visible \{[^}]*border-color: var\(--color-brand\);[^}]*var\(--shadow-card-hover\)/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.card\.card--lift:hover,\s*\.card\.card--lift:focus-visible \{ transform: translateY\(-3px\); \}/)
  })

  it("wine banner: Qabul banneri bilan bir xil fon (`--gradient-banner`) + oltin hairline; statistika 40 px/800 oltin", () => {
    expect(code).toMatch(/\.wine-banner \{[^}]*background: var\(--gradient-banner\);/)
    expect(code).toMatch(/\.wine-banner::before \{[^}]*var\(--gradient-hairline\)/)
    expect(code).toMatch(/\.wine-stat__value \{[^}]*font-size: 2\.5rem;[^}]*font-weight: 800;[^}]*var\(--color-accent-on-dark\)/)
  })

  it("bo'lim sarlavhasi 30 px/800 + 40×3 px oltin chiziq; `.page-block` oraliq `.section-title` dan keyin (qoida tartibi)", () => {
    expect(code).toMatch(/\.section-title \{[^}]*font-size: 1\.875rem;[^}]*font-weight: 800;/)
    expect(code).toMatch(/\.section-title::after \{[^}]*width: 40px;[^}]*height: 3px;[^}]*var\(--color-accent\)/)
    expect(code).toMatch(/\.section-title\.page-block \{ margin-top: 56px; \}/)
  })

  it("aniq ustun soni (yetim qator yo'q): 4/3/2 ustun, 12 ustunli to'r (3+2 va 4+3), ≤1000 px da 2, ≤640 px da 1 ustun", () => {
    expect(code).toMatch(/\.cards-4 \{ display: grid; grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/)
    expect(code).toMatch(/\.grid-12 > \.col-4 \{ grid-column: span 4; \}/)
    expect(code).toMatch(/@media \(max-width: 1000px\) \{\s*\.cards-4 \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/)
    expect(code).toMatch(/@media \(max-width: 640px\) \{\s*\.cards-2, \.cards-3, \.cards-4, \.grid-12 \{ grid-template-columns: minmax\(0, 1fr\); \}/)
  })

  it("avatar — bitta wine gradient + halqa va glow; plitka brand-subtle; pill brand-subtle", () => {
    expect(code).toMatch(/\.avatar-wine \{[^}]*linear-gradient\(135deg, var\(--color-brand-fill\), var\(--color-brand-hover\)\)[^}]*var\(--glow-brand\)/)
    expect(code).toMatch(/\.tile \{[^}]*background: var\(--color-brand-subtle\);[^}]*color: var\(--color-brand\);/)
    expect(code).toMatch(/\.pill-brand \{[^}]*background: var\(--color-brand-subtle\);/)
  })

  it("About/International/Documents/Achievements: inline style yo'q, hex/rgba yo'q, `PageHero` ishlatiladi; eski `.achieve-icon`/`.doc-icon` yo'q", () => {
    for (const f of ['About', 'International', 'Documents', 'Achievements']) {
      const path = `src/pages/${f}.jsx`
      expect(inline(path), f).toBe(0)
      expect(read(path), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|achieve-icon|doc-icon|gradient-dark/i)
      expect(read(path), f).toMatch(/PageHero/)
    }
  })
})


describe('Bosqich 6.11c2: Hemis, FAQ, Sharhlar, Aloqa, Xarita, QR kodlar, 404', () => {
  const tokens = read('src/styles/tokens.css')
  const inline = f => (read(f).match(/style=\{/g) ?? []).length

  it("yangi tokenlar: sharh yulduzi Light `#d4af37` / Dark `#e6c04f` (ikkala Dark blokda); QR plitkasi doim oq, Dark chegarasi alohida", () => {
    expect(tokens).toMatch(/--color-star:\s*#d4af37/)
    expect((tokens.match(/--color-star:\s*#e6c04f/g) ?? []).length).toBe(2)
    expect(tokens).toMatch(/--color-qr-bg:\s*#ffffff/)
    expect((tokens.match(/--color-qr-bg:/g) ?? []).length).toBe(1)   // Dark'da qayta aniqlanmaydi — har doim oq
    expect((tokens.match(/--color-qr-border:\s*rgb\(233 168 208 \/ 0\.35\)/g) ?? []).length).toBe(2)
    expect(tokens).toMatch(/--brand-facebook:\s*#1877f2/)
    expect(tokens).toMatch(/--brand-youtube-end:\s*#cc0000/)
  })

  it("FAQ: savol 17.5 px/700, chevron 36 px doira; ochiq — brand chegara + glow, 180° aylanish (`reduce` da animatsiyasiz)", () => {
    expect(code).toMatch(/\.faq-card__q \{[^}]*font-size: 1\.09375rem;[^}]*font-weight: 700;/)
    expect(code).toMatch(/\.faq-card__chev \{[^}]*width: 36px;[^}]*height: 36px;[^}]*border-radius: 50%;/)
    expect(code).toMatch(/\.card\.faq-card\[data-open="true"\] \{[^}]*border-color: var\(--color-brand\);[^}]*var\(--shadow-card-hover\)/)
    expect(code).toMatch(/\.faq-card__q\[aria-expanded="true"\] \.faq-card__chev \{[^}]*transform: rotate\(180deg\)/)
    expect(code).toMatch(/prefers-reduced-motion: reduce\) \{ \.faq-card__chev \{ transition: none; \} \}/)
    expect(code).toMatch(/\.faq-card__a \{[^}]*max-width: 680px;[^}]*line-height: 1\.8;/)
  })

  it("sharh: yulduz rangi `--color-star`; matn 16.5 px kursivsiz; muallif pastda `margin-top: auto` + ajratgich", () => {
    expect(code).toMatch(/\.review-card__stars \{[^}]*color: var\(--color-star\);/)
    expect(code).toMatch(/\.review-card__text \{[^}]*font-size: 1\.03125rem;[^}]*line-height: 1\.75;/)
    expect(code).not.toMatch(/\.review-card__text \{[^}]*font-style: italic/)
    expect(code).toMatch(/\.review-card__author \{[^}]*margin-top: auto;[^}]*border-top: 1px solid var\(--color-border\);/)
  })

  it("Aloqa: 2 ustun, kartalar teng balandlikda; havola cho'zilgan (`::after`), hover — underline + strelka to'ldiriladi, ko'tarilish -2px faqat `no-preference`", () => {
    expect(code).toMatch(/\.contact-grid \{[^}]*repeat\(2, minmax\(0, 1fr\)\);[^}]*align-items: stretch;/)
    expect(code).toMatch(/\.contact-list \{[^}]*grid-template-rows: repeat\(5, minmax\(0, 1fr\)\);/)
    expect(code).toMatch(/\.contact-card__link::after \{[^}]*position: absolute;[^}]*inset: 0;/)
    expect(code).toMatch(/\.contact-card:hover \.contact-card__link,[^{]*\{ text-decoration: underline; text-underline-offset: 4px; \}/)
    expect(code).toMatch(/\.contact-card__go \{[^}]*width: 36px;[^}]*height: 36px;/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.card\.card--lift\.contact-card:hover,\s*\.card\.card--lift\.contact-card:focus-within \{ transform: translateY\(-2px\); \}/)
  })

  it("Xarita: 2 ustun (gap 24), xarita 400 px radius 14, Dark'da `invert` yo'q", () => {
    expect(code).toMatch(/\.map-grid \{[^}]*repeat\(2, minmax\(0, 1fr\)\);[^}]*gap: 24px;/)
    expect(code).toMatch(/\.map-card__frame \{[^}]*height: 400px;[^}]*border-radius: 14px;/)
    expect(code).toMatch(/\.map-card__num \{[^}]*width: 52px;[^}]*linear-gradient\(135deg, var\(--color-brand-fill\), var\(--color-brand-hover\)\)/)
    expect(code).not.toMatch(/invert\(/)
  })

  it("QR: 4 ustun (`.cards-4`), plitka 176 px doim oq fonda; brend gradientlari faqat ikonka doirasida (tokendan)", () => {
    expect(code).toMatch(/\.qr-card__code \{[^}]*width: 176px;[^}]*height: 176px;[^}]*background: var\(--color-qr-bg\);/)
    expect(code).toMatch(/\.qr-card__icon \{[^}]*width: 56px;[^}]*height: 56px;[^}]*border-radius: 50%;/)
    for (const k of ['telegram', 'instagram', 'youtube', 'facebook']) expect(code).toMatch(new RegExp(`\\.qr-card__icon--${k} \\{ background: `))
    expect(code).toMatch(/\.qr-card__icon--instagram \{ background: var\(--brand-instagram\); \}/)
    expect(code).toMatch(/\.qr-card__link \{[^}]*min-height: 46px;[^}]*padding-inline: 12px;/)
    expect(code).toMatch(/\.wine-banner__tile \{[^}]*var\(--color-accent-on-dark-border\)[^}]*var\(--color-accent-on-dark\)/)
  })

  it("404: raqam 132 px/800 brand, plitka 116 px radius 34, oltin hairline 72×3, havola pill'i 44 px", () => {
    expect(code).toMatch(/\.notfound__digit \{[^}]*font-size: 8\.25rem;[^}]*font-weight: 800;[^}]*color: var\(--color-brand\);/)
    expect(code).toMatch(/\.notfound__tile \{[^}]*width: 116px;[^}]*height: 116px;[^}]*border-radius: 34px;/)
    expect(code).toMatch(/\.notfound__rule \{ width: 72px; height: 3px;[^}]*var\(--color-accent\);/)
    expect(code).toMatch(/\.pill-link \{[^}]*min-height: 44px;/)
    expect(code).toMatch(/\.pill-link:hover \{ background: var\(--color-brand-fill\); color: var\(--color-on-brand\); \}/)
  })

  it("Hemis, FAQ, Testimonials, Contact, Map, QRCode, NotFound: inline style yo'q, hex/rgba yo'q, eski klasslar (`achieve-icon`, `cc-icon`, `social-link`) yo'q", () => {
    for (const f of ['Hemis', 'FAQ', 'Testimonials', 'Contact', 'Map', 'QRCode', 'NotFound']) {
      const path = `src/pages/${f}.jsx`
      expect(inline(path), f).toBe(0)
      expect(read(path), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|achieve-icon|cc-icon|social-link|gradient-dark/i)
    }
    for (const f of ['Hemis', 'FAQ', 'Testimonials', 'Contact', 'Map', 'QRCode']) expect(read(`src/pages/${f}.jsx`), f).toMatch(/PageHero/)
  })
})

describe('Bosqich 6.11c3: Tadbirlar, O\'qituvchilar, Galereya', () => {
  const tokens = read('src/styles/tokens.css')
  const inline = f => (read(f).match(/style=\{/g) ?? []).length

  it("yangi tokenlar: galereya hover/nishon (Light + ikkala Dark blok), lightbox foni doim bir xil", () => {
    expect(tokens).toMatch(/--gallery-hover-overlay:\s*rgb\(100 24 78 \/ 0\.55\)/)
    expect((tokens.match(/--gallery-hover-overlay:\s*rgb\(18 8 14 \/ 0\.5\)/g) ?? []).length).toBe(2)
    expect((tokens.match(/--gallery-badge-bg:/g) ?? []).length).toBe(3)
    expect((tokens.match(/--gallery-badge-text:\s*#f3c5df/g) ?? []).length).toBe(2)
    expect((tokens.match(/--color-lightbox-bg:/g) ?? []).length).toBe(1)
  })

  it("Tadbirlar: tur → `--chart-N` (data-type), chip foni `--cat-chip-mix`, matn `--color-text`; 7 tur ham xaritalangan", () => {
    expect(code).toMatch(/\.ev-chip \{[^}]*background: color-mix\(in oklab, var\(--cat\) var\(--cat-chip-mix\), transparent\);[^}]*color: var\(--color-text\);/)
    const map = { general: 'chart-1', graduation: 'chart-5', sport: 'chart-4', culture: 'chart-3', open: 'chart-2', admission: 'chart-6', science: 'stat-violet' }
    for (const [type, tok] of Object.entries(map)) expect(code).toMatch(new RegExp(`\\.ev-chip\\[data-type="${type}"\\]\\s*\\{ --cat: var\\(--${tok}\\); \\}`))
  })

  it("Tadbirlar: karta 20 px radius, sana plitkasi 84×88 brand gradient, rasm 168×104; modal hairline + yumaloq yopish tugmasi", () => {
    expect(code).toMatch(/\.card\.ev-card \{[^}]*padding: 20px 24px 20px 20px;[^}]*border-radius: 20px;[^}]*cursor: pointer;/)
    expect(code).toMatch(/\.ev-date \{[^}]*width: 84px;[^}]*height: 88px;[^}]*linear-gradient\(135deg, var\(--color-brand-fill\), var\(--color-brand-hover\)\)/)
    expect(code).toMatch(/\.ev-img \{[^}]*width: 168px;[^}]*height: 104px;/)
    expect(code).toMatch(/\.ev-img\[data-broken="true"\] \{ display: none; \}/)
    expect(code).toMatch(/\.ev-modal::before \{[^}]*var\(--gradient-hairline\)/)
    expect(code).toMatch(/\.ev-modal__close \{[^}]*width: 36px;[^}]*height: 36px;[^}]*border-radius: 50%;/)
    expect(code).toMatch(/\.ev-modal-overlay \{[^}]*var\(--color-modal-overlay\)/)
  })

  it("O'qituvchilar: 290 px yon panel + 1fr, panel sticky (≤900 px da static, ustma-ust); 3 → 2 → 1 ustun; eski `!important` qoidalari global.css da yo'q", () => {
    expect(code).toMatch(/\.teachers-layout \{[^}]*grid-template-columns: 290px minmax\(0, 1fr\);/)
    expect(code).toMatch(/\.card\.kafedra-card \{[^}]*position: sticky;[^}]*top: 96px;/)
    expect(code).toMatch(/@media \(max-width: 900px\) \{\s*\.teachers-layout \{ grid-template-columns: minmax\(0, 1fr\); \}\s*\.card\.kafedra-card \{ position: static; \}/)
    expect(code).toMatch(/\.teachers-grid \{[^}]*repeat\(3, minmax\(0, 1fr\)\)/)
    expect(code).toMatch(/\.kafedra-btn\[data-active="true"\] \{[^}]*border-color: var\(--color-brand\);/)
    expect(code).toMatch(/\.avatar-wine\.teacher-card__avatar \{[^}]*width: 88px;[^}]*height: 88px;/)
    expect(code).toMatch(/\.teacher-card__avatar img\[data-broken="true"\] \{ display: none; \}/)
    expect(read('src/styles/global.css')).not.toMatch(/\.teachers-layout/)
  })

  it("Galereya: rasm 220 px, placeholder `--chart-1…6` (data-slot), hover qoplama tokendan, ko'tarilish/zoom faqat `no-preference`", () => {
    expect(code).toMatch(/\.photo-card__media \{[^}]*height: 220px;/)
    for (let i = 1; i <= 5; i++) expect(code).toContain(`.photo-card[data-slot="${i}"] { --ph: var(--chart-${i + 1}); }`)
    expect(code).toMatch(/\.photo-card__zoom \{[^}]*background: var\(--gallery-hover-overlay\);[^}]*opacity: 0;/)
    expect(code).toMatch(/\.photo-card:focus-visible \.photo-card__zoom \{ opacity: 1; \}/)
    expect(code).toMatch(/\.photo-card__badge \{[^}]*var\(--gallery-badge-bg\);[^}]*var\(--gallery-badge-text\);/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.photo-card:hover \.photo-card__media img/)
  })

  it("Lightbox: fon `--color-lightbox-bg`, rasm 880 px gacha radius 16, tugmalar 46/54 px doira, qora soya", () => {
    expect(code).toMatch(/\.photo-lightbox \{[^}]*var\(--color-lightbox-bg\)/)
    expect(code).toMatch(/\.photo-lightbox__content \{[^}]*max-width: 880px;/)
    expect(code).toMatch(/\.photo-lightbox__img \{[^}]*border-radius: 16px;[^}]*box-shadow: 0 12px 48px rgb\(0 0 0 \/ 0\.6\);/)
    expect(code).toMatch(/\.photo-lightbox__btn \{[^}]*width: 46px;[^}]*height: 46px;[^}]*border-radius: 50%;/)
    expect(code).toMatch(/\.photo-lightbox__btn--prev,\s*\.photo-lightbox__btn--next \{[^}]*width: 54px;/)
  })

  it("Banner: `.notice-banner` brand-subtle, `data-tone=danger` — `--color-danger` dan color-mix", () => {
    expect(code).toMatch(/\.notice-banner \{[^}]*background: var\(--color-brand-subtle\);/)
    expect(code).toMatch(/\.notice-banner\[data-tone="danger"\] \{[^}]*color-mix\(in srgb, var\(--color-danger\) 8%, transparent\)/)
  })

  it("Events, Teachers, Gallery: inline style yo'q, hex/rgba yo'q, PageHero ishlatiladi; Teachers email chiqarmaydi; eski `✕` matni yo'q", () => {
    for (const f of ['Events', 'Teachers', 'Gallery']) {
      const path = `src/pages/${f}.jsx`
      expect(inline(path), f).toBe(0)
      expect(read(path), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|✕/i)
      expect(read(path), f).toMatch(/PageHero/)
    }
    expect(read('src/pages/Teachers.jsx')).not.toMatch(/\.email|mailto:|KAFEDRALAR/)
    expect(read('src/pages/Gallery.jsx')).toMatch(/useModalA11y/)
  })
})

describe('Bosqich 6.11c4: Vakansiyalar', () => {
  const tokens = read('src/styles/tokens.css')
  const inline = f => (read(f).match(/style=\{/g) ?? []).length

  it("yangi tokenlar: `--ring-field` / `--ring-field-danger` (Light + ikkala Dark blok)", () => {
    expect(tokens).toMatch(/--ring-field:\s*rgb\(127 32 99 \/ 0\.14\)/)
    expect(tokens).toMatch(/--ring-field-danger:\s*rgb\(200 30 30 \/ 0\.10\)/)
    expect((tokens.match(/--ring-field:\s*rgb\(233 168 208 \/ 0\.18\)/g) ?? []).length).toBe(2)
    expect((tokens.match(/--ring-field-danger:\s*rgb\(242 106 106 \/ 0\.14\)/g) ?? []).length).toBe(2)
  })

  it("Forma tizimi: `.input--lg` 48 px / radius 12, fokus — `--ring-field` + shaffof outline, xato — `--color-danger` + `--ring-field-danger`", () => {
    expect(code).toMatch(/\.input\.input--lg \{[^}]*min-height: 48px;[^}]*border-radius: 12px;[^}]*var\(--color-field-bg\)/)
    expect(code).toMatch(/\.input\.input--lg:focus-visible \{[^}]*var\(--ring-field\)[^}]*outline: 2px solid transparent;/)
    expect(code).toMatch(/\.input\.input--lg\[aria-invalid="true"\],\s*\.input\.input--lg\[aria-invalid="true"\]:focus-visible \{[^}]*var\(--color-danger\)[^}]*var\(--ring-field-danger\)/)
  })

  it("`<select>` — `.select-wrap` + SVG chevron (data-URI emas), checkbox — clip-path belgi + forced-colors zaxirasi", () => {
    expect(code).toMatch(/\.select-wrap > select \{[^}]*appearance: none;/)
    expect(code).toMatch(/\.select-wrap > svg \{[^}]*pointer-events: none;/)
    expect(code).not.toMatch(/data:image/)
    expect(code).toMatch(/\.vac-checkbox \{[^}]*width: 22px;/)
    expect(code).toMatch(/\.vac-checkbox:checked \{[^}]*var\(--color-brand-fill\)/)
    expect(code).toMatch(/forced-colors: active\) \{ \.vac-checkbox:checked::before/)
  })

  it("forma kartasi 760 px; eski `.section-badge--hero`, `.tabs--line`, `.icon-tile` va `.vacancies-content` olib tashlangan", () => {
    expect(code).toMatch(/\.vac-form-wrap \{ max-width: 760px;/)
    expect(code).not.toMatch(/\.section-badge--hero|\.section-badge-dot|\.tabs--line|\.icon-tile/)
    expect(read('src/styles/global.css')).not.toMatch(/vacancies-content/)
  })

  it("Vakansiyalar JSX: inline style yo'q, hex/rgba yo'q, PageHero + `*` JSX da (i18n matnda emas)", () => {
    for (const f of ['Vacancies.jsx', 'vacancies/InfoTab.jsx', 'vacancies/ApplicationForm.jsx']) {
      const path = `src/pages/${f}`
      expect(inline(path), f).toBe(0)
      expect(read(path), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    }
    expect(read('src/pages/Vacancies.jsx')).toMatch(/PageHero/)
    expect(read('src/pages/vacancies/ApplicationForm.jsx')).toMatch(/label__req/)
    for (const l of ['uz', 'ru', 'en']) {
      const form = JSON.parse(read(`src/i18n/locales/${l}.json`)).vacancies.form
      for (const k of ['fullName', 'phone', 'position', 'faculty', 'education', 'experience']) expect(form[k], `${l}.${k}`).not.toMatch(/\*\s*$/)
    }
  })
})
