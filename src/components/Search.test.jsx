import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import Search from './Search'

function LocationMarker() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderSearch() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Search />
      <LocationMarker />
    </MemoryRouter>
  )
}

async function openSearch(user) {
  await user.click(screen.getByLabelText('Search'))
}

describe('Search (qidiruv)', () => {
  it("dastlab yopiq — input va natijalar panel ko'rinmaydi", () => {
    renderSearch()
    expect(screen.queryByPlaceholderText(/Qidiring/)).not.toBeInTheDocument()
  })

  it("qidiruv tugmasi bosilganda ochiladi va bo'sh so'rovda 'Tezkor havolalar' ko'rsatiladi", async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    expect(screen.getByPlaceholderText(/Qidiring/)).toBeInTheDocument()
    expect(screen.getByText('Tezkor havolalar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Qabul$/ })).toBeInTheDocument()
  })

  it("so'rov bo'yicha (sarlavha yoki kategoriya) filtrlaydi va natija sonini ko'rsatadi", async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    await user.type(screen.getByPlaceholderText(/Qidiring/), 'Qabul')
    expect(screen.getByText('4 natija topildi')).toBeInTheDocument()
    expect(screen.getByText('Hujjatlar topshirish')).toBeInTheDocument()
    expect(screen.getByText('Ariza topshirish')).toBeInTheDocument()
    expect(screen.getByText('Grant stipendiya')).toBeInTheDocument()
  })

  it('regressiya: "Fotogalereya" yozuvidagi kirill "е" harfi lotincha bo\'lgani uchun to\'g\'ri yozilgan so\'rov bo\'yicha topiladi', async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    await user.type(screen.getByPlaceholderText(/Qidiring/), 'fotogalereya')
    expect(screen.getByText('Fotogalereya rasmlar')).toBeInTheDocument()
  })

  it("mos natija topilmasa xabar ko'rsatiladi", async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    await user.type(screen.getByPlaceholderText(/Qidiring/), 'zzz-mavjud-emas-zzz')
    expect(screen.getByText('Hech narsa topilmadi')).toBeInTheDocument()
  })

  it('natijani bosish — navigatsiya qiladi va panelni yopadi', async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    await user.type(screen.getByPlaceholderText(/Qidiring/), 'Qabul')
    await user.click(screen.getByText('Hujjatlar topshirish'))
    expect(screen.getByTestId('location')).toHaveTextContent('/admission')
    expect(screen.queryByPlaceholderText(/Qidiring/)).not.toBeInTheDocument()
  })

  it("'Tezkor havolalar' tugmasi bosilganda navigatsiya qiladi", async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    await user.click(screen.getByRole('button', { name: /^Bog'lanish$/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('/contact')
  })

  it('X tugmasi bosilganda so\'rov tozalanadi', async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    const input = screen.getByPlaceholderText(/Qidiring/)
    await user.type(input, 'Qabul')
    await user.click(screen.getByRole('button', { name: 'Qidiruvni tozalash' })) // X tugmasi
    expect(input).toHaveValue('')
  })

  it('Escape bosilganda panel yopiladi', async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    const input = screen.getByPlaceholderText(/Qidiring/)
    // Komponent inputga fokusni ichki setTimeout orqali beradi — bu yerda
    // Escape aynan inputga tushishi uchun fokusni to'g'ridan-to'g'ri o'zimiz beramiz
    input.focus()
    await user.keyboard('{Escape}')
    expect(screen.queryByPlaceholderText(/Qidiring/)).not.toBeInTheDocument()
  })

  it('tashqariga bosilganda panel yopiladi', async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    fireEvent.mouseDown(document.body)
    expect(screen.queryByPlaceholderText(/Qidiring/)).not.toBeInTheDocument()
  })

  it('klaviatura bilan boshqarish: ArrowDown + Enter tanlangan natijaga o\'tadi', async () => {
    const user = userEvent.setup()
    renderSearch()
    await openSearch(user)
    const input = screen.getByPlaceholderText(/Qidiring/)
    await user.type(input, 'Qabul')
    // Natijalar: "Qabul" (index0), "Hujjatlar topshirish" (index1), "Ariza topshirish" (index2), "Grant stipendiya" (index3)
    await user.keyboard('{ArrowDown}{Enter}')
    expect(screen.getByTestId('location')).toHaveTextContent('/admission')
  })
})