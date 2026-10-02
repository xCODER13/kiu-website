import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import News from './News'
import { mockApi } from '../test/helpers'

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

// Bosqich 5b: inline stillar → klasslar. Inline faqat dinamik qiymat (toifa rangi, rasm manzili) uchun qoladi.
describe('News — inline stillar klassga ko\'chirilgan (Bosqich 5b)', () => {
  const ALLOWED = /^(background|background-image|color|border-color)$/

  function inlineProps(container) {
    const props = []
    container.querySelectorAll('[style]').forEach(el => {
      // jsdom `background` stenografiyasini bo'laklarga ajratadi → xossa nomlarini atribut matnidan olamiz
      const names = (el.getAttribute('style') || '').split(';').map(d => d.split(':')[0].trim()).filter(Boolean)
      for (const name of names) props.push([el.className, name])
    })
    return props
  }

  it("`<style>` teglari yo'q va inline faqat dinamik rang xossalari (news tab)", async () => {
    mockApi({ 'GET /news': [A1, A2] })
    const { container } = renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })
    expect(document.querySelectorAll('style')).toHaveLength(0)
    const bad = inlineProps(container).filter(([, n]) => !ALLOWED.test(n))
    expect(bad).toEqual([])
  })

  it("tablar: faol holat `data-active` da, bosilganda almashadi (rol `button` o'zgarmagan)", async () => {
    mockApi({ 'GET /news': [A1, SHORT1] })
    const user = userEvent.setup()
    renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })
    const newsTab = screen.getByRole('button', { name: /Yangiliklar/ })
    const videoTab = screen.getByRole('button', { name: /Video/ })
    expect(newsTab).toHaveClass('tab')
    expect(newsTab).toHaveAttribute('data-active', 'true')
    expect(videoTab).toHaveAttribute('data-active', 'false')
    await user.click(videoTab)
    expect(videoTab).toHaveAttribute('data-active', 'true')
    expect(newsTab).toHaveAttribute('data-active', 'false')
  })

  it("toifa tugmasi: faol bo'lganda inline rang (ma'lumotdan), faol bo'lmaganda inline yo'q", async () => {
    mockApi({ 'GET /news': [A1, A2] })
    const user = userEvent.setup()
    renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })
    const all = screen.getByRole('button', { name: /^Barchasi/ })
    const sport = screen.getByRole('button', { name: /Sport/ })
    expect(all).toHaveAttribute('data-active', 'true')
    expect(all.getAttribute('style')).toMatch(/border-color/)
    expect(sport).toHaveAttribute('data-active', 'false')
    expect(sport.style.length).toBe(0)
    await user.click(sport)
    expect(sport).toHaveAttribute('data-active', 'true')
    expect(sport.getAttribute('style')).toMatch(/border-color/)
    expect(all.style.length).toBe(0) // React xossalarni olib tashlagach atribut bo'sh qoladi
  })

  it("karta hover'i JS'da emas: `onMouseEnter` inline transform/box-shadow qo'ymaydi", async () => {
    mockApi({ 'GET /news': [A1] })
    const user = userEvent.setup()
    const { container } = renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })
    const card = container.querySelector('.news-card')
    expect(card).toHaveClass('card', 'card-link')
    await user.hover(card)
    expect(card.style.length).toBe(0)
    const btn = card.querySelector('.news-card-btn')
    await user.hover(btn)
    expect(btn.style.length).toBe(0)
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
