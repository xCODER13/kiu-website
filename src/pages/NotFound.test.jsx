import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LocaleProvider from '../i18n/LocaleProvider'
import NotFound from './NotFound'

const at = (entries, index) => render(
  <MemoryRouter initialEntries={entries} initialIndex={index}>
    <LocaleProvider>
      <Routes>
        <Route path="/prev" element={<p>oldingi sahifa</p>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LocaleProvider>
  </MemoryRouter>
)

describe('NotFound (Bosqich 6.11c2)', () => {
  it('"404" belgisi bitta rasm sifatida o\'qiladi; sarlavha h1; asosiy tugma bosh sahifaga', () => {
    const { container } = at(['/yoq-sahifa'], 0)
    expect(screen.getByRole('img', { name: '404' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Sahifa topilmadi' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Bosh sahifaga qaytish' })).toHaveAttribute('href', '/')
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(container.querySelectorAll('.btn-glow')).toHaveLength(0)
  })

  it("to'g'ridan-to'g'ri kirilganda (tarix yo'q) 'Orqaga' yashirin; avval boshqa sahifa bo'lsa — ko'rinadi va orqaga qaytaradi", async () => {
    const user = userEvent.setup()
    const { unmount } = at(['/yoq-sahifa'], 0)
    expect(screen.queryByRole('button', { name: 'Orqaga' })).not.toBeInTheDocument()
    unmount()

    at(['/prev', '/yoq-sahifa'], 1)
    await user.click(screen.getByRole('button', { name: 'Orqaga' }))
    expect(screen.getByText('oldingi sahifa')).toBeInTheDocument()
  })

  it("'Foydali havolalar': 4 ta havola (Yo'nalishlar, Qabul, Yangiliklar, Bog'lanish)", () => {
    at(['/yoq-sahifa'], 0)
    const nav = screen.getByRole('navigation', { name: 'Foydali havolalar' })
    const hrefs = [...nav.querySelectorAll('a')].map(a => a.getAttribute('href'))
    expect(hrefs).toEqual(['/faculty', '/admission', '/news', '/contact'])
  })

  it("ruscha: havolalar /ru prefiksli, matn ruscha", () => {
    at(['/ru/yoq-sahifa'], 0)
    const nav = screen.getByRole('navigation', { name: 'Полезные ссылки' })
    expect([...nav.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['/ru/faculty', '/ru/admission', '/ru/news', '/ru/contact'])
    expect(screen.getByRole('link', { name: 'Вернуться на главную' })).toHaveAttribute('href', '/ru')
  })
})
