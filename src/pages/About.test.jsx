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