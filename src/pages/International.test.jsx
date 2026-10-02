import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import International from './International'

describe('International (smoke test)', () => {
  it("qulamasdan render bo'ladi, hamkorlik imkoniyatlari va hamkor universitetlar ko'rsatiladi", () => {
    render(<International />)
    expect(screen.getByText('Xalqaro hamkorlik')).toBeInTheDocument()
    expect(screen.getByText('Akademik mobillik')).toBeInTheDocument()
    expect(screen.getByText('INTI International University')).toBeInTheDocument()
  })

  it("statistikadagi hamkor va davlat soni ro'yxatga mos (7 hamkor, 6 davlat) va kiu.uz hamkorlari bor", () => {
    render(<International />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('University of Gdańsk', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Presidency University')).toBeInTheDocument()
    expect(screen.queryByText(/Germaniya/)).not.toBeInTheDocument()
  })
})

describe('International — qayta dizayn (Bosqich 6.11c1)', () => {
  it("hero + wine banner (4 statistika) + 12 ustunli to'r: imkoniyatlar 3+2, hamkorlar 4+3; inline stil yo'q", () => {
    const { container } = render(<International />)
    expect(screen.getByRole('heading', { level: 1, name: 'Xalqaro hamkorlik' }).closest('.inner-hero')).not.toBeNull()
    expect(container.querySelectorAll('.wine-stat')).toHaveLength(4)
    const [opps, partners] = container.querySelectorAll('.grid-12')
    expect([...opps.children].map(c => c.className.match(/col-\d/)[0])).toEqual(['col-4', 'col-4', 'col-4', 'col-6', 'col-6'])
    expect([...partners.children].map(c => c.className.match(/col-\d/)[0])).toEqual(['col-3', 'col-3', 'col-3', 'col-3', 'col-4', 'col-4', 'col-4'])
    expect(container.querySelectorAll('.cards-2 .card')).toHaveLength(2)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it("hamkor kodi dekorativ (`aria-hidden`), tur — pill; barcha ikonkalar dekorativ", () => {
    const { container } = render(<International />)
    container.querySelectorAll('.partner-card__code').forEach(c => expect(c).toHaveAttribute('aria-hidden', 'true'))
    expect(container.querySelectorAll('.partner-card .pill-brand')).toHaveLength(7)
    container.querySelectorAll('svg').forEach(svg => expect(svg).toHaveAttribute('aria-hidden', 'true'))
  })
})
