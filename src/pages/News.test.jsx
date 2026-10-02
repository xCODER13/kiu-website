import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import News from './News'
import { mockApi } from '../test/helpers'
import { getCategoryToken } from '../utils/newsCategories'

const A1 = { _id: 'a1', title: 'Birinchi yangilik', content: 'Birinchi tavsif', category: "ta'lim", views: 10, createdAt: '2026-01-01' }
const A2 = { _id: 'a2', title: 'Ikkinchi yangilik', content: 'Ikkinchi tavsif', category: 'sport', views: 5, createdAt: '2026-01-02' }
const SHORT1 = { _id: 's1', videoId: 'abc123XYZ', title: 'Qisqa video 1' }

function renderNews() {
  return render(
    <MemoryRouter>
      <News />
    </MemoryRouter>
  )
}

// News.jsx bo'lingandan keyin (news/NewsTab.jsx, news/ShortsTab.jsx, news/FeaturedCarousel.jsx,
// news/NewsCard.jsx) — bu test orkestrator + bo'lingan komponentlarning birga to'g'ri ishlashini
// tekshiradi (birlik testi emas, integratsiya darajasida).
describe('News (public)', () => {
  it('yuklanish paytida "Yuklanmoqda..." ko\'rsatadi', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderNews()
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()
  })

  it("yangilik yo'q bo'lsa bo'sh holat xabari ko'rsatiladi", async () => {
    mockApi({ 'GET /news': [] })
    renderNews()
    expect(await screen.findByText("Hozircha yangiliklar yo'q")).toBeInTheDocument()
  })

  it('muvaffaqiyatli javob — featured carousel (h2) va kartalar (h3) ikkalasi ham ko\'rsatiladi', async () => {
    mockApi({ 'GET /news': [A1, A2] })
    renderNews()
    expect(await screen.findByRole('heading', { level: 2, name: 'Birinchi yangilik' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Birinchi yangilik' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Ikkinchi yangilik' })).toBeInTheDocument()
    // Har ikkalasi ham (carousel'dagi badge + kartadagi badge) ko'rsatiladi
    expect(screen.getAllByText("Ta'lim").length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sport').length).toBeGreaterThan(0)
  })

  it('qidiruv — mos kelmagan yangiliklarni yashiradi', async () => {
    mockApi({ 'GET /news': [A1, A2] })
    const user = userEvent.setup()
    renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })

    await user.type(screen.getByPlaceholderText('Yangiliklar ichida qidiring...'), 'Ikkinchi')
    expect(screen.queryByRole('heading', { level: 3, name: 'Birinchi yangilik' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Ikkinchi yangilik' })).toBeInTheDocument()
  })

  it('kategoriya filtri — faqat tanlangan kategoriyadagi yangiliklarni ko\'rsatadi', async () => {
    mockApi({ 'GET /news': [A1, A2] })
    const user = userEvent.setup()
    renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })

    await user.click(screen.getByRole('button', { name: /Sport/ }))
    expect(screen.queryByRole('heading', { level: 3, name: 'Birinchi yangilik' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Ikkinchi yangilik' })).toBeInTheDocument()
  })

  it("'Video' tabiga o'tilganda backend'dan kelgan short ko'rsatiladi", async () => {
    mockApi({ 'GET /news': [A1, SHORT1] })
    const user = userEvent.setup()
    renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })

    await user.click(screen.getByRole('button', { name: /Video/ }))
    expect(screen.getByText('Qisqa video 1')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3, name: 'Birinchi yangilik' })).not.toBeInTheDocument()
  })

  it("'Video' tabida backend'dan short kelmasa, bo'sh holat xabari ko'rsatiladi", async () => {
    mockApi({ 'GET /news': [A1] })
    const user = userEvent.setup()
    renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })

    await user.click(screen.getByRole('button', { name: /Video/ }))
    expect(screen.getByText("Hozircha video yo'q")).toBeInTheDocument()
  })
})

// Bosqich 5b: inline stillar → klasslar. Inline faqat dinamik qiymat uchun qoladi.
// 6.11b: toifa rangi endi `--cat` o'zgaruvchisi (rang xossalari — `color`/`border-color`/`background` — inline emas), rasm — `background-image`.
describe('News — inline stillar klassga ko\'chirilgan (Bosqich 5b, 6.11b)', () => {
  const ALLOWED = /^(--cat|background-image)$/

  function inlineProps(container) {
    const props = []
    container.querySelectorAll('[style]').forEach(el => {
      // jsdom `background` stenografiyasini bo'laklarga ajratadi → xossa nomlarini atribut matnidan olamiz
      const names = (el.getAttribute('style') || '').split(';').map(d => d.split(':')[0].trim()).filter(Boolean)
      for (const name of names) props.push([el.className, name])
    })
    return props
  }

  it("`<style>` teglari yo'q va inline faqat dinamik qiymatlar: `--cat` (toifa) va `background-image` (news tab)", async () => {
    mockApi({ 'GET /news': [A1, A2] })
    const { container } = renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })
    expect(document.querySelectorAll('style')).toHaveLength(0)
    const bad = inlineProps(container).filter(([, n]) => !ALLOWED.test(n))
    expect(bad).toEqual([])
  })

  // 6.11b: tablar hero ichidagi pill (`.kiu-tab-btn`, 6.11a bilan bir xil); eski `.tab` klassi o'rniga `aria-pressed` ham qo'shildi (a11y).
  it("tablar: faol holat `data-active` va `aria-pressed` da, bosilganda almashadi (rol `button` o'zgarmagan)", async () => {
    mockApi({ 'GET /news': [A1, SHORT1] })
    const user = userEvent.setup()
    renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })
    const newsTab = screen.getByRole('button', { name: /Yangiliklar/ })
    const videoTab = screen.getByRole('button', { name: /Video/ })
    expect(newsTab).toHaveClass('kiu-tab-btn')
    expect(newsTab).toHaveAttribute('data-active', 'true')
    expect(newsTab).toHaveAttribute('aria-pressed', 'true')
    expect(videoTab).toHaveAttribute('data-active', 'false')
    expect(videoTab).toHaveAttribute('aria-pressed', 'false')
    await user.click(videoTab)
    expect(videoTab).toHaveAttribute('data-active', 'true')
    expect(videoTab).toHaveAttribute('aria-pressed', 'true')
    expect(newsTab).toHaveAttribute('data-active', 'false')
    expect(newsTab).toHaveAttribute('aria-pressed', 'false')
  })

  // 6.11b: rang xossalari inline emas — har tugmada faqat `--cat` (faol/nofaol farqi `data-active` orqali CSS da).
  it("toifa tugmasi: inline faqat `--cat` (palitra tokeni), faol holat `data-active` da", async () => {
    mockApi({ 'GET /news': [A1, A2] })
    const user = userEvent.setup()
    renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })
    const all = screen.getByRole('button', { name: /^Barchasi/ })
    const sport = screen.getByRole('button', { name: /Sport/ })
    expect(all).toHaveAttribute('data-active', 'true')
    expect(all.style.getPropertyValue('--cat')).toBe('var(--color-brand)')
    expect(sport).toHaveAttribute('data-active', 'false')
    expect(sport.style.getPropertyValue('--cat')).toBe(getCategoryToken('sport'))
    expect(sport.style.getPropertyValue('--cat')).toBe('var(--chart-3)')
    expect(sport.style.length).toBe(1)
    await user.click(sport)
    expect(sport).toHaveAttribute('data-active', 'true')
    expect(all).toHaveAttribute('data-active', 'false')
    expect(all.style.getPropertyValue('--cat')).toBe('var(--color-brand)') // rang holatga bog'liq emas
  })

  it("karta: hover JS'da emas — `onMouseEnter` inline stilni o'zgartirmaydi; yagona inline `--cat` (toifa tokeni)", async () => {
    mockApi({ 'GET /news': [A1] })
    const user = userEvent.setup()
    const { container } = renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })
    const card = container.querySelector('.news-card')
    expect(card).toHaveClass('card', 'card-link')
    const before = card.getAttribute('style')
    expect(before).toBe('--cat: var(--chart-2);') // "ta'lim" → 2-o'rin (spec, qaror 22)
    await user.hover(card)
    expect(card.getAttribute('style')).toBe(before)
    const btn = card.querySelector('.news-card-btn')
    expect(btn).toHaveClass('btn', 'btn-primary')
    await user.hover(btn)
    expect(btn.style.length).toBe(0)
  })

  it("karta: yuklanmagan rasm `data-broken` bilan yashiriladi (inline `display` yo'q); rasmsiz karta — gradient placeholder", async () => {
    mockApi({ 'GET /news': [{ ...A1, image: 'https://example.com/x.jpg' }, A2] })
    const { container } = renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Ikkinchi yangilik' })
    const img = container.querySelector('.news-card-img')
    fireEvent.error(img)
    expect(img).toHaveAttribute('data-broken', 'true')
    expect(img.style.length).toBe(0)
    expect(container.querySelectorAll('.news-card-ph')).toHaveLength(1)
    expect(container.querySelector('.news-card-ph').hasAttribute('style')).toBe(false)
  })

  it("toifa belgisi: nuqta (`.cat-dot`) dekorativ; karusel pill'i `--cat` oladi; noma'lum toifa — brand tokeni", async () => {
    mockApi({ 'GET /news': [A1, { ...A2, category: 'boshqa-toifa' }] })
    const { container } = renderNews()
    await screen.findByRole('heading', { level: 2, name: 'Birinchi yangilik' })
    expect(container.querySelector('.carousel-cat').style.getPropertyValue('--cat')).toBe('var(--chart-2)')
    expect(container.querySelector('.carousel-cat-dot')).toHaveAttribute('aria-hidden', 'true')
    const unknown = screen.getByRole('heading', { level: 3, name: 'Ikkinchi yangilik' }).closest('.news-card')
    const known = screen.getByRole('heading', { level: 3, name: 'Birinchi yangilik' }).closest('.news-card')
    expect(unknown.style.getPropertyValue('--cat')).toBe('var(--color-brand)')
    expect(known.querySelector('.cat-dot')).toHaveAttribute('aria-hidden', 'true')
  })

  it("karusel: fon rasmi bo'lmasa inline `background-image` yo'q (CSS dagi gradient), kuzatilgan o'tish tugmasi va nuqtalar klass bilan", async () => {
    mockApi({ 'GET /news': [A1, A2] })
    const { container } = renderNews()
    await screen.findByRole('heading', { level: 2, name: 'Birinchi yangilik' })
    expect(container.querySelector('.carousel-bg').style.length).toBe(0)
    expect(container.querySelectorAll('.carousel-dot')).toHaveLength(2)
    expect(container.querySelector('.carousel-dot[aria-current="true"]')).not.toBeNull()
  })

  it("karusel: rasm bo'lsa inline faqat `background-image`", async () => {
    mockApi({ 'GET /news': [{ ...A1, image: 'https://example.com/a.jpg' }] })
    const { container } = renderNews()
    await screen.findByRole('heading', { level: 2, name: 'Birinchi yangilik' })
    const bg = container.querySelector('.carousel-bg')
    expect(bg.style.backgroundImage).toContain('https://example.com/a.jpg')
    expect(bg.getAttribute('style').split(';').map(d => d.split(':')[0].trim()).filter(Boolean)).toEqual(['background-image'])
  })

  it("Video tabi: `<style>` va inline yo'q (YouTube rangi tokendan)", async () => {
    mockApi({ 'GET /news': [A1, SHORT1] })
    const user = userEvent.setup()
    const { container } = renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })
    await user.click(screen.getByRole('button', { name: /Video/ }))
    expect(container.querySelectorAll('.shorts-card').length).toBe(1)
    expect(document.querySelectorAll('style')).toHaveLength(0)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it("yuklanish holati: `.spinner` klassi va `<style>` yo'q", () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { container } = renderNews()
    expect(container.querySelector('.page-loading .spinner')).not.toBeNull()
    expect(document.querySelectorAll('style')).toHaveLength(0)
  })
})
