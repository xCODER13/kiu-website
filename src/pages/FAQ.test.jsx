import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FAQ from './FAQ'

describe('FAQ (smoke test)', () => {
  it("qulamasdan render bo'ladi, barcha savollar ko'rsatiladi, javoblar dastlab yopiq", () => {
    render(<FAQ />)
    expect(screen.getByText('Qabul qachon boshlanadi?')).toBeInTheDocument()
    expect(screen.queryByText(/Qabul har yili 1-iyuldan/)).not.toBeInTheDocument()
  })

  it("savolga bosilganda javob ochiladi, qayta bosilganda yopiladi", async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    await user.click(screen.getByText('Qabul qachon boshlanadi?'))
    expect(screen.getByText(/Qabul har yili 1-iyuldan/)).toBeInTheDocument()
    await user.click(screen.getByText('Qabul qachon boshlanadi?'))
    expect(screen.queryByText(/Qabul har yili 1-iyuldan/)).not.toBeInTheDocument()
  })

  it("xorijiy hamkorlik javobi International sahifasidagi davlatlarga mos (Germaniya yo'q)", async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    await user.click(screen.getByText('Xorijiy universitetlar bilan hamkorlik bormi?'))
    expect(screen.getByText(/Polsha/)).toBeInTheDocument()
    expect(screen.queryByText(/Germaniya/)).not.toBeInTheDocument()
  })
})
