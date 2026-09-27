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