import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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
    // 6.11a: yil `<span class="hl-brand">` ichida (brend rangida) — matn bo'linib ketgani uchun `getByText` emas, sarlavha nomi bo'yicha
    expect(screen.getByRole('heading', { level: 1, name: `Qabul — ${config.admission.year}` })).toBeInTheDocument()
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

  // 6.11a: avval NavLink ichida <button> edi (ichma-ich interaktiv element, noto'g'ri HTML) — endi bitta `.btn.btn-accent` havola.
  it("'Yo'nalishni aniqlash' havolasi /sorting-hat sahifasiga o'tadi", async () => {
    const user = userEvent.setup()
    renderAdmission()
    await user.click(screen.getByRole('link', { name: /Yo'nalishni aniqlash/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('/sorting-hat')
  })
})

describe('Admission — qayta dizayn (Bosqich 6.11a)', () => {
  it("hero: badge (oltin nuqta) + h1 da yil brend rangida + ta'rif", () => {
    const { container } = renderAdmission()
    const hero = container.querySelector('.inner-hero')
    expect(within(hero).getByText('Hujjat topshirish')).toHaveClass('hero-badge')
    expect(hero.querySelector('.hero-badge__dot')).toHaveAttribute('aria-hidden', 'true')
    expect(hero.querySelector('h1 .hl-brand')).toHaveTextContent(String(config.admission.year))
    expect(within(hero).getByText('Hujjat topshirish tartibi va shartlar')).toBeInTheDocument()
  })

  it("banner: muddat oltin chip'da; CTA'lar `.btn-primary` (tugma) va `.btn-accent` (havola); ichma-ich interaktiv element yo'q", () => {
    const { container } = renderAdmission()
    const banner = container.querySelector('.apply-banner')
    expect(banner.querySelector('.deadline-chip')).toHaveTextContent(config.admission.deadline)
    expect(within(banner).getByRole('button', { name: 'Ariza topshirish' })).toHaveClass('btn', 'btn-primary')
    const find = within(banner).getByRole('link', { name: /Yo'nalishni aniqlash/ })
    expect(find).toHaveClass('btn', 'btn-accent')
    expect(find.querySelector('button, a')).toBeNull()
    expect(find).toHaveAttribute('href', '/sorting-hat')
  })

  it("4 qadam kartasi: ikonka plitkasi, 'N-qadam' badge, sarlavha (h3) va ta'rif; inline style yo'q", () => {
    const { container } = renderAdmission()
    const cards = container.querySelectorAll('.step-card')
    expect(cards).toHaveLength(4)
    cards.forEach((c, i) => {
      expect(c.querySelector('.step-icon svg')).toBeInTheDocument()
      expect(c.querySelector('.step-badge')).toHaveTextContent(`${i + 1}-qadam`)
      expect(c.querySelector('h3.step-title')).toBeInTheDocument()
    })
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })
})
