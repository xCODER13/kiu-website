import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import NewsDetail from './NewsDetail'

const ARTICLE = { _id: 'n1', title: "Yangi o'quv yili boshlandi", content: 'Birinchi xat.', category: 'umumiy', views: 3, createdAt: '2026-01-05', images: [] }

const renderDetail = () => render(
  <MemoryRouter initialEntries={['/news/n1']}>
    <Routes><Route path="/news/:id" element={<NewsDetail />} /></Routes>
  </MemoryRouter>
)

afterEach(() => vi.unstubAllGlobals())

describe('NewsDetail', () => {
  it("maqola ko'rsatiladi va ko'rishlar hisoblagichi chaqiriladi", async () => {
    const fetchMock = vi.fn(url => Promise.resolve({ ok: true, json: () => Promise.resolve(String(url).endsWith('/view') ? {} : ARTICLE) }))
    vi.stubGlobal('fetch', fetchMock)
    renderDetail()
    expect(await screen.findByRole('heading', { name: ARTICLE.title })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/news\/n1\/view$/), { method: 'PUT' })
  })

  it("ko'rishlar hisoblagichi xato bersa ham maqola yashirilmaydi (regressiya)", async () => {
    vi.stubGlobal('fetch', vi.fn(url => String(url).endsWith('/view')
      ? Promise.reject(new TypeError('Failed to fetch'))
      : Promise.resolve({ ok: true, json: () => Promise.resolve(ARTICLE) })))
    renderDetail()
    expect(await screen.findByRole('heading', { name: ARTICLE.title })).toBeInTheDocument()
    expect(screen.queryByText('Yangilik topilmadi')).not.toBeInTheDocument()
  })

  it("maqola topilmasa 'Yangilik topilmadi' ko'rsatiladi", async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })))
    renderDetail()
    expect(await screen.findByText('Yangilik topilmadi')).toBeInTheDocument()
  })
})

describe('NewsDetail — JS hover va <style> CSS ga ko\'chirilgan (Bosqich 5c)', () => {
  const stub = article => vi.stubGlobal('fetch', vi.fn(url => Promise.resolve({ ok: true, json: () => Promise.resolve(String(url).endsWith('/view') ? {} : article) })))

  it("yuklanish holatida `<style>` yo'q", () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderDetail()
    expect(document.querySelectorAll('style')).toHaveLength(0)
  })

  it("orqaga tugmalari klass bilan, hover inline stil yozmaydi", async () => {
    stub(ARTICLE)
    const { container } = renderDetail()
    await screen.findByRole('heading', { name: ARTICLE.title })
    const [top, bottom] = screen.getAllByRole('button', { name: /Yangiliklarga qaytish/ })
    expect(top).toHaveClass('back-link')
    expect(bottom).toHaveClass('back-btn')
    const user = userEvent.setup()
    await user.hover(top)
    await user.hover(bottom)
    expect(top.hasAttribute('style')).toBe(false)
    expect(bottom.hasAttribute('style')).toBe(false)
    expect(document.querySelectorAll('style')).toHaveLength(0)
    expect(container.querySelectorAll('button[style]')).toHaveLength(0)
  })

  it("rasm galereyasi: o'qlar klass bilan; hover inline `background` yozmaydi; `<style>` yo'q", async () => {
    stub({ ...ARTICLE, image: JSON.stringify(['/a.jpg', '/b.jpg']) })
    renderDetail()
    await screen.findByRole('heading', { name: ARTICLE.title })
    const prev = screen.getByRole('button', { name: 'Oldingi rasm' })
    const next = screen.getByRole('button', { name: 'Keyingi rasm' })
    expect(prev).toHaveClass('gallery-arrow', 'gallery-arrow--prev')
    expect(next).toHaveClass('gallery-arrow', 'gallery-arrow--next')
    const user = userEvent.setup()
    await user.hover(prev)
    await user.hover(next)
    expect(prev.hasAttribute('style')).toBe(false)
    expect(next.hasAttribute('style')).toBe(false)
    expect(document.querySelectorAll('style')).toHaveLength(0)
  })
})
