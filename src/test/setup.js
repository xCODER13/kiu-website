// Barcha frontend testlari uchun umumiy sozlama (vite.config.js -> test.setupFiles).
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom'da IntersectionObserver yo'q, App esa (ScrollReveal) uni ishlatadi.
// Standart: hech narsa qilmaydigan stub. Kerak bo'lgan testlar o'zining boshqariladigan
// versiyasini vi.stubGlobal bilan beradi (masalan useReveal testi).
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

beforeEach(() => {
  globalThis.IntersectionObserver = NoopIntersectionObserver
})

afterEach(() => {
  cleanup()
  // Testlar orasida holat qolib ketmasin (token, tema)
  localStorage.clear()
  document.title = ''
  document.documentElement.removeAttribute('data-theme')
})
