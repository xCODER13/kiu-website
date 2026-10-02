import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Hemis from './Hemis'
import config from '../config'

describe('Hemis (smoke test)', () => {
  it("qulamasdan render bo'ladi va ikkala HEMIS havolasi ko'rsatiladi", () => {
    render(<Hemis />)
    expect(screen.getByText('Elektron universitet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /HEMIS Student/ })).toHaveAttribute('href', 'https://student.kiu.uz/dashboard/login')
    expect(screen.getByRole('link', { name: /HEMIS OTM/ })).toHaveAttribute('href', 'https://hemis.kiu.uz/dashboard/login')
  })

  it("regressiya: HEMIS havolalari yangi oynada va xavfsiz (tabnabbing'dan himoyalangan) ochiladi", () => {
    render(<Hemis />)
    ;[/HEMIS Student/, /HEMIS OTM/].forEach(name => {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    })
  })
})

describe('Hemis — qayta dizayn (Bosqich 6.11c2)', () => {
  it("yordam bloki: telefon `tel:` (bo'shliqsiz), Telegram havolasi config'dan, tashqi havola xavfsiz", () => {
    render(<Hemis />)
    expect(screen.getByRole('link', { name: config.contact.phone })).toHaveAttribute('href', 'tel:+998555009944')
    const tg = screen.getByRole('link', { name: config.telegram.username })
    expect(tg).toHaveAttribute('href', config.telegram.url)
    expect(tg).toHaveAttribute('target', '_blank')
    expect(tg).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it("inline stil yo'q; ikki karta `.card--lift`, tugmalar `btn-primary` to'liq kenglikda (accent ishlatilmaydi)", () => {
    const { container } = render(<Hemis />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(container.querySelectorAll('.hemis-card.card--lift')).toHaveLength(2)
    for (const name of [/HEMIS Student/, /HEMIS OTM/]) {
      expect(screen.getByRole('link', { name })).toHaveClass('btn-primary', 'btn-block')
    }
  })
})
