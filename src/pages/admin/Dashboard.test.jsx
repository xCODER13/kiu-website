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

  it("panelni yig'ish/ochish ildizdagi `data-collapsed` ni almashtiradi, yorliqlar yashiriladi", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const { container } = setup()
    const shell = container.querySelector('.adm-shell')
    expect(shell).toHaveAttribute('data-collapsed', 'false')
    expect(await screen.findAllByText('Yangiliklar')).not.toHaveLength(0)
    await userEvent.click(screen.getByRole('button', { name: "Panelni yig'ish" }))
    expect(shell).toHaveAttribute('data-collapsed', 'true')
    expect(screen.queryByText('Yangiliklar')).not.toBeInTheDocument()
    // Yorliq ko'rinmaganda ham havola nomi bor (ekran o'qigichlar uchun) va tooltip beradi
    expect(screen.getByRole('link', { name: 'Yangiliklar' })).toHaveAttribute('title', 'Yangiliklar')
    await userEvent.click(screen.getByRole('button', { name: 'Panelni ochish' }))
    expect(shell).toHaveAttribute('data-collapsed', 'false')
  })

  it("faol bo'lim NavLink `active` klassini oladi (inline stilsiz)", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const { container } = setup()
    await screen.findAllByText('Statistika')
    const links = [...container.querySelectorAll('a.adm-nav-link')]
    expect(links).toHaveLength(8)
    expect(links.filter(a => a.classList.contains('active')).map(a => a.textContent)).toEqual(['Statistika'])
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it("bo'lim qidiruvi ro'yxatni filtrlaydi, topilmasa 'Topilmadi'", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const { container } = setup()
    const input = container.querySelector('.adm-side-search-input')
    await userEvent.type(input, 'galer')
    expect([...container.querySelectorAll('a.adm-nav-link')].map(a => a.textContent)).toEqual(['Galereya'])
    await userEvent.clear(input)
    await userEvent.type(input, 'zzz')
    expect(screen.getByText('Topilmadi')).toHaveClass('adm-nav-empty')
  })

  it("yuqori panelda qidiruv yo'q (xCODER qarori 2026-10-02); bo'lim qidiruvi faqat sidebar'da", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const { container } = setup()
    await screen.findAllByText('Statistika')
    expect(container.querySelector('.adm-topbar input')).toBeNull()
    expect(screen.getAllByPlaceholderText("Bo'lim qidirish...")).toHaveLength(1)
    expect(container.querySelector('.adm-topbar .adm-theme-btn')).not.toBeNull()
  })
})

describe('Dashboard logotipi (6.18)', () => {
  it("sidebar: ochiq holatda 36 px, yig'ilganda 22 px — har doim bitta nomli logotip; topbar'dagisi dekorativ", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const { container } = setup()
    const logo = await screen.findByRole('img', { name: 'KIU logo' })
    expect(logo).toHaveAttribute('height', '36')
    expect(screen.getAllByRole('img', { name: 'KIU logo' })).toHaveLength(1)
    expect(screen.getByText('Admin')).toBeInTheDocument()
    // topbar: matn yonida — ekran o'qigich takrorlamasin
    const top = container.querySelector('.adm-topbar-title svg')
    expect(top).toHaveAttribute('aria-hidden', 'true')
    expect(top).not.toHaveAttribute('role')

    await userEvent.click(screen.getByRole('button', { name: "Panelni yig'ish" }))
    const small = screen.getByRole('img', { name: 'KIU logo' })
    expect(small).toHaveAttribute('height', '22')
    expect(screen.queryByText('Boshqaruv paneli')).not.toBeInTheDocument()
  })
})

