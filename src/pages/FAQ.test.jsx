import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FAQ from './FAQ'

describe('FAQ (smoke test)', () => {
  it("qulamasdan render bo'ladi, barcha savollar ko'rsatiladi; dastlab hech bir javob ochiq emas", () => {
    render(<FAQ />)
    expect(screen.getByText('Qabul qachon boshlanadi?')).toBeInTheDocument()
    expect(screen.queryByText(/Qabul har yili 1-iyuldan/)).not.toBeInTheDocument()
    expect(document.querySelectorAll('[aria-expanded="true"]')).toHaveLength(0)
  })

  it("savolga bosilganda javob ochiladi, qayta bosilganda yopiladi", async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    expect(screen.queryByText(/Qabul har yili 1-iyuldan/)).not.toBeInTheDocument()
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

describe('FAQ — qayta dizayn (Bosqich 6.11c2)', () => {
  it("har savol alohida karta; tugma `aria-expanded`/`aria-controls`, ochiq karta `data-open`; inline stil yo'q", async () => {
    const user = userEvent.setup()
    const { container } = render(<FAQ />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    const cards = container.querySelectorAll('.faq-card')
    expect(cards.length).toBeGreaterThan(3)
    const first = screen.getByRole('button', { name: /Qabul qachon boshlanadi\?/ })
    const second = screen.getByRole('button', { name: /Qanday hujjatlar kerak\?/ })
    // dastlab hamma karta yopiq (birinchisi ham)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(first.closest('.faq-card')).toHaveAttribute('data-open', 'false')
    expect(second).toHaveAttribute('aria-expanded', 'false')
    expect(second.closest('.faq-card')).toHaveAttribute('data-open', 'false')
    await user.click(second)
    await user.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(first.closest('.faq-card')).toHaveAttribute('data-open', 'true')
    const panel = document.getElementById(first.getAttribute('aria-controls'))
    expect(panel).toHaveTextContent(/Qabul har yili 1-iyuldan/)
    expect(panel).toHaveAttribute('role', 'region')
  })

  it("bir vaqtda faqat bitta savol ochiq (mantiq o'zgarmagan); JSON-LD `FAQPage` saqlangan", async () => {
    const user = userEvent.setup()
    const { container } = render(<FAQ />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[2])
    await user.click(buttons[1])
    expect(container.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1)
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById('jsonld-faq')?.textContent).toContain('FAQPage')
  })
})
