import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Hemis from './Hemis'

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