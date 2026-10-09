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

  it("«Talabalar hayoti» «Talabalar» ustunida, «Tadbirlar»dan oldin; «Bog'lanish» ustunida takrorlanmaydi (Xarita va QR Kod qoladi)", () => {
    const { container } = renderFooter()
    const col = screen.getByRole('heading', { name: 'Talabalar' }).parentElement
    const names = [...col.querySelectorAll('a.footer-link')].map(a => a.textContent)
    expect(names.indexOf('Talabalar hayoti')).toBeGreaterThan(-1)
    expect(names.indexOf('Talabalar hayoti')).toBe(names.indexOf('Tadbirlar') - 1)
    expect(names[names.indexOf('Talabalar hayoti') - 1]).toBe('Qabul')
    const media = [...container.querySelectorAll('.footer-media-link')].map(a => a.textContent)
    expect(media).toEqual(['Xarita', 'QR Kod'])
    expect(screen.getAllByRole('link', { name: 'Talabalar hayoti' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Talabalar hayoti' })).toHaveAttribute('href', '/student-life')
  })

  it("logotip bor, lekin dekorativ: universitet nomi yonida ekran o'qiydigan dasturda takrorlanmaydi", () => {
    const { container } = renderFooter()
    const logo = container.querySelector('footer svg.site-logo--footer')
    expect(logo).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img', { name: 'KIU logo' })).not.toBeInTheDocument()
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

  it("Bosqich 5a: inline style va JS hover yo'q — hover CSS `:hover` da", () => {
    const { container } = renderFooter()
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    const links = container.querySelectorAll('a.footer-link, a.footer-media-link')
    expect(links.length).toBeGreaterThan(10)
  })
})
