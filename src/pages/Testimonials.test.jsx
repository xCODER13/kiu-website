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

describe('Testimonials — qayta dizayn (Bosqich 6.11c2)', () => {
  it("6 ta `<figure>` sharh: `<blockquote>` (qo'shtirnoqsiz matn) + `<figcaption>` muallif; inline stil yo'q", () => {
    const { container } = render(<Testimonials />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    const figures = container.querySelectorAll('figure.review-card')
    expect(figures).toHaveLength(6)
    for (const f of figures) {
      const quote = f.querySelector('blockquote')
      expect(quote.textContent.trim()).not.toMatch(/^["“«]/)
      expect(f.querySelector('figcaption')).toBeInTheDocument()
    }
  })

  it("yulduzlar: bitta `role=img` + `aria-label=\"5 / 5\"`, alohida yulduz SVG lari ekran o'quvchidan yashirin", () => {
    render(<Testimonials />)
    const groups = screen.getAllByRole('img', { name: '5 / 5' })
    expect(groups).toHaveLength(6)
    for (const g of groups) {
      const stars = g.querySelectorAll('svg')
      expect(stars).toHaveLength(5)
      stars.forEach(s => expect(s).toHaveAttribute('aria-hidden', 'true'))
    }
  })

  it("fakultet · kurs qatori ko'rsatiladi (kurs raqami va 'Bitiruvchi')", () => {
    render(<Testimonials />)
    expect(screen.getByText(/Dasturiy injiniring · 3-kurs/)).toBeInTheDocument()
    expect(screen.getByText(/· Bitiruvchi/)).toBeInTheDocument()
  })
})
