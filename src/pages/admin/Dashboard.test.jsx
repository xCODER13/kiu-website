import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import { H, API } from './shared/api'

// Bo'limlar — faqat H() bilan API'ga so'rov yuboruvchi minimal soxta komponentlar
vi.mock('./Stats.jsx', () => ({
  default: () => <button onClick={() => fetch(`${API}/stats`, { headers: H() })}>load</button>,
}))
vi.mock('./NewsAdmin.jsx', () => ({ default: () => <div /> }))
vi.mock('./EventsAdmin.jsx', () => ({ default: () => <div /> }))
vi.mock('./TeachersAdmin.jsx', () => ({ default: () => <div /> }))
vi.mock('./GalleryAdmin.jsx', () => ({ default: () => <div /> }))
vi.mock('./ApplicationsAdmin.jsx', () => ({ default: () => <div /> }))
vi.mock('./ProfileAdmin.jsx', () => ({ default: () => <div /> }))

const setup = () => render(
  <MemoryRouter initialEntries={['/admin']}>
    <Routes>
      <Route path="/admin/login" element={<div>LOGIN</div>} />
      <Route path="/admin/*" element={<Dashboard />} />
    </Routes>
  </MemoryRouter>
)

describe('Dashboard sessiya boshqaruvi', () => {
  it('token yo\'q — loginga o\'tadi', async () => {
    setup()
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
  })

  it('API 401 qaytarsa — token o\'chadi va login ochiladi', async () => {
    localStorage.setItem('kiu_token', 'stale')
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ status: 401 })))
    setup()
    await userEvent.click(await screen.findByText('load'))
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).toBeNull()
  })

  it('API 200 — sessiya saqlanadi', async () => {
    localStorage.setItem('kiu_token', 'ok')
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ status: 200 })))
    setup()
    await userEvent.click(await screen.findByText('load'))
    expect(screen.queryByText('LOGIN')).not.toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).toBe('ok')
  })

  it('"Chiqish" tokenni o\'chiradi va loginga o\'tadi', async () => {
    localStorage.setItem('kiu_token', 'ok')
    setup()
    await userEvent.click(await screen.findByText('Chiqish'))
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).toBeNull()
  })
})
