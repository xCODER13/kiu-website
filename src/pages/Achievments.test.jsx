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