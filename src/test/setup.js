// Barcha frontend testlari uchun umumiy sozlama (vite.config.js -> test.setupFiles).
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
// Global i18n nusxasi (uz) — Provider'siz render qilinadigan komponent testlari o'zbekcha matn ko'rsin
import i18n from '../i18n'
import en from '../i18n/locales/en.json'
import ru from '../i18n/locales/ru.json'
// en/ru ilovada lazy yuklanadi; testlarda sinxron render uchun oldindan qo'shiladi (lazy mantiq i18n/lazy.test.jsx da)
i18n.addResourceBundle('en', 'translation', en)
i18n.addResourceBundle('ru', 'translation', ru)

// jsdom'da IntersectionObserver yo'q, App esa (ScrollReveal) uni ishlatadi.
// Standart: hech narsa qilmaydigan stub. Kerak bo'lgan testlar o'zining boshqariladigan
// versiyasini vi.stubGlobal bilan beradi (masalan useReveal testi).
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

// jsdom'da haqiqiy layout mavjud emas (barcha elementlar o'lchami doim 0),
// shuning uchun ResizeObserver'ga tayanadigan komponentlar (masalan visx'ning
// ParentSize — admin/charts/*.jsx) hech qachon haqiqiy kenglik olmaydi.
// Band 6 (admin statistika dashboard grafiklari) uchun qo'shilgan: observe()
// chaqirilganda darhol (keyingi mikroteskda) sobit, nolga teng bo'lmagan
// o'lcham bilan callback'ni chaqiradigan soxta implementatsiya.
class StubResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe(target) {
    const rect = { width: 600, height: 240, top: 0, left: 0, bottom: 240, right: 600, x: 0, y: 0 }
    Promise.resolve().then(() => {
      this.callback([{ target, contentRect: rect }])
    })
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  globalThis.IntersectionObserver = NoopIntersectionObserver
  globalThis.ResizeObserver = StubResizeObserver
  // jsdom'da `window.scrollTo` yo'q ("Not implemented" shovqini) — ScrollToTop sahifa almashganda chaqiradi.
  // Kerak bo'lgan testlar o'zining `vi.fn()` / `vi.spyOn` ini beradi.
  window.scrollTo = () => {}
})

afterEach(() => {
  cleanup()
  // Testlar orasida holat qolib ketmasin (token, tema)
  localStorage.clear()
  document.title = ''
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('lang')
  document.head.querySelectorAll('link[data-hreflang], script[type="application/ld+json"]').forEach(el => el.remove())
})
