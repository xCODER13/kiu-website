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
