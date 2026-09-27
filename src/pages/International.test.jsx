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
})