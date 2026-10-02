import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Contact from './Contact'
import config from '../config'

describe('Contact (public)', () => {
  it("barcha aloqa ma'lumotlari (manzillar, telefon, email, ish vaqti) ko'rsatiladi", () => {
    render(<Contact />)
    expect(screen.getByText("Bog'lanish")).toBeInTheDocument()
    expect(screen.getByText(config.contact.address1)).toBeInTheDocument()
    expect(screen.getByText(config.contact.address2)).toBeInTheDocument()
    expect(screen.getByText(config.contact.phone)).toBeInTheDocument()
    expect(screen.getByText(config.contact.email)).toBeInTheDocument()
    expect(screen.getByText(config.contact.workHours)).toBeInTheDocument()
  })

  it("Telegram paneli (TelegramPanel) ham qulamasdan render bo'ladi", () => {
    render(<Contact />)
    expect(screen.getByText(config.telegram.username)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Kanalga obuna bo'lish/ })).toBeInTheDocument()
  })
})

describe('Contact — qayta dizayn (Bosqich 6.11c2)', () => {
  it("telefon va email — havola (`tel:` bo'shliqsiz, `mailto:`); manzil va ish vaqti oddiy matn", () => {
    render(<Contact />)
    expect(screen.getByRole('link', { name: config.contact.phone })).toHaveAttribute('href', 'tel:+998555009944')
    expect(screen.getByRole('link', { name: config.contact.email })).toHaveAttribute('href', `mailto:${config.contact.email}`)
    for (const text of [config.contact.address1, config.contact.address2, config.contact.workHours]) {
      expect(screen.getByText(text).closest('a')).toBeNull()
    }
  })

  it("5 ta karta `.card--lift`; faqat havolali kartada strelka doirasi; inline stil yo'q", () => {
    const { container } = render(<Contact />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    const cards = container.querySelectorAll('.contact-card')
    expect(cards).toHaveLength(5)
    cards.forEach(c => expect(c).toHaveClass('card--lift'))
    expect(container.querySelectorAll('.contact-card[data-link="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('.contact-card__go')).toHaveLength(2)
  })
})
