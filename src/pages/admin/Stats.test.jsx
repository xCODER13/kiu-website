import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Stats from './Stats'
import { mockApi } from '../../test/helpers'

const setup = () => render(<MemoryRouter><Stats /></MemoryRouter>)

describe('Stats', () => {
  it('yuklanish paytida "Yuklanmoqda..." ko\'rsatadi', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    setup()
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()
  })

  it('kartalar to\'g\'ri qiymatlar bilan ko\'rsatiladi', async () => {
    mockApi({ 'GET /stats': { newsCount: 5, eventsCount: 2, teachersCount: 10, appsCount: 3, vacancyApps: 1, galleryCount: 4 } })
    setup()
    expect(await screen.findByText('5')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('qiymat kelmagan maydonlar 0 ko\'rsatadi (nullish coalescing)', async () => {
    mockApi({ 'GET /stats': {} })
    setup()
    expect(await screen.findAllByText('0')).toHaveLength(6)
  })

  it('token bo\'lsa so\'rov Authorization header bilan yuboriladi', async () => {
    localStorage.setItem('kiu_token', 'tok')
    const { calls } = mockApi({ 'GET /stats': { newsCount: 1 } })
    setup()
    await screen.findByText('1')
    expect(calls[0].headers.Authorization).toBe('Bearer tok')
  })

  it('fetch xatosi (tarmoq) — xato xabari ko\'rsatiladi, abadiy yuklanmoqda holatida qolmaydi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    setup()
    expect(await screen.findByText(/xatolik yuz berdi/)).toBeInTheDocument()
    expect(screen.queryByText('Yuklanmoqda...')).not.toBeInTheDocument()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('kartalar to\'g\'ri sahifalarga havola qiladi', async () => {
    mockApi({ 'GET /stats': { newsCount: 1 } })
    setup()
    await screen.findByText('1')
    expect(screen.getByText('Vakansiya arizalari').closest('a')).toHaveAttribute('href', '/admin/vacancies')
    expect(screen.getByText('Qabul arizalari').closest('a')).toHaveAttribute('href', '/admin/applications')
    expect(screen.getByText('Galereya').closest('a')).toHaveAttribute('href', '/admin/gallery')
  })

  it('"Tezkor havolalar" bo\'limi endi ko\'rsatilmaydi', async () => {
    mockApi({ 'GET /stats': { newsCount: 1 } })
    setup()
    await screen.findByText('1')
    expect(screen.queryByText('Tezkor havolalar')).not.toBeInTheDocument()
    // Har bir karta nomi endi faqat bir marta chiqadi (tezkor havolalar bilan dublikat yo'q)
    expect(screen.getAllByText('Galereya')).toHaveLength(1)
    expect(screen.getAllByText('Qabul arizalari')).toHaveLength(1)
  })
})