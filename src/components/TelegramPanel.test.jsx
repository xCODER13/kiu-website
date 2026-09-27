import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TelegramPanel from './TelegramPanel'
import config from '../config'

describe('TelegramPanel', () => {
  it('kanal nomi va tavsifi ko\'rsatiladi', () => {
    render(<TelegramPanel />)
    expect(screen.getByText(config.telegram.username)).toBeInTheDocument()
    expect(screen.getByText('Rasmiy Telegram kanal')).toBeInTheDocument()
  })

  it('demo postlar matni bilan ko\'rsatiladi', () => {
    render(<TelegramPanel />)
    expect(screen.getByText(/Qabul hujjatlari to'plami yangilandi/)).toBeInTheDocument()
    expect(screen.getByText(/Stipendiya arizalari/)).toBeInTheDocument()
    expect(screen.getByText(/Ochiq eshiklar kuni/)).toBeInTheDocument()
    expect(screen.getByText(/Yangi laboratoriya jihozlari/)).toBeInTheDocument()
  })

  it('"Kanalga obuna bo\'lish" havolasi to\'g\'ri manzilga, yangi oynada va xavfsiz (tabnabbing\'dan himoyalangan) ochiladi', () => {
    render(<TelegramPanel />)
    const link = screen.getByRole('link', { name: /Kanalga obuna bo'lish/ })
    expect(link).toHaveAttribute('href', config.telegram.url)
    expect(link).toHaveAttribute('target', '_blank')
    // regressiya: rel="noreferrer" yolg'iz o'zi window.opener'ni kafolatlab
    // bloklamaydi — noopener ham bo'lishi shart
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
  })
})