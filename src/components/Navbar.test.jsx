import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import config from '../config'

function LocationMarker() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderNavbar(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/faculty']}>
      <Navbar dark={false} setDark={() => {}} onApply={() => {}} {...props} />
      <LocationMarker />
      <Routes>
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  it("universitet nomi va barcha asosiy havolalar ko'rsatiladi", () => {
    renderNavbar()
    expect(screen.getByText(config.university.name)).toBeInTheDocument()
    // Universitet nomi tagida "Rasmiy veb-sayti" yozuvi (xCODER so'rovi)
    const sub = screen.getByText('Rasmiy veb-sayti')
    expect(sub).toHaveClass('nav-brand-sub')
    expect(sub.previousElementSibling).toHaveTextContent(config.university.name)
    expect(screen.getAllByRole('link', { name: "Yo'nalishlar" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Qabul' }).length).toBeGreaterThan(0)
  })

  it("«Talabalar hayoti» havolasi: /student-life, ikonka — ryukzak (rasm ikonkasi emas, o'qituvchilar/yo'nalishlar ikonkalaridan farqli)", () => {
    renderNavbar()
    const link = screen.getAllByRole('link', { name: 'Talabalar hayoti' })[0]
    expect(link).toHaveAttribute('href', '/student-life')
    const paths = [...link.querySelectorAll('svg path')].map(p => p.getAttribute('d'))
    expect(paths).toContain('M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2')   // ryukzak tutqichi
    expect(link.querySelector('svg circle')).toBeNull()                  // eski rasm ikonkasidagi doira yo'q
  })

  it("qorong'i rejim tugmasi bosilganda setDark chaqiriladi", async () => {
    const setDark = vi.fn()
    const user = userEvent.setup()
    renderNavbar({ setDark })
    await user.click(screen.getByRole('button', { name: "Qorong'i rejimga o'tish" }))
    expect(setDark).toHaveBeenCalledWith(true)
  })

  it("desktop 'Ariza topshirish' tugmasi bosilganda onApply chaqiriladi", async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()
    renderNavbar({ onApply })
    await user.click(screen.getAllByRole('button', { name: 'Ariza topshirish' })[0])
    expect(onApply).toHaveBeenCalledTimes(1)
  })

  it("mobil menyu dastlab yopiq, hamburger bosilganda ochiladi va havolalarni ko'rsatadi", async () => {
    const user = userEvent.setup()
    renderNavbar()
    expect(screen.queryByRole('button', { name: 'Menyuni yopish' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Menyuni ochish' }))
    expect(screen.getByRole('button', { name: 'Menyuni yopish' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Yangiliklar' }).length).toBeGreaterThan(0)
  })

  it("regressiya: mobil menyu header'ning haqiqiy balandligidan boshlanadi (uzun sarlavha header'ni balandlatganda til almashtirgich yopilib qolmasin)", async () => {
    let notify
    class FakeResizeObserver {
      constructor(cb) { notify = cb }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ height: 108, width: 390, top: 0, left: 0, right: 390, bottom: 108, x: 0, y: 0 }))
    try {
      const user = userEvent.setup()
      const { container } = renderNavbar()
      act(() => notify())
      await user.click(screen.getByRole('button', { name: 'Menyuni ochish' }))
      const menu = container.querySelector('div.mobile-nav')
      expect(menu.style.top).toBe('108px')
    } finally {
      rectSpy.mockRestore()
      vi.unstubAllGlobals()
    }
  })

  it('mobil menyudagi havolani bosish menyuni yopadi va navigatsiya qiladi', async () => {
    const user = userEvent.setup()
    renderNavbar()
    await user.click(screen.getByRole('button', { name: 'Menyuni ochish' }))
    const links = screen.getAllByRole('link', { name: "Bog'lanish" })
    await user.click(links[links.length - 1])
    expect(screen.getByTestId('location')).toHaveTextContent('/contact')
    expect(screen.queryByRole('button', { name: 'Menyuni yopish' })).not.toBeInTheDocument()
  })

  it("mobil menyudagi 'Ariza topshirish' tugmasi onApply'ni chaqiradi va menyuni yopadi", async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()
    renderNavbar({ onApply })
    await user.click(screen.getByRole('button', { name: 'Menyuni ochish' }))
    const applyButtons = screen.getAllByRole('button', { name: 'Ariza topshirish' })
    await user.click(applyButtons[applyButtons.length - 1])
    expect(onApply).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'Menyuni yopish' })).not.toBeInTheDocument()
  })

  it('regressiya: mobil menyu ochiq holda logotipga bosilsa, menyu yopiladi', async () => {
    const user = userEvent.setup()
    renderNavbar()
    await user.click(screen.getByRole('button', { name: 'Menyuni ochish' }))
    expect(screen.getByRole('button', { name: 'Menyuni yopish' })).toBeInTheDocument()
    await user.click(screen.getByText(config.university.name))
    expect(screen.getByTestId('location')).toHaveTextContent('/')
    expect(screen.queryByRole('button', { name: 'Menyuni yopish' })).not.toBeInTheDocument()
  })

  it("Bosqich 5a: inline style yo'q — faqat mobil menyuning dinamik `top` qiymati", async () => {
    const user = userEvent.setup()
    const { container } = renderNavbar()
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: 'Menyuni ochish' }))
    const styled = [...container.querySelectorAll('[style]')]
    expect(styled).toHaveLength(1)
    expect(styled[0]).toHaveClass('mobile-menu')
    expect(styled[0].getAttribute('style')).toMatch(/^top:\s*\d+px;?$/)
  })

  it('faol havola NavLink `active` klassi bilan belgilanadi (inline fontWeight/rang emas)', () => {
    renderNavbar({})
    const faculty = screen.getAllByRole('link', { name: "Yo'nalishlar" })
    expect(faculty.some(a => a.classList.contains('nav-group-item') && a.classList.contains('active'))).toBe(true)
  })

  it("dropdown: `aria-expanded` hover/fokus bilan o'zgaradi; Esc paneli yopadi va fokus tugmada qoladi; tashqariga chiqilganda qayta ochiladi", async () => {
    const user = userEvent.setup()
    renderNavbar()
    const trigger = screen.getAllByRole('button', { name: /^Universitet/ })[0]
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.hover(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.unhover(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Klaviatura: Tab → fokus → ochiq; Esc → yopiq, fokus shu tugmada
    act(() => trigger.focus())
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
    expect(trigger.closest('.nav-group')).toHaveClass('force-closed')

    // Guruhdan chiqilgach Esc holati tozalanadi — keyingi safar fokus yana ochadi
    act(() => trigger.blur())
    expect(trigger.closest('.nav-group')).not.toHaveClass('force-closed')
    act(() => trigger.focus())
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
