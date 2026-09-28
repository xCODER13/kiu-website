import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import News from './News'
import { FALLBACK_SHORTS } from './news/data'
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

  it("'Video' tabida backend'dan short kelmasa, standart (fallback) ro'yxat ko'rsatiladi", async () => {
    mockApi({ 'GET /news': [A1] })
    const user = userEvent.setup()
    renderNews()
    await screen.findByRole('heading', { level: 3, name: 'Birinchi yangilik' })

    await user.click(screen.getByRole('button', { name: /Video/ }))
    expect(screen.getByText(FALLBACK_SHORTS[0].title)).toBeInTheDocument()
  })
})