import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Achievements from './Achievements'

describe('Achievements (smoke test)', () => {
  it("qulamasdan render bo'ladi va barcha yutuqlar ko'rsatiladi", () => {
    render(<Achievements />)
    expect(screen.getByText('Yutuqlar va mukofotlar')).toBeInTheDocument()
    expect(screen.getByText("Yil e'tirofi — 2023 tanlovi sovrindori")).toBeInTheDocument()
    expect(screen.getByText('Zakovat kubogi g\'olibi')).toBeInTheDocument()
  })
})

describe('Achievements — qayta dizayn (Bosqich 6.11c1)', () => {
  it("8 karta 4 ustunli to'rda; hammasida yil pill'i va bir xil plitka (alohida rang yo'q); inline stil yo'q", () => {
    const { container } = render(<Achievements />)
    expect(container.querySelectorAll('.cards-4 .award-card')).toHaveLength(8)
    expect(container.querySelectorAll('.award-card .pill-brand')).toHaveLength(8)
    expect(container.querySelectorAll('.award-card .tile--64')).toHaveLength(8)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(screen.getByRole('heading', { level: 1, name: 'Yutuqlar va mukofotlar' }).closest('.inner-hero')).not.toBeNull()
  })
})
