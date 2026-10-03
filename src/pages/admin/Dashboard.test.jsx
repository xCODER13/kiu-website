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
    // Yorliq ko'rinmaganda ham havola nomi bor (ekran o'qigichlar uchun) va tooltip beradi.
    // 6.21: native `title` o'rniga taxtadagi maxsus tooltip (CSS `data-tip`) — ikki tooltip chiqmasin
    const link = screen.getByRole('link', { name: 'Yangiliklar' })
    expect(link).toHaveAttribute('data-tip', 'Yangiliklar')
    expect(link).not.toHaveAttribute('title')
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

describe('Dashboard qobig\'i (6.21)', () => {
  it("yig'ish tugmasida `aria-expanded`; holat qayta ochilganda saqlanadi", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const first = setup()
    const btn = await screen.findByRole('button', { name: "Panelni yig'ish" })
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(btn)
    expect(screen.getByRole('button', { name: 'Panelni ochish' })).toHaveAttribute('aria-expanded', 'false')
    expect(localStorage.getItem('kiu_admin_collapsed')).toBe('1')
    first.unmount()

    const second = setup()
    await screen.findByRole('button', { name: 'Panelni ochish' })
    expect(second.container.querySelector('.adm-shell')).toHaveAttribute('data-collapsed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Panelni ochish' }))
    expect(localStorage.getItem('kiu_admin_collapsed')).toBe('0')
  })

  it("saqlash yopiq bo'lsa (localStorage xato beradi) — panel ochiq, xatosiz ishlaydi", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(k => {
      if (k === 'kiu_admin_collapsed') throw new Error('blocked')
      return 'ok'
    })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    const { container } = setup()
    await userEvent.click(await screen.findByRole('button', { name: "Panelni yig'ish" }))
    expect(container.querySelector('.adm-shell')).toHaveAttribute('data-collapsed', 'true')
    get.mockRestore(); set.mockRestore()
  })

  it("yig'ilganda pastki amallarda ham tooltip (`data-tip`), ochiqda yo'q; nomlari `aria-label` da", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const { container } = setup()
    await screen.findAllByText('Statistika')
    expect(container.querySelectorAll('[data-tip]')).toHaveLength(0)
    await userEvent.click(screen.getByRole('button', { name: "Panelni yig'ish" }))
    expect(container.querySelectorAll('.adm-nav-link[data-tip]')).toHaveLength(8)
    expect(container.querySelectorAll('.adm-side-action[data-tip]')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Tizimdan chiqish' })).toHaveAttribute('data-tip', 'Chiqish')
  })

  it("«Qabul arizalari» o'z ikonkasiga ega (Profil ikonkasidan farq qiladi)", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const { container } = setup()
    await screen.findAllByText('Statistika')
    const icon = n => container.querySelector(`a[aria-label="${n}"] svg`).innerHTML
    expect(icon('Qabul arizalari')).not.toBe(icon('Profil'))
  })

  it("yuqori paneldagi tema tugmasi — umumiy `.icon-btn`", async () => {
    localStorage.setItem('kiu_token', 'ok')
    const { container } = setup()
    await screen.findAllByText('Statistika')
    expect(container.querySelector('.adm-topbar .adm-theme-btn')).toHaveClass('icon-btn')
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

