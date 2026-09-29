import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
