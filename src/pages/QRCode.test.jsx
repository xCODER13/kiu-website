import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QRCode from './QRCode'

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