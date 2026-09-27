import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Testimonials from './Testimonials'

describe('Testimonials (smoke test)', () => {
  it("qulamasdan render bo'ladi va barcha sharhlar ko'rsatiladi", () => {
    render(<Testimonials />)
    expect(screen.getByText('Talabalar sharhlari')).toBeInTheDocument()
    expect(screen.getByText('Aziza Karimova')).toBeInTheDocument()
    expect(screen.getByText('Sardor Mirzayev')).toBeInTheDocument()
  })
})