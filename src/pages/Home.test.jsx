import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'
import config from '../config'
import { mockApi } from '../test/helpers'

const N1 = { _id: 'n1', title: 'Birinchi yangilik', category: 'umumiy', createdAt: '2026-01-01' }
const N2 = { _id: 'n2', title: 'Ikkinchi yangilik', category: "ta'lim", createdAt: '2026-01-02' }

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

describe('Home (smoke test)', () => {
  it("qulamasdan render bo'ladi va asosiy (hero) tarkib ko'rsatiladi", () => {
    mockApi({ 'GET /news': [] })
    renderHome()
    // Sarlavhaning oxirgi so'zi brend rangidagi alohida `span` (6.12a) — matn bo'laklarga bo'lingan
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(config.university.name)
    expect(screen.getByText('Qabul haqida')).toBeInTheDocument()
    expect(screen.getByText("Qarshi Xalqaro Universiteti haqida")).toBeInTheDocument()
  })

  it('yangiliklar yuklanayotganda skeleton ko\'rsatiladi, xato/bo\'sh xabari chiqmaydi', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderHome()
    expect(screen.queryByText("Hozircha yangiliklar yo'q.")).not.toBeInTheDocument()
    expect(screen.queryByText(/ulanib bo'lmadi/)).not.toBeInTheDocument()
  })

  it('muvaffaqiyatli javobda karusel va so\'nggi yangilik kartalari ko\'rsatiladi', async () => {
    mockApi({ 'GET /news': [N1, N2] })
    renderHome()
    expect(await screen.findByRole('region', { name: "So'nggi yangiliklar" })).toBeInTheDocument()
    expect(screen.getAllByText('Birinchi yangilik').length).toBeGreaterThan(0)
    expect(screen.getByText('Ikkinchi yangilik')).toBeInTheDocument()
  })

  it("server xatosida qulamaydi — mos xabar ko'rsatiladi", async () => {
    mockApi({ 'GET /news': { status: 500, body: {} } })
    renderHome()
    expect(await screen.findByText("Yangiliklar serveriga ulanib bo'lmadi.")).toBeInTheDocument()
  })

  it('regressiya: javob massiv bo\'lmasa ({error}) — ".filter is not a function" bilan qulamaydi', async () => {
    mockApi({ 'GET /news': { error: "noto'g'ri format" } })
    renderHome()
    // useApi bunda xato deb belgilamaydi (ok:true), shuning uchun "bo'sh" xabari chiqadi
    expect(await screen.findByText("Hozircha yangiliklar yo'q.")).toBeInTheDocument()
  })
})

describe('Home — <style> va `!important` CSS ga ko\'chirilgan (Bosqich 5c)', () => {
  it("`<style>` yo'q; hero tarmog'i va statistika inline stilsiz (qiymatlar pages.css da)", () => {
    mockApi({ 'GET /news': [] })
    const { container } = renderHome()
    expect(document.querySelectorAll('style')).toHaveLength(0)
    // 6.11c5: klass nomlari yangilandi (`.hero-grid/.stats-grid/.hero-photo-wrap` → `.home-hero__grid/.home-stats/.home-hero__photo`)
    expect(container.querySelector('.home-hero__grid').hasAttribute('style')).toBe(false)
    expect(container.querySelector('.home-hero .home-stats').hasAttribute('style')).toBe(false)
    expect(container.querySelector('.home-hero__photo').hasAttribute('style')).toBe(false)
  })
})

// Bosqich 6.11c5: Bosh sahifa qayta dizayni (Hero, Biz haqimizda, Yangiliklar).
describe('Home — qayta dizayn (Bosqich 6.11c5)', () => {
  const NEWS = [
    { _id: 'n1', title: 'Birinchi yangilik', category: 'umumiy', createdAt: '2026-01-01', image: 'https://x.test/a.png' },
    { _id: 'n2', title: 'Ikkinchi yangilik', category: "ta'lim", createdAt: '2026-01-02' },
    { _id: 'n3', title: 'Uchinchi yangilik', category: 'noma\'lum-toifa', createdAt: '2026-01-03' },
  ]

  it("Hero: CTA — havola (`a.btn`), ichma-ich `<button>` yo'q; ikkinchisi `btn-accent`", () => {
    mockApi({ 'GET /news': [] })
    const { container } = renderHome()
    const admission = screen.getByRole('link', { name: 'Qabul haqida' })
    expect(admission).toHaveClass('btn', 'btn-primary')
    expect(admission).toHaveAttribute('href', '/admission')
    expect(screen.getByRole('link', { name: "Yo'nalishlar" })).toHaveClass('btn', 'btn-accent')
    expect(container.querySelectorAll('a button')).toHaveLength(0)
  })

  it("Hero: 4 ta statistika plitkasi (`stat-0…3` id'lari saqlangan), faqat tashkil yili `.stat-2022`; rasm o'lchamli va `fetchpriority`", () => {
    mockApi({ 'GET /news': [] })
    const { container } = renderHome()
    const tiles = container.querySelectorAll('.stat-tile')
    expect(tiles).toHaveLength(4)
    for (let i = 0; i < 4; i++) expect(container.querySelector(`#stat-${i}`)).toHaveClass('stat-tile__num')
    expect(container.querySelectorAll('.stat-2022')).toHaveLength(1)
    expect(container.querySelector('.stat-2022')).toHaveAttribute('data-stat', 'founded')
    const img = container.querySelector('.home-hero__frame img')
    expect(img).toHaveAttribute('width', '768')
    expect(img).toHaveAttribute('height', '512')
    expect(img).toHaveAttribute('fetchpriority', 'high')
    expect(container.querySelector('.hero-badge__dot')).toHaveAttribute('aria-hidden', 'true')
  })

  it("Biz haqimizda: 4 ta afzallik kartasi, hech biri doimiy \"faol\" belgilanmagan (`data-featured` yo'q); ikonkalar dekorativ", () => {
    mockApi({ 'GET /news': [] })
    const { container } = renderHome()
    const cards = container.querySelectorAll('.home-feature')
    expect(cards).toHaveLength(4)
    expect(container.querySelectorAll('[data-featured]')).toHaveLength(0)
    container.querySelectorAll('.home-feature svg').forEach(svg => expect(svg).toHaveAttribute('aria-hidden', 'true'))
    expect(container.querySelector('.home-about__frame img')).toHaveAttribute('loading', 'lazy')
  })

  it("Yangiliklar: karta — butun havola (`/news/:id`), rasm `alt=\"\"`, toifa `--cat` tokeni; noma'lum toifa — brend", async () => {
    mockApi({ 'GET /news': NEWS })
    const { container } = renderHome()
    await screen.findByText('Ikkinchi yangilik')
    const cards = container.querySelectorAll('a.news-card')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('href', '/news/n1')
    expect(cards[0].style.getPropertyValue('--cat')).toBe('var(--chart-1)')
    expect(cards[1].style.getPropertyValue('--cat')).toBe('var(--chart-2)')
    expect(cards[2].style.getPropertyValue('--cat')).toBe('var(--color-brand)')
    expect(cards[0].querySelector('img')).toHaveAttribute('alt', '')
    expect(cards[1].querySelector('.news-card-ph')).not.toBeNull() // rasmsiz — placeholder
    expect(container.querySelectorAll('a.news-card button')).toHaveLength(0)
  })

  it("Karusel: `role=region`, tugmalar nomli, nuqta `aria-current`; butun slayd — bitta havola (hisoblagich va \"Batafsil\" yo'q, 6.12a); strelka keyingi yangilikka o'tadi", async () => {
    mockApi({ 'GET /news': NEWS })
    const { container } = renderHome()
    const region = await screen.findByRole('region', { name: "So'nggi yangiliklar" })
    const link = within(region).getByRole('link')
    expect(link).toHaveClass('carousel-title__link')
    expect(link).toHaveAttribute('href', '/news/n1')
    expect(within(region).queryByText(/Batafsil/)).toBeNull()
    expect(within(region).getAllByRole('button').length).toBe(2 + NEWS.length)
    expect(container.querySelectorAll('.carousel-dot[aria-current="true"]')).toHaveLength(1)
    expect(container.querySelector('.carousel-counter')).toBeNull()
    expect(region.querySelector('time.carousel-date')).toBeInTheDocument()
    const user = (await import('@testing-library/user-event')).default.setup()
    await user.click(within(region).getByRole('button', { name: 'Keyingi' }))
    expect(within(region).getByRole('link')).toHaveAttribute('href', '/news/n2')
  })

  it("Yuklanish: `role=status` + `aria-busy`, skeleton dekorativ; xato — `role=alert`, bo'sh — `role=status`", async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { container, unmount } = renderHome()
    const busy = container.querySelector('[aria-busy="true"]')
    expect(busy).toHaveAttribute('role', 'status')
    expect(busy.querySelectorAll('.home-skel')).toHaveLength(4)
    busy.querySelectorAll('.home-skel').forEach(el => expect(el.closest('[aria-hidden="true"]') ?? el).toHaveAttribute('aria-hidden', 'true'))
    unmount()
    mockApi({ 'GET /news': { status: 500, body: {} } })
    renderHome()
    expect(await screen.findByRole('alert')).toHaveTextContent("Yangiliklar serveriga ulanib bo'lmadi.")
  })

  it("Inline stil faqat dinamik qiymatlar: `--cat`, `--i`, karusel `background-image`", async () => {
    mockApi({ 'GET /news': NEWS })
    const { container } = renderHome()
    await screen.findByText('Ikkinchi yangilik')
    const styled = [...container.querySelectorAll('[style]')]
    expect(styled.length).toBeGreaterThan(0)
    for (const el of styled) {
      const props = [...el.style]
      expect(props.every(p => p.startsWith('--') || p === 'background-image'), el.outerHTML.slice(0, 120)).toBe(true)
    }
    expect(container.querySelector('.home-hero [style], .home-about [style]')).toBeNull()
  })
})

describe("Home — «Yo'nalishlar» bo'limi (Biz haqimizdan keyin, Yangiliklardan oldin)", () => {
  it("bo'lim tartibi: Hero → Biz haqimizda → Yo'nalishlar → Yangiliklar", () => {
    mockApi({ 'GET /news': [] })
    const { container } = renderHome()
    const order = [...container.querySelectorAll('section')].map(s => s.className.split(' ')[0])
    expect(order).toEqual(['home-hero', 'home-about', 'home-programs', 'home-news'])
  })

  it("5 ta tanlangan yo'nalish kartasi (Iqtisodiyot, Dasturiy injiniring, Neft va gaz ishi, Filologiya, Boshlang'ich ta'lim) — har biri /faculty ga havola; nom, davomiylik, narx ko'rsatiladi; ikonkalar dekorativ", () => {
    mockApi({ 'GET /news': [] })
    const { container } = renderHome()
    const section = container.querySelector('.home-programs')
    const cards = section.querySelectorAll('a.home-program')
    expect(cards).toHaveLength(5)
    expect([...cards].map(a => a.querySelector('h3').textContent)).toEqual([
      'Iqtisodiyot', 'Dasturiy injiniring', 'Neft va gaz ishi', 'Filologiya va tillarni o\'qitish', 'Boshlang\'ich ta\'lim',
    ])
    cards.forEach(a => {
      expect(a).toHaveAttribute('href', '/faculty')
      expect(a.querySelector('h3')).not.toBeEmptyDOMElement()
      expect(a.querySelector('.home-program__price')).toHaveTextContent(/so'm\/yil/)
      a.querySelectorAll('svg').forEach(svg => expect(svg.closest('[aria-hidden="true"]')).not.toBeNull())
    })
    expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent("Ta'lim yo'nalishlari")
    expect(within(section).getByText('Dasturiy injiniring')).toBeInTheDocument()
    expect(container.querySelectorAll('.home-program[data-featured]')).toHaveLength(0)
  })

  it("«Barcha yo'nalishlar» — btn-primary havola (/faculty), ichma-ich `<button>` yo'q", () => {
    mockApi({ 'GET /news': [] })
    const { container } = renderHome()
    const all = screen.getByRole('link', { name: /Barcha yo'nalishlar/ })
    expect(all).toHaveClass('btn', 'btn-primary')
    expect(all).toHaveAttribute('href', '/faculty')
    expect(container.querySelectorAll('.home-programs a button')).toHaveLength(0)
  })
})
