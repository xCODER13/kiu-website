import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import Admission from './Admission'
import config from '../config'

function LocationMarker() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderAdmission(onApply = () => {}) {
  return render(
    <MemoryRouter initialEntries={['/admission']}>
      <Routes>
        <Route path="/admission" element={<Admission onApply={onApply} />} />
      </Routes>
      <LocationMarker />
    </MemoryRouter>
  )
}

describe('Admission (public)', () => {
  it("sarlavha, muddat va barcha 4 qadam ko'rsatiladi", () => {
    renderAdmission()
    expect(screen.getByText(`Qabul — ${config.admission.year}`)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(config.admission.deadline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument()
    expect(screen.getByText('Hujjatlar')).toBeInTheDocument()
    expect(screen.getByText('Ariza')).toBeInTheDocument()
    expect(screen.getByText('Imtihon')).toBeInTheDocument()
    expect(screen.getByText('Natija')).toBeInTheDocument()
  })

  it("'Ariza topshirish' tugmasi bosilganda onApply chaqiriladi (ariza modalini ochish)", async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()
    renderAdmission(onApply)
    await user.click(screen.getByRole('button', { name: 'Ariza topshirish' }))
    expect(onApply).toHaveBeenCalledTimes(1)
  })

  it("'Yo'nalishni aniqlash' havolasi /sorting-hat sahifasiga o'tadi", async () => {
    const user = userEvent.setup()
    renderAdmission()
    await user.click(screen.getByRole('button', { name: /Yo'nalishni aniqlash/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('/sorting-hat')
  })
})