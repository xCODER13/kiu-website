import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    expect(screen.getAllByRole('link', { name: "Yo'nalishlar" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Qabul' }).length).toBeGreaterThan(0)
  })

  it("qorong'i rejim tugmasi bosilganda setDark chaqiriladi", async () => {
    const setDark = vi.fn()
    const user = userEvent.setup()
    renderNavbar({ setDark })
    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
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
    expect(screen.queryByRole('button', { name: 'Close menu' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Yangiliklar' }).length).toBeGreaterThan(0)
  })

  it('mobil menyudagi havolani bosish menyuni yopadi va navigatsiya qiladi', async () => {
    const user = userEvent.setup()
    renderNavbar()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const links = screen.getAllByRole('link', { name: "Bog'lanish" })
    await user.click(links[links.length - 1])
    expect(screen.getByTestId('location')).toHaveTextContent('/contact')
    expect(screen.queryByRole('button', { name: 'Close menu' })).not.toBeInTheDocument()
  })

  it("mobil menyudagi 'Ariza topshirish' tugmasi onApply'ni chaqiradi va menyuni yopadi", async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()
    renderNavbar({ onApply })
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const applyButtons = screen.getAllByRole('button', { name: 'Ariza topshirish' })
    await user.click(applyButtons[applyButtons.length - 1])
    expect(onApply).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'Close menu' })).not.toBeInTheDocument()
  })

  it('regressiya: mobil menyu ochiq holda logotipga bosilsa, menyu yopiladi', async () => {
    const user = userEvent.setup()
    renderNavbar()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
    await user.click(screen.getByText(config.university.name))
    expect(screen.getByTestId('location')).toHaveTextContent('/')
    expect(screen.queryByRole('button', { name: 'Close menu' })).not.toBeInTheDocument()
  })
})