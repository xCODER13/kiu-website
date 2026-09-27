import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'
import config from '../config'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  )
}

describe('Footer', () => {
  it("universitet nomi, aloqa ma'lumotlari va asosiy havolalar ko'rsatiladi", () => {
    renderFooter()
    expect(screen.getByText(config.university.name)).toBeInTheDocument()
    expect(screen.getByText(config.contact.phone)).toBeInTheDocument()
    expect(screen.getByText(config.contact.email)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Biz haqimizda' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: "Bo'sh ish o'rinlari" }).length).toBeGreaterThan(0)
  })

  it('regressiya: "Yonalishni" emas, to\'g\'ri yozilgan "Yo\'nalishni aniqlash" havolasi ko\'rsatiladi', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: "Yo'nalishni aniqlash" })).toBeInTheDocument()
  })

  it("ijtimoiy tarmoq havolalari to'g'ri manzilga, yangi oynada va xavfsiz (tabnabbing'dan himoyalangan) ochiladi", () => {
    renderFooter()
    const social = [
      ['Telegram', config.social.telegram],
      ['Instagram', config.social.instagram],
      ['YouTube', config.social.youtube],
      ['Facebook', config.social.facebook],
    ]
    social.forEach(([name, url]) => {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('href', url)
      expect(link).toHaveAttribute('target', '_blank')
      // regressiya: rel="noreferrer" yolg'iz o'zi window.opener'ni kafolatlab
      // bloklamaydi — noopener ham bo'lishi shart
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    })
  })
})