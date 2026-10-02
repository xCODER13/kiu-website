import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QRCode from './QRCode'
import config from '../config'

describe('QRCode (smoke test)', () => {
  it("qulamasdan render bo'ladi va barcha ijtimoiy tarmoq QR kartochkalari ko'rsatiladi", () => {
    render(<QRCode />)
    expect(screen.getByText('QR Kodlar')).toBeInTheDocument()
    expect(screen.getByText('Telegram')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('YouTube')).toBeInTheDocument()
    expect(screen.getByText('Facebook')).toBeInTheDocument()
  })

  it("regressiya: 'ga o'tish' havolalari yangi oynada va xavfsiz (tabnabbing'dan himoyalangan) ochiladi", () => {
    render(<QRCode />)
    ;['Telegram ga o\'tish', 'Instagram ga o\'tish', 'YouTube ga o\'tish', 'Facebook ga o\'tish'].forEach(name => {
      const link = screen.getByRole('link', { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    })
  })
})

describe("QRCode — hover CSS da, inline stil yo'q (Bosqich 5c → 6.11c2)", () => {
  // 6.11c2: har bir tarmoqning gradient fonli `.social-link` havolasi o'rniga umumiy `.btn-primary` (loyiha rangi);
  // brend rangi faqat ikonka doirasida (CSS klassi), shuning uchun inline `background` ham qolmadi.
  it("havola: `btn btn-primary`, inline stil yo'q; hover uni o'zgartirmaydi", async () => {
    render(<QRCode />)
    const user = userEvent.setup()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
    for (const link of links) {
      expect(link).toHaveClass('btn', 'btn-primary', 'qr-card__link')
      expect(link).not.toHaveAttribute('style')
      await user.hover(link)
      expect(link).not.toHaveAttribute('style')
      await user.unhover(link)
      expect(link).not.toHaveAttribute('style')
    }
  })
})

describe('QRCode — qayta dizayn (Bosqich 6.11c2)', () => {
  it("havolalar `config.social` dan; QR rasmi loyiha rangida (`7f2063`), oq fonda, referrer yuborilmaydi", () => {
    const { container } = render(<QRCode />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    const expected = { Telegram: config.social.telegram, Instagram: config.social.instagram, YouTube: config.social.youtube, Facebook: config.social.facebook }
    for (const [name, url] of Object.entries(expected)) {
      expect(screen.getByRole('link', { name: new RegExp(`${name} ga`) })).toHaveAttribute('href', url)
      const img = screen.getByAltText(`${name} QR`)
      const src = img.getAttribute('src')
      expect(src).toContain(`data=${encodeURIComponent(url)}`)
      expect(src).toContain('color=7f2063')
      expect(src).toContain('bgcolor=ffffff')
      expect(img).toHaveAttribute('referrerpolicy', 'no-referrer')
    }
  })

  it("brend rangi faqat ikonka doirasida (`qr-card__icon--*`); har kartada foydalanuvchi nomi pill'i", () => {
    const { container } = render(<QRCode />)
    for (const k of ['telegram', 'instagram', 'youtube', 'facebook']) {
      expect(container.querySelectorAll(`.qr-card__icon--${k}`)).toHaveLength(1)
    }
    expect(container.querySelectorAll('.qr-card__user.pill-brand')).toHaveLength(4)
    expect(screen.getByText('Qanday foydalanish kerak?')).toBeInTheDocument()
  })
})
