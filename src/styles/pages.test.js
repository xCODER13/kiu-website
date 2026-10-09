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
  it("hover'lar CSS da (oldin JS `onMouseEnter/Leave` edi): karta — barcha toifada bir xil `--chart-1` (Umumiy) chegara + `--shadow-card-hover`, karusel o'qi — `--color-brand-fill`", () => {
    expect(code).toMatch(/\.card\.news-card:hover,\s*\.card\.news-card:focus-within \{[^}]*border-color: var\(--chart-1\);[^}]*box-shadow: var\(--shadow-card-hover\);/)
    // toifaga qarab o'zgarmaydi: kartaning hover/fokus qoidasida `--cat` chegarasi yo'q
    expect(code).not.toMatch(/\.card\.news-card:(hover|focus-within)[^{]*\{[^}]*border-color: var\(--cat\)/)
    expect(code).toMatch(/\.carousel-nav:hover \{ background: var\(--color-brand-fill\); \}/)
    expect(code).toMatch(/\.btn\.news-card-btn \{/)
    // taxta 6.12b: karusel "Batafsil" — shisha (glass) tugma, `.btn.carousel-more` (hover'i `.btn` dan)
    expect(code).toMatch(/\.btn\.carousel-more \{/)
  })

  it("karta hover'i `.card:is(.card-link):hover` dan kuchli (`.card.news-card`, 3 klass) — `--chart-1` chegara umumiy brand chegarasini bosib o'tadi", () => {
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
      // 6.29: pauza hodisalari umumiy `useCarouselPause` hook'iga ko'chdi (sichqoncha + klaviatura fokusi + reduced-motion) — komponentda `{...handlers}`
      if (f.endsWith('FeaturedCarousel.jsx')) { expect(uses).toEqual([]); expect(src).toMatch(/\{\.\.\.handlers\}/) }
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

  // 6.11c5: `homeCarouselFade` olib tashlandi — Home karuseli Yangiliklar bilan umumiy `carouselFadeIn` ishlatadi
  it('keyframes pages.css ga ko\'chgan (Home, NewsDetail, Faculty); `spin` va `pulse` global.css da qolgan', () => {
    for (const k of ['homeSkelShimmer', 'homeSectionFadeIn', 'carouselFadeIn', 'slide-in-right', 'slide-in-left', 'cardFadeIn'])
      expect(code, k).toMatch(new RegExp(`@keyframes ${k} \\{`))
    expect(global).toMatch(/@keyframes spin \{/)
    expect(global).toMatch(/@keyframes pulse \{/)
  })

  // 6.11c5: Home hero qoidalari qatlamsiz `global.css` dan `pages.css` (`@layer components`) ga ko'chdi (`.hero-grid/.stats-grid/.stat-item` o'rniga `.home-hero*`, `.home-stats`, `.stat-tile`)
  it("Home hero/statistika qoidalari `!important`siz, `pages.css` da; global.css da eski `.hero-grid`/`.stats-grid` yo'q", () => {
    expect(read('src/pages/Home.jsx')).not.toMatch(/!important/)
    expect(global).not.toMatch(/\.hero-grid|\.stats-grid|\.stat-item|\.hero-photo-wrap|\.grid-2|\.grid-3|\.grid-auto|\.section-header/)
    expect(code).toMatch(/\.home-hero__grid \{[^}]*grid-template-columns: 1\.05fr 0\.95fr;/)
    expect(code).toMatch(/@media \(max-width: 1080px\) \{\s*\.home-stats \{ flex-wrap: wrap; max-width: 360px; \}/)
    expect(code).toMatch(/@media \(max-width: 860px\)[\s\S]*\.home-hero__grid,\s*\.home-about__grid \{ grid-template-columns: minmax\(0, 1fr\);/)
    expect(read('src/pages/home/HeroSection.jsx')).not.toMatch(/gridTemplateColumns|maxWidth: 480|style=/)
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
    // 6.11d: boshlash tugmasi `.btn.btn-primary` (hover — umumiy `.btn` qoidasidan), alohida `.sh-start:hover` yo'q
    expect(code).toMatch(/\.btn\.sh-start \{[^}]*min-height: 52px;/)
    expect(code).not.toMatch(/\.sh-start:hover/)
    expect(code).toMatch(/\.input--lg:focus \{ border-color: var\(--color-brand\); \}/)
  })

  // 6.11b: o'qlar hover'i `--color-brand-fill`, "Orqaga" tepada pill (`.back-link`), pastda `.btn-primary` (alohida `.back-btn:hover` kerak emas).
  it("hover'lar CSS da: galereya o'qlari, tepadagi orqaga havolasi (ijtimoiy havola 6.11c2 da `.btn-primary` ga o'tdi)", () => {
    expect(code).toMatch(/\.gallery-arrow:hover \{ background: var\(--color-brand-fill\); \}/)
    expect(code).toMatch(/\.back-link:hover \{[^}]*border-color: var\(--color-brand\);[^}]*background: var\(--color-brand-subtle-2\);/)
    expect(code).not.toMatch(/\.social-link/)
  })

  it("`onMouseEnter/Leave/Focus/Blur` stil uchun ishlatilmaydi (Home news karuseli — faqat pauza mantig'i)", () => {
    const files = [
      'src/pages/NewsDetail.jsx', 'src/pages/QRCode.jsx', 'src/pages/faculty/FacultyCard.jsx',
      'src/pages/sortinghat/IntroStage.jsx', 'src/pages/sortinghat/QuizStage.jsx', 'src/pages/sortinghat/RegisterStage.jsx', 'src/pages/sortinghat/ResultStage.jsx',
      'src/components/ApplyModal.jsx', 'src/components/TelegramPanel.jsx',
    ]
    for (const f of files) expect(read(f), f).not.toMatch(/onMouse(Enter|Leave)|onFocus|onBlur/)
    // 6.29: karusel pauza hodisalari (sichqoncha + klaviatura fokusi + reduced-motion) umumiy `useCarouselPause` hook'iga ko'chdi;
    // komponentda endi `{...handlers}` — eski `onMouseEnter={() => setPaused(true)}` matni yo'q. Hook ham stil yozmaydi.
    expect(read('src/pages/home/NewsCarousel.jsx')).toMatch(/\{\.\.\.handlers\}/)
    expect(read('src/pages/home/NewsCarousel.jsx')).not.toMatch(/onMouse(Enter|Leave)/)
    expect(read('src/hooks/useCarouselPause.js')).not.toMatch(/\.style\b|style=/)
  })

  it("ApplyModal va TelegramPanel: inline stil yo'q, `errorBorder` ishlatilmaydi; klasslar site.css da, token orqali", () => {
    for (const f of ['src/components/ApplyModal.jsx', 'src/components/TelegramPanel.jsx']) {
      const src = read(f)
      expect(src, f).not.toMatch(/style=\{/)
      expect(src, f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    }
    expect(read('src/components/ApplyModal.jsx')).not.toMatch(/errorBorder/)
    expect(read('src/pages/sortinghat/RegisterStage.jsx')).not.toMatch(/errorBorder/)
    expect(site).toMatch(/\.modal-overlay \{[^}]*z-index: var\(--z-modal\);[^}]*background: var\(--color-modal-overlay\);[^}]*backdrop-filter: blur\(8px\);/)
    expect(site).toMatch(/\.modal-alert \{[^}]*color-mix\(in srgb, var\(--color-danger\) 7%, transparent\)/)
    // 6.12e: ariza modali taxtaga moslandi (520 px, radius 22, oltin hairline, 52 px tugma, brend rangli yuborilmoqda holati)
    expect(site).toMatch(/\.modal-dialog \{[^}]*max-width: 520px;[^}]*border-radius: 22px;[^}]*background: var\(--gradient-dialog\);[^}]*box-shadow: var\(--shadow-dialog\);/)
    for (const n of ['--gradient-dialog', '--shadow-dialog', '--color-dialog-border']) expect((read('src/styles/tokens.css').match(new RegExp(`${n}:`, 'g')) ?? []).length, n).toBe(3)
    expect(site).toMatch(/\.modal-dialog::before \{[^}]*height: 3px;[^}]*var\(--gradient-hairline\)/)
    expect(site).toMatch(/\.modal-close \{[^}]*width: 38px;[^}]*height: 38px;[^}]*border-radius: 50%;/)
    expect(site).toMatch(/\.btn\.modal-submit \{[^}]*min-height: 52px;/)
    expect(site).toMatch(/\.btn\.modal-submit:disabled \{[^}]*var\(--color-brand-fill\);[^}]*opacity: 0\.72;/)
    expect(site).toMatch(/\.modal-success-icon \{[^}]*width: 84px;/)
    expect(read('src/components/ApplyModal.jsx')).toMatch(/input--lg/)
    expect(read('src/components/ApplyModal.jsx')).not.toMatch(/input--form|label--form|field-error--form/)
    // 6.12f: qidiruv paneli taxtaga moslandi (460 px, radius 18, oltin hairline, umumiy dialog tokenlari)
    expect(site).toMatch(/\.search-panel \{[^}]*width: 460px;[^}]*var\(--gradient-dialog\);[^}]*var\(--color-dialog-border\);[^}]*border-radius: 18px;[^}]*var\(--shadow-dialog\);/)
    expect(site).toMatch(/\.search-panel::before \{[^}]*height: 3px;[^}]*var\(--gradient-hairline\)/)
    expect(site).toMatch(/\.search-head \{[^}]*height: 60px;/)
    expect(site).toMatch(/\.search-clear \{[^}]*width: 30px;[^}]*height: 30px;[^}]*border-radius: 50%;/)
    expect(site).toMatch(/\.search-option \{[^}]*min-height: 64px;/)
    expect(site).toMatch(/\.search-option-icon \{[^}]*width: 40px;[^}]*height: 40px;/)
    expect(site).toMatch(/\.search-option\[aria-selected="true"\] \{[^}]*box-shadow: inset 3px 0 0 var\(--color-brand\);/)
    expect(site).toMatch(/\.search-chip \{[^}]*height: 40px;/)
    expect(site).toMatch(/\.search-empty-tile \{[^}]*width: 56px;[^}]*height: 56px;/)
    expect(read('src/components/Search.jsx')).not.toMatch(/var\(--/)
    expect(site).toMatch(/\.search-input:focus-visible \{[^}]*outline: 2px solid transparent;/)
    expect(site).toMatch(/\.search-head:focus-within \{[^}]*border-bottom-color: var\(--color-brand\);/)
    // Telegram gradienti: ikkala uchi ham token (`-deep` EMAS — u boshqa qiymat, #006aa3).
    // 6.11b: gradient faqat kanal belgisida (avatar) qoldi; "Obuna" tugmasi — umumiy `.btn-primary` (wine), `.tg-subscribe` o'z fonini bermaydi.
    // 6.12b: taxtada avatar — tekis #0088cc (gradient yo'q)
    expect(site).toMatch(/\.tg-avatar \{[^}]*background: var\(--brand-telegram\);/)
    expect(site).not.toMatch(/\.tg-subscribe/)
    expect(tokens).toMatch(/--brand-telegram-end:\s*#0055aa/)
    expect(tokens).toMatch(/--brand-telegram-deep:\s*#006aa3/)
  })
})

describe('Bosqich 6.11a: umumiy ichki hero, Qabul, Yo\'nalishlar', () => {
  const tokens = read('src/styles/tokens.css')
  const global = read('src/styles/global.css').replace(/\/\*[\s\S]*?\*\//g, '')
  const inline = f => (read(f).match(/style=\{\{/g) ?? []).length

  it("hero `.inner-hero`: O'Z foni yo'q (burchak yorug'ligi, `--band-tint`, `mask-image`, `::before/::after` yo'q) — fonni `main::before/::after` va yagona nuqta qatlami beradi; h1 `clamp` ≤ 3rem/800, ta'rif 1.125rem", () => {
    // 6.12d: hero fon bermaydi — gradient butun enida bir xil (chap qalin/o'ng yupqa bo'lmaydi)
    const hero = code.match(/\.inner-hero \{[^}]*\}/)[0]
    expect(hero).not.toMatch(/background/)
    expect(code).not.toMatch(/\.inner-hero::(before|after)/)
    expect(read('src/components/PageHero.jsx')).not.toMatch(/dots-shine/)
    expect(read('src/styles/global.css')).toMatch(/body::before \{ background: radial-gradient\(circle, var\(--hero-dot\)/)
    for (const n of ['--band-tint', '--band-bg', '--gradient-band-hero', '--gradient-band-news']) expect(tokens, n).not.toMatch(new RegExp(`${n}:`))
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
    // taxta 6.12b: rasmsiz karta — toifa rangidan radial + chiziqli gradient (16% → 7%)
    expect(code).toMatch(/\.news-card-ph \{[^}]*radial-gradient[^}]*var\(--cat\) 16%[^}]*var\(--cat\) 7%/)
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

  it("banner (D1): Dark `--gradient-banner` taxtadagi 3 qatlam (wine .50 + wine .34 + oltin .12); `--shadow-banner`/`--shadow-carousel` 3 joyda e'lon qilinadi va iste'molchilarga ulangan", () => {
    const dark = [...tokens.matchAll(/--gradient-banner:\s*([^;]+);/g)].map(m => m[1])
    expect(dark).toHaveLength(3) // Light + Dark @media + [data-theme=dark]
    for (const g of dark.slice(1)) {
      expect(g.match(/radial-gradient\(/g)).toHaveLength(3)
      expect(g).toMatch(/rgb\(159 51 126 \/ 0\.50\)/)
      expect(g).toMatch(/55% 130% at 100% 100%[^)]*0\.34/)
      expect(g).toMatch(/35% 90% at 60% 120%[^)]*rgb\(212 175 55 \/ 0\.12\)/)
    }
    expect(tokens.match(/--shadow-banner:/g)).toHaveLength(3)
    expect(tokens.match(/--shadow-carousel:/g)).toHaveLength(3)
    // Dark: 1px chegara (inset ring) + inset highlight + tashqi soya
    expect(tokens).toMatch(/--shadow-banner:\s*inset 0 0 0 1px [^,]+,\s*inset 0 1px 0 rgb\(255 255 255 \/ 0\.06\),\s*0 24px 52px/)
    for (const sel of ['\\.apply-banner', '\\.wine-banner', '\\.about-page \\.wine-banner', '\\.wine-banner\\.sh-result-banner'])
      expect(code, sel).toMatch(new RegExp(`${sel} \\{[^}]*box-shadow: var\\(--shadow-banner\\);`))
    expect(code).toMatch(/\.carousel \{[^}]*box-shadow: var\(--shadow-carousel\);/)
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
    expect(code).toMatch(/\.qr-card__link \{[^}]*min-height: 46px;[^}]*padding: 12px 16px;/)
    expect(code).toMatch(/\.wine-banner__tile \{[^}]*var\(--color-accent-on-dark-border\)[^}]*var\(--color-accent-on-dark\)/)
  })

  it("404: raqam 132 px/800 brand, plitka 116 px radius 34, oltin hairline 72×3, havola pill'i 44 px", () => {
    expect(code).toMatch(/\.notfound__digit \{[^}]*font-size: 8\.25rem;[^}]*font-weight: 800;[^}]*color: var\(--color-brand\);/)
    expect(code).toMatch(/\.notfound__tile \{[^}]*width: 116px;[^}]*height: 116px;[^}]*border-radius: 34px;/)
    expect(code).toMatch(/\.notfound__rule \{ width: 72px; height: 3px;[^}]*var\(--gradient-hairline\);/)
    expect(code).toMatch(/\.pill-link \{[^}]*min-height: 44px;/)
    expect(code).toMatch(/\.pill-link:hover \{ background: var\(--color-brand-fill\); color: var\(--color-on-brand\); \}/)
  })

  it("Hemis, FAQ, Contact, Map, QRCode, NotFound: inline style yo'q, hex/rgba yo'q, eski klasslar (`achieve-icon`, `cc-icon`, `social-link`) yo'q", () => {
    for (const f of ['Hemis', 'FAQ', 'Contact', 'Map', 'QRCode', 'NotFound']) {
      const path = `src/pages/${f}.jsx`
      expect(inline(path), f).toBe(0)
      expect(read(path), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|achieve-icon|cc-icon|social-link|gradient-dark/i)
    }
    for (const f of ['Hemis', 'FAQ', 'Contact', 'Map', 'QRCode']) expect(read(`src/pages/${f}.jsx`), f).toMatch(/PageHero/)
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
    const map = { general: 'chart-1', graduation: 'chart-2', sport: 'chart-3', culture: 'chart-4', open: 'chart-5', admission: 'chart-5', science: 'chart-6' }
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
    expect(code).toMatch(/\.kafedra-btn\[data-active="true"\] \{[^}]*background: var\(--color-brand-fill\);/)
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
    expect(code).toMatch(/\.notice-banner\[data-tone="danger"\] \{[^}]*color-mix\(in srgb, var\(--color-danger\) 7%, transparent\)/)
  })

  it("Events, Teachers, Gallery: inline style yo'q, hex/rgba yo'q, PageHero ishlatiladi; Teachers email `mailto` havola sifatida; eski `✕` matni yo'q", () => {
    for (const f of ['Events', 'Teachers', 'Gallery']) {
      const path = `src/pages/${f}.jsx`
      expect(inline(path), f).toBe(0)
      expect(read(path), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|✕/i)
      expect(read(path), f).toMatch(/PageHero/)
    }
    expect(read('src/pages/Teachers.jsx')).not.toMatch(/KAFEDRALAR/)
    // Talabalar hayoti: modal/lightbox `pages/gallery/` papkasiga bo'lingan — ikkalasi ham `useModalA11y` ishlatadi, inline style/hex yo'q
    for (const f of ['Lightbox', 'SectionModal', 'ItemsBrowser']) {
      const path = `src/pages/gallery/${f}.jsx`
      expect(inline(path), f).toBe(0)
      expect(read(path), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|✕/i)
    }
    expect(read('src/pages/gallery/Lightbox.jsx')).toMatch(/useModalA11y/)
    expect(read('src/pages/gallery/SectionModal.jsx')).toMatch(/useModalA11y/)
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

describe('Bosqich 6.11c5 + 6.12a: Bosh sahifa (taxta bo\'yicha)', () => {
  const tokens = read('src/styles/tokens.css')
  const inline = f => (read(f).match(/style=\{/g) ?? []).length

  it("yangi tokenlar: statistika plitkasi, kampus yorlig'i, dog'lar, faol karta (Light + ikkala Dark blok)", () => {
    expect(tokens).toMatch(/--stat-tile-bg:\s*var\(--color-surface-3\)/)
    expect(tokens).toMatch(/--stat-tile-num:\s*var\(--color-brand\)/)
    expect(tokens).toMatch(/--campus-label-bg:\s*rgb\(70 19 54 \/ 0\.78\)/)
    expect(tokens).toMatch(/--shadow-card-active:\s*0 0 0 4px rgb\(127 32 99 \/ 0\.10\), 0 18px 38px rgb\(127 32 99 \/ 0\.20\)/)
    expect((tokens.match(/--shadow-card-active:\s*inset 0 1px 0 rgb\(255 255 255 \/ 0\.09\), 0 0 0 4px rgb\(159 51 126 \/ 0\.18\), 0 18px 40px rgb\(127 32 99 \/ 0\.4\)/g) ?? []).length).toBe(2)
    expect((tokens.match(/--carousel-scrim:/g) ?? []).length).toBe(3)
    for (const n of ['--page-fade-top', '--page-fade-bottom', '--halo-photo', '--halo-opacity', '--shadow-frame']) expect((tokens.match(new RegExp(`${n}:`, 'g')) ?? []).length, n).toBe(3)
    expect(tokens).not.toMatch(/--gradient-page:/)
    expect(tokens).toMatch(/--gradient-card-active:\s*linear-gradient\(180deg, var\(--neutral-0\), var\(--wine-50\)\)/)
    expect((tokens.match(/--stat-tile-bg:\s*rgb\(39 31 36 \/ 0\.72\)/g) ?? []).length).toBe(2)
    expect((tokens.match(/--stat-tile-num:\s*var\(--color-brand\)/g) ?? []).length).toBe(3)
    expect((tokens.match(/--campus-label-bg:\s*rgb\(18 12 16 \/ 0\.72\)/g) ?? []).length).toBe(2)
    expect(tokens).not.toMatch(/--blob-(wine|gold|strength):/)
  })

  it("Hero: o'z foni YO'Q (faqat `position/isolation/overflow/padding`), `::before/::after` yo'q; yangiliklar bandi ham o'z foni va nuqtalarisiz — sahifaning umumiy foni ko'rinadi; 2 ustun 1.05fr/.95fr, plitka fon/son tokenlardan, \"2022\" — oltin", () => {
    expect(code).toMatch(/\.home-hero \{[^}]*isolation: isolate;[^}]*padding: 80px 0 72px;/)
    expect(code).not.toMatch(/\.home-hero \{[^}]*background/)
    expect(code).not.toMatch(/\.home-hero::(before|after)/)
    expect(code).toMatch(/\.home-news \{ padding: 88px 0; \}/)
    expect(code).not.toMatch(/\.home-news::(before|after)/)
    expect(code).not.toMatch(/\.dots-shine/)
    expect(read('src/pages/home/HeroSection.jsx')).not.toMatch(/dots-shine/)
    expect(read('src/pages/home/NewsSection.jsx')).not.toMatch(/dots-shine/)
    expect(code).toMatch(/@keyframes kiuTwinkle/)
    expect(code).toMatch(/@keyframes kiuShine/)
    expect(code).toMatch(/\.stat-tile \{[^}]*background: var\(--stat-tile-bg\);/)
    expect(code).toMatch(/\.stat-tile__num \{[^}]*color: var\(--stat-tile-num\);/)
    expect(code).toMatch(/\.stat-tile\[data-stat="founded"\] \.stat-tile__num \{ color: var\(--color-accent\); \}/)
    expect(read('src/pages/home/HeroSection.jsx')).toMatch(/className="hl-brand"/)
    expect(code).toMatch(/\.campus-label \{[^}]*background: var\(--campus-label-bg\);/)
  })

  it("Home rasmlari: yupqa (~5 px) gradient halo (`::before`, blur 9px, `--halo-photo`), hoshiya/chegara yo'q, ramka soyasi `--shadow-frame`", () => {
    expect(code).toMatch(/\.home-hero__photo::before,\s*\.home-about__photo::before \{[^}]*inset: -5px;[^}]*z-index: -1;[^}]*background: var\(--halo-photo\);[^}]*opacity: var\(--halo-opacity\);[^}]*filter: blur\(9px\);/)
    expect(code).not.toMatch(/\.home-(hero|about)__photo::after/)
    expect(code).toMatch(/\.home-hero__frame,\s*\.home-about__frame \{[^}]*box-shadow: var\(--shadow-frame\);/)
    expect(code).toMatch(/\.home-about__frame \{[^}]*border-radius: 20px;\s*\}/)
    expect(code).not.toMatch(/\.home-(hero|about)__frame \{[^}]*border:/)
  })

  it("Feature karta \"faol\" ko'rinishi faqat `:hover` da (`--shadow-card-active`, brend chegara, `--gradient-card-active`); doimiy `data-featured` yo'q", () => {
    expect(code).toMatch(/\.card\.home-feature:hover \{[^}]*var\(--border-card-active\);[^}]*var\(--gradient-card-active\);[^}]*var\(--shadow-card-active\);/)
    expect(code).not.toMatch(/data-featured/)
    expect(read('src/pages/home/AboutSection.jsx')).not.toMatch(/data-featured=/)
  })

  it("Yangiliklar: karusel/karta Yangiliklar sahifasi klasslarini ishlatadi; skeleton animatsiyasi faqat `no-preference` da", () => {
    expect(code).toMatch(/\.home-news \.carousel \{ height: 380px; margin: 0; border-radius: 22px;/)
    expect(code).toMatch(/@media \(max-width: 640px\) \{[\s\S]*?\.home-news \.carousel \{ height: 440px; \}/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.home-skel \{ animation: homeSkelShimmer/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.home-news-card \{ animation: homeSectionFadeIn/)
    expect(code).not.toMatch(/@keyframes homeCarouselFade/)
    expect(read('src/pages/home/NewsCarousel.jsx')).toMatch(/className="carousel carousel--home"/)
    expect(read('src/pages/home/NewsCard.jsx')).toMatch(/card card-link news-card home-news-card/)
  })

  it("`newsCategories.js`: hex, `color`, `DEFAULT_CATEGORY_COLOR`, `getCategoryColor` olib tashlangan; faqat token", () => {
    const src = read('src/utils/newsCategories.js').replace(/\/\/.*$/gm, '')
    expect(src).not.toMatch(/#[0-9a-f]{3,8}\b|color:|DEFAULT_CATEGORY_COLOR|getCategoryColor/i)
    expect(src).toMatch(/token: 'var\(--chart-1\)'/)
    expect(src).toMatch(/DEFAULT_CATEGORY_TOKEN = 'var\(--color-brand\)'/)
    expect(read('src/pages/home/utils.js')).not.toMatch(/navBtnStyle|rgba?\(|#[0-9a-f]{3,8}\b/i)
  })

  it("Home JSX: hex/rgba yo'q, inline faqat dinamik (Hero 0, About 0, Section 1, Card 1, Carousel 2), ichma-ich `<button>` yo'q", () => {
    const counts = { HeroSection: 0, AboutSection: 0, NewsSection: 1, NewsCard: 1, NewsCarousel: 1 }
    for (const [f, n] of Object.entries(counts)) {
      const path = `src/pages/home/${f}.jsx`
      expect(inline(path), f).toBe(n)
      expect(read(path), f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|var\(--(muted|text|border|bg-2)\)/i)
      expect(read(path), f).not.toMatch(/<NavLink[^>]*>\s*<button/)
    }
    expect(read('src/pages/home/HeroSection.jsx')).toMatch(/btn btn-accent btn-cta btn-glow/)
  })

  // 6.12a: taxtada bo'lmagan elementlar olib tashlandi (foydalanuvchi qarori); butun slayd — havola
  it("karusel: hisoblagich va \"Batafsil\" tugmasi yo'q (butun slayd havola); Home h2 da oltin chiziq yo'q; kartada toifa nuqtasi yo'q", () => {
    const car = read('src/pages/home/NewsCarousel.jsx')
    expect(car).not.toMatch(/carousel-counter|carousel-more|home\.news\.more|carousel-cat-dot/)
    expect(car).toMatch(/carousel-title__link/)
    expect(read('src/pages/home/NewsCard.jsx')).not.toMatch(/cat-dot/)
    expect(code).toMatch(/\.carousel-title__link::after \{ content: ""; position: absolute; inset: 0;/)
    expect(code).not.toMatch(/\.home-h2::after/)
    expect(read('src/pages/home/AboutSection.jsx')).toMatch(/home-h2/)
  })

  it("`.container-wide` — taxta bo'yicha 1200 px kontent (1264 − 2×32); sahifa foni `main::before/::after` (480 px, `--page-fade-top/bottom`), `body` da dog'lar yo'q", () => {
    expect(read('src/styles/components.css')).toMatch(/\.container-wide \{ max-width: 1264px;/)
    const g = read('src/styles/global.css')
    expect(g).not.toMatch(/--gradient-page/)
    expect(g).toMatch(/main \{ position: relative; \}/)
    expect(g).not.toMatch(/main \{[^}]*(isolation|z-index)/) // stacking context yaratmaydi (modal/navbar z-index'iga tegmaydi)
    expect(g).toMatch(/main::before,\s*main::after \{[^}]*z-index: -1;[^}]*height: 480px;[^}]*max-height: 100%;[^}]*pointer-events: none;/)
    expect(g).toMatch(/main::before \{ top: 0; background: var\(--page-fade-top\); \}/)
    expect(g).toMatch(/main::after \{ bottom: 0; background: var\(--page-fade-bottom\); \}/)
  })
})

describe('Bosqich 6.11d: Sehrli shlyapa', () => {
  const tokens = read('src/styles/tokens.css')
  const inline = f => (read(f).match(/style=\{/g) ?? []).length
  const SH = ['SortingHat.jsx', 'sortinghat/IntroStage.jsx', 'sortinghat/RegisterStage.jsx', 'sortinghat/QuizStage.jsx', 'sortinghat/ResultStage.jsx', 'sortinghat/Icons.jsx']
    .map(f => `src/pages/${f}`)

  it("yangi token `--ring-option` (tanlangan variant halqasi): Light + ikkala Dark blok", () => {
    expect(tokens).toMatch(/--ring-option:\s*rgb\(127 32 99 \/ 0\.12\)/)
    expect((tokens.match(/--ring-option:\s*rgb\(233 168 208 \/ 0\.16\)/g) ?? []).length).toBe(2)
  })

  it("Hero: umumiy `.inner-hero` ustida (padding 56/48), h1 ≤ 46 px, tavsif 620 px, fon yulduzlari .22; orqaga — 40 px pill", () => {
    expect(code).toMatch(/\.inner-hero\.sh-hero \{ padding: 56px 0 48px; \}/)
    expect(code).toMatch(/\.sh-hero \.inner-hero__title \{ font-size: clamp\(2rem, 1\.2rem \+ 3vw, 2\.875rem\); \}/)
    expect(code).toMatch(/\.sh-hero \.inner-hero__sub \{ max-width: 620px; \}/)
    expect(code).toMatch(/\.sh-hero__star \{[^}]*opacity: 0\.22;/)
    expect(code).toMatch(/\.sh-back \{[^}]*min-height: 40px;[^}]*background: var\(--color-brand-subtle\);/)
    expect(code).toMatch(/\.sh-back:hover \{ border-color: var\(--color-brand\);/)
  })

  it("Konteyner 760 px, Intro setkasi aniq 4 ustun (auto-fit va minmax(128px) yo'q)", () => {
    expect(code).toMatch(/\.container\.sh-wrap \{ max-width: 824px; \}/)
    expect(code).toMatch(/\.sh-info \{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);[^}]*gap: 16px;/)
    expect(code).not.toMatch(/auto-fit/)
  })

  it("Variantlar: 2 px chegara, radius 14, harf 36 px; tanlangan — `--ring-option` halqasi; `scale()` yo'q, hover faqat chegara", () => {
    expect(code).toMatch(/\.sh-opt \{[^}]*padding: 16px 20px;[^}]*border: 2px solid var\(--color-border\);[^}]*border-radius: 14px;[^}]*font-size: 1rem;/)
    expect(code).toMatch(/\.sh-opt\[data-selected="true"\] \{[^}]*background: var\(--color-brand-subtle\);[^}]*box-shadow: 0 0 0 4px var\(--ring-option\);/)
    expect(code).toMatch(/\.sh-opt:hover:not\(:disabled, \[data-selected="true"\]\) \{ border-color: var\(--color-brand\); \}/)
    // taxta: harf doirasi 36 + 2×2 chegara (box-sizing yo'q) = 40 px
    expect(code).toMatch(/\.sh-opt-letter \{[^}]*width: 40px;[^}]*height: 40px;/)
    expect(code).not.toMatch(/\.sh-opt[^{]*\{[^}]*scale\(/)
  })

  it("Progress/nuqtalar: holat `data-state`; animatsiya faqat `no-preference` da", () => {
    expect(code).toMatch(/\.sh-progress__bar \{ height: 8px;/)
    expect(code).toMatch(/\.sh-dot\[data-state="current"\] \{ width: 22px;/)
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.sh-progress__fill \{ transition: width 0\.4s ease; \}/)
  })

  it("Register: input 52 px, \"Boshlash\" bo'sh holatda kulrang fon emas, `opacity .5` (+ `not-allowed` `.btn` dan)", () => {
    expect(code).toMatch(/\.sh-register \.input\.input--lg \{ min-height: 52px;[^}]*font-size: 1rem;/)
    expect(code).toMatch(/\.btn\.sh-register__submit:disabled \{[^}]*background: var\(--color-brand-fill\);[^}]*opacity: 0\.5;/)
  })

  it("Result: yo'nalish plitkasi hamma yo'nalishda bitta brend gradient; birinchi karta — oltin hairline + oltin pill; CTA — surface-2", () => {
    expect(code).toMatch(/\.sh-fac__tile\.tile \{[^}]*linear-gradient\(135deg, var\(--color-brand-fill\), var\(--color-brand-hover\)\)/)
    expect(code).toMatch(/\.card\.sh-fac\[data-best="true"\]::before \{[^}]*var\(--gradient-hairline\)/)
    expect(code).toMatch(/\.sh-fac__best \{[^}]*background: var\(--color-accent\);[^}]*color: var\(--color-on-accent\);/)
    expect(code).toMatch(/\.sh-cta \{[^}]*border-radius: 20px;[^}]*background: var\(--color-surface-2\);/)
    // taxta 6.12b: birinchi (eng mos) karta doimiy brend chegara + glow bilan ajralib turadi
    expect(code).toMatch(/\.card\.sh-fac\[data-best="true"\] \{[^}]*border-color: var\(--color-brand\);[^}]*var\(--glow-brand\)/)
  })

  it("JSX: hex/rgba yo'q, inline faqat dinamik (`--x/--y`, `--pct`), ichma-ich `<button>` yo'q; Data.jsx yo'nalish ranglari stilda ishlatilmaydi", () => {
    const counts = { 'SortingHat.jsx': 1, 'sortinghat/QuizStage.jsx': 1 }
    for (const f of SH) {
      const name = f.replace('src/pages/', '')
      expect(inline(f), name).toBe(counts[name] ?? 0)
      expect(read(f), name).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|var\(--(muted|text|border|bg-2)\)/i)
      expect(read(f), name).not.toMatch(/<NavLink[^>]*>\s*<button/)
    }
    expect(read('src/pages/sortinghat/ResultStage.jsx')).not.toMatch(/fac\.(color|grad)/)
    expect(read('src/pages/sortinghat/IntroStage.jsx')).not.toMatch(/INFO_CARD/)
  })
})

describe('Bosqich 6.12g: kichik farqlar (taxta bo\'yicha)', () => {
  const site = read('src/styles/site.css')

  it("Xalqaro banneri: globus ikonkasi (yulduz emas), 20 px", () => {
    const src = read('src/pages/International.jsx')
    expect(src).toMatch(/<Icon size=\{20\}><circle cx="12" cy="12" r="10"\/><line x1="2" y1="12" x2="22" y2="12"\/>/)
    expect(src).not.toMatch(/<polygon points="12 2 15\.09/)
  })

  it("Qabul qadam plitkasi va FAQ chevron doirasi: chegara `--tile-border` (Dark'da pushti, Light'da shaffof); ochiq FAQ chevronida chegara yo'q", () => {
    expect(code).toMatch(/\.step-icon \{[^}]*border: 1px solid var\(--tile-border\);/)
    expect(code).toMatch(/\.faq-card__chev \{[^}]*border: 1px solid var\(--tile-border\);/)
    expect(code).toMatch(/\.faq-card__q\[aria-expanded="true"\] \.faq-card__chev \{[^}]*border-color: transparent;/)
    expect(read('src/pages/FAQ.jsx')).toMatch(/<svg width="18" height="18"[^>]*strokeWidth="2\.4"/)
  })

  it("404 havola ikonkalari: Yangiliklar — qalam, Bog'lanish — telefon, Qabul — ikki qatorli hujjat", () => {
    const src = read('src/pages/NotFound.jsx')
    expect(src).toMatch(/\['news', '\/news', <><path d="M12 20h9"/)
    expect(src).toMatch(/\['contact', '\/contact', <path d="M22 16\.92v3/)
    expect(src).toMatch(/\['admission'[^\n]*<line x1="16" y1="13" x2="8" y2="13"[^\n]*<line x1="16" y1="17" x2="8" y2="17"/)
  })

  it("Navbar: ochiq guruh triggeri (hover/fokus) — wine tus + brend matn; oddiy havola hover'i neytral qoladi", () => {
    expect(site).toMatch(/\.nav-group:hover \.nav-group-trigger,\s*\.nav-group:focus-within \.nav-group-trigger \{[^}]*background: var\(--color-brand-subtle\);[^}]*color: var\(--color-brand\);/)
    expect(site).toMatch(/\.nav-link:hover \{[^}]*background: var\(--color-surface-2\);/)
  })

  it("FAQ javobi: eng ko'pi 680 px", () => {
    expect(code).toMatch(/\.faq-card__a \{[^}]*max-width: 680px;/)
  })

  it("Sehrli shlyapa rasmi: tekis ranglar (gradient yo'q), oltin bog'ich va uchi, oq nuqta; hex yo'q", () => {
    const src = read('src/pages/sortinghat/Icons.jsx')
    const hat = src.slice(src.indexOf('export const IcHat'), src.indexOf('export const IcStar'))
    expect(hat).not.toMatch(/linearGradient|url\(#|useId/)
    expect(hat).toMatch(/<path d="M40 8 L64 58 H16 Z" fill="var\(--color-brand-hover\)"/)
    expect(hat).toMatch(/<path d="M40 8 L56 48 H24 Z" fill="var\(--wine-900\)" opacity="\.85"/)
    expect(hat).toMatch(/<rect x="11" y="57" width="58" height="8" rx="4" fill="var\(--color-brand-fill\)"/)
    expect(hat).toMatch(/<circle cx="40" cy="11" r="2" fill="var\(--color-on-brand\)" opacity="\.5"/)
    expect(hat).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
  })
})

describe('Bosqich 6.12h: Dark karta gradienti (taxta bo\'yicha)', () => {
  const tokens = read('src/styles/tokens.css')
  const code = read('src/styles/pages.css').replace(/\/\*[\s\S]*?\*\//g, '')

  it("`--gradient-card` Dark'da taxtadagi to'xtash nuqtalari bilan (0 % → 60 %), ikkala Dark blokda", () => {
    const dark = tokens.match(/--gradient-card:\s*linear-gradient\(180deg, var\(--dark-surface-4\) 0%, var\(--dark-surface-3\) 60%\);/g) ?? []
    expect(dark).toHaveLength(2)
  })

  it("`--gradient-card-open` 3 joyda: Light tekis, Dark taxtadagi `#32282f → #2b2227`", () => {
    expect((tokens.match(/--gradient-card-open:/g) ?? []).length).toBe(3)
    expect((tokens.match(/--gradient-card-open:\s*linear-gradient\(180deg, #32282f 0%, #2b2227 60%\);/g) ?? []).length).toBe(2)
  })

  it("qidiruv chip hover'i: to'ldirilgan brend fon + `--color-on-brand` matn va ikonka (xCODER tanlovi, variant B)", () => {
    const site = read('src/styles/site.css')
    expect(site).toMatch(/\.search-chip:hover \{[^}]*border-color: var\(--color-brand-fill\);[^}]*background: var\(--color-brand-fill\);[^}]*color: var\(--color-on-brand\);/)
    expect(site).toMatch(/\.search-chip:hover > svg \{ color: var\(--color-on-brand\); \}/)
  })

  it("Qabul qadam kartasi va FAQ kartasi `--gradient-card` ishlatadi (tekis `surface-3` emas); ochiq FAQ `--gradient-card-open`", () => {
    expect(code).toMatch(/\.card\.step-card \{[^}]*background: var\(--gradient-card\);/)
    expect(code).not.toMatch(/\.card\.card--lift\.step-card/)
    expect(code).toMatch(/\.card\.faq-card \{[^}]*background: var\(--gradient-card\);/)
    expect(code).toMatch(/\.card\.faq-card\[data-open="true"\] \{[^}]*background: var\(--gradient-card-open\);/)
  })
})

describe('Bosqich 6.12i: modallar (skrollsiz yo\'nalish modali, o\'qituvchi modali)', () => {
  const code = read('src/styles/pages.css').replace(/\/\*[\s\S]*?\*\//g, '')

  it("yo'nalish modali ixcham: padding 1.25rem 1.5rem, past ekranlarda (`max-height: 780px`) qo'shimcha ixchamlik; kenglik taxtadagi 580 px", () => {
    expect(code).toMatch(/\.fac-modal \{[^}]*max-width: 580px;[^}]*padding: 1\.25rem 1\.5rem;/)
    expect(code).toMatch(/@media \(max-height: 780px\) and \(min-width: 521px\) \{[^}]*\.fac-modal \{ padding: 1rem 1\.25rem; \}/)
  })

  it("o'qituvchi modali: yo'nalish modali qobig'i (`.fac-modal*`), 440 px, 104 px avatar; faqat token (hex yo'q)", () => {
    expect(code).toMatch(/\.fac-modal\.t-modal \{ max-width: 440px; \}/)
    expect(code).toMatch(/\.avatar-wine\.t-modal__avatar \{[^}]*width: 104px;[^}]*height: 104px;/)
    expect(code).toMatch(/\.card\.teacher-card \{ cursor: pointer; \}/)
    const block = code.slice(code.indexOf('.fac-modal.t-modal'), code.indexOf('.fac-info.t-modal__info') + 120)
    expect(block).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    expect(read('src/pages/teachers/TeacherModal.jsx')).not.toMatch(/style=\{|#[0-9a-f]{3,8}\b|teacher\.email/i)
  })
})

describe('Bosqich 6.13: a11y (fokus halqasi) va performance (hero kirishi, harakatni kamaytirish)', () => {
  const code = read('src/styles/pages.css').replace(/\/\*[\s\S]*?\*\//g, '')
  const global = read('src/styles/global.css').replace(/\/\*[\s\S]*?\*\//g, '')

  it("karusel/lightbox boshqaruvlari to'q yuza ustida: fokus halqasi `--color-brand-on-dark`; galereya strelkasi — oq halqa + to'q oraliq", () => {
    expect(code).toMatch(/\.carousel :focus-visible,\s*\.photo-lightbox :focus-visible \{ outline-color: var\(--color-brand-on-dark\); \}/)
    expect(code).toMatch(/\.gallery-arrow:focus-visible \{ outline-color: rgb\(255 255 255 \/ 1\); box-shadow: 0 0 0 4px rgb\(0 0 0 \/ 0\.6\); \}/)
  })

  it("hero kirishi `.enter`: faqat transform (opacity yo'q) — LCP elementi opacity:0 + JS kuzatuvchi kutmaydi; HeroSection'da `.reveal` yo'q", () => {
    const kf = global.match(/@keyframes enterUp \{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(kf).toMatch(/translateY/)
    expect(kf).not.toMatch(/opacity/)
    expect(read('src/pages/home/HeroSection.jsx')).not.toMatch(/className="[^"]*\breveal\b/)
  })

  it("`prefers-reduced-motion: reduce` da `.reveal` darhol ko'rinadi, `.fade-up` va `.enter` animatsiyasiz", () => {
    expect(global).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.reveal \{ opacity: 1; transform: none; transition: none; \}\s*\.fade-up, \.enter \{ animation: none; \}/)
  })
})

describe('Bosqich 6.16: taxta farqlari', () => {
  const sources = ['src/styles/pages.css', 'src/styles/site.css'].map(read).join('\n')

  it("`backdrop-filter`: prefiksli (`-webkit-`) birinchi, standart oxirida — aks holda Vite/Lightning CSS standartini tashlab yuboradi va Chrome'da modal orqasi xiralashmaydi", () => {
    const rules = [...sources.matchAll(/\{[^{}]*backdrop-filter[^{}]*\}/g)].map(m => m[0])
    expect(rules.length).toBeGreaterThan(4)
    for (const r of rules) {
      if (!r.includes('-webkit-backdrop-filter')) continue
      expect(r.indexOf('-webkit-backdrop-filter'), r).toBeLessThan(r.search(/[^-]backdrop-filter/))
    }
  })

  it("`.tile`: chegara `--tile-border` (Dark'da pushti, Light'da shaffof) — taxtadagi Dark plitka chegarasi", () => {
    expect(css).toMatch(/\.tile \{[^}]*border: 1px solid var\(--tile-border\);[^}]*border-radius: var\(--radius-2xl\);/)
  })

  it("qidiruv paneli (desktop): tugma ostidan 35 px (avval 10 px); mobil (`top: 70px`, `position: fixed`) o'zgarmagan", () => {
    const site = read('src/styles/site.css')
    expect(site).toMatch(/\.search-panel \{\s*position: absolute;\s*top: calc\(100% \+ 35px\);/)
    expect(site).toMatch(/@media \(max-width: 768px\) \{\s*\.search-panel \{\s*position: fixed;\s*top: 70px;/)
  })

  it("Vakansiya «Yuborilmoqda...»: matn oldidagi SVG spinner (`.vac-spin`) olib tashlangan; faqat tugmaning `[aria-busy]::after` halqasi qoladi", () => {
    expect(read('src/pages/vacancies/ApplicationForm.jsx')).not.toMatch(/vac-spin/)
    expect(css).not.toMatch(/\.vac-spin/)
    expect(read('src/styles/components.css')).toMatch(/\.btn\[aria-busy="true"\]::after \{/)
  })

  it("video poster (taxta «NewsVideo»): doira «play» 62 px, oq .16 fon va .34 chegara; faqat token/oq-qora rgb (hex yo'q); fokus halqasi ichkarida (frame `overflow:hidden`)", () => {
    const block = css.slice(css.indexOf('.shorts-thumb {'), css.indexOf('.shorts-play__disc { transition: none; }') + 60)
    expect(block).toMatch(/\.shorts-play__disc \{[^}]*width: 62px;[^}]*height: 62px;[^}]*background: rgb\(255 255 255 \/ 0\.16\);[^}]*border: 1px solid rgb\(255 255 255 \/ 0\.34\);/)
    expect(block).toMatch(/\.shorts-play:focus-visible \{ outline-color: var\(--color-brand-on-dark\); outline-offset: -4px; \}/)
    expect(block).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })
})

describe('Bosqich 6.17: Vakansiya «Umumiy talablar» kartasi — taxta', () => {
  it("`.card.vac-req-card`: `--gradient-card` fon va `--shadow-card-board` soya (taxtadagi o'lchangan qiymatlar); hover/lift yo'q — karta bosilmaydi", () => {
    expect(css).toMatch(/\.card\.vac-req-card \{[^}]*padding: 32px 36px;[^}]*border-radius: 18px;[^}]*background: var\(--gradient-card\);[^}]*box-shadow: var\(--shadow-card-board\);[^}]*\}/)
    expect(css).not.toMatch(/\.vac-req-card[^{]*:hover/)
    expect(read('src/pages/vacancies/InfoTab.jsx')).not.toMatch(/vac-req-card[^"]*card--lift/)
  })

  it("tokenlar taxtaga teng: Light soya `0 1px 2px .05 + 0 10px 26px .06`; Dark — `inset 0 1px .06` + `0 10px 28px .35`, gradient `#2c2429 → #271f24 60%`", () => {
    const tokens = read('src/styles/tokens.css')
    expect(tokens).toMatch(/--shadow-card-board:\s*0 1px 2px rgb\(28 22 26 \/ 0\.05\), 0 10px 26px rgb\(28 22 26 \/ 0\.06\);/)
    expect(tokens).toMatch(/--shadow-card-board:\s*inset 0 1px 0 rgb\(255 255 255 \/ 0\.06\), 0 10px 28px rgb\(0 0 0 \/ 0\.35\);/)
    expect(tokens).toMatch(/--gradient-card:\s*linear-gradient\(180deg, var\(--dark-surface-4\) 0%, var\(--dark-surface-3\) 60%\);/)
    expect(tokens).toMatch(/--dark-surface-4:\s*#2c2429;/)
    expect(tokens).toMatch(/--dark-surface-3:\s*#271f24;/)
  })
})
