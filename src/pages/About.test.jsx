import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import About from './About'

describe('About (smoke test)', () => {
  it("qulamasdan render bo'ladi va asosiy bo'limlar ko'rsatiladi", () => {
    render(<About />)
    expect(screen.getByText('Biz haqimizda')).toBeInTheDocument()
    expect(screen.getByText('Missiyamiz')).toBeInTheDocument()
    expect(screen.getByText('Bizdagi afzalliklar')).toBeInTheDocument()
    expect(screen.getByText('Rahbariyat')).toBeInTheDocument()
    expect(screen.getByText("Panjiyev Ulug'bek Rustamovich")).toBeInTheDocument()
  })
})

// Bosqich 6.11c1: qayta dizayn (spec 6.11 "Biz haqimizda") — hero, 6 ta bir rangli plitka, wine missiya banneri, 4 ustunli guruhlar.
describe('About — qayta dizayn (Bosqich 6.11c1)', () => {
  it("hero (h1) + inline stil yo'q; statistika 6 ta karta, hammasi bir xil klass (alohida rang yo'q)", () => {
    const { container } = render(<About />)
    expect(screen.getByRole('heading', { level: 1, name: 'Biz haqimizda' }).closest('.inner-hero')).not.toBeNull()
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(container.querySelectorAll('.about-stat')).toHaveLength(6)
  })

  it("missiya — `.wine-banner`; afzalliklar 8, rahbariyat 4, infratuzilma 4 karta (`.cards-4` ichida, 4 ustun)", () => {
    const { container } = render(<About />)
    expect(container.querySelector('.wine-banner')).toHaveTextContent('Missiyamiz')
    const groups = [...container.querySelectorAll('.cards-4')]
    expect(groups.map(g => g.querySelectorAll('.card').length)).toEqual([8, 4, 4])
  })

  it("rahbar avatari bosh harflar bilan, dekorativ (`aria-hidden`); ism sarlavhada qoladi; ikonkalar dekorativ", () => {
    const { container } = render(<About />)
    const avatars = [...container.querySelectorAll('.avatar-wine')]
    expect(avatars.map(a => a.textContent)).toEqual(['PU', 'NF', 'RU', 'YA'])
    avatars.forEach(a => expect(a).toHaveAttribute('aria-hidden', 'true'))
    container.querySelectorAll('svg').forEach(svg => expect(svg).toHaveAttribute('aria-hidden', 'true'))
    expect(screen.getByRole('heading', { level: 3, name: "Panjiyev Ulug'bek Rustamovich" })).toBeInTheDocument()
  })
})
