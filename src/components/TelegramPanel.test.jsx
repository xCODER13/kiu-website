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

describe('TelegramPanel — inline stillar klassga ko\'chirilgan (Bosqich 5c)', () => {
  it("`[style]` va `<style>` yo'q; struktura klasslar bilan", () => {
    const { container } = render(<TelegramPanel />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(document.querySelectorAll('style')).toHaveLength(0)
    expect(container.firstChild).toHaveClass('tg-box')
    expect(container.querySelectorAll('.tg-msg')).toHaveLength(4)
    expect(container.querySelector('.tg-live')).toHaveTextContent('LIVE')
    // 6.11b: "Obuna" tugmasi umumiy `.btn-primary` (wine); `.tg-subscribe` faqat ikonka bilan joylashuv uchun nom
    expect(screen.getByRole('link', { name: /Kanalga obuna bo'lish/ })).toHaveClass('btn', 'btn-primary', 'tg-subscribe')
  })
})

// Bosqich 6.11b: 2×2 to'r (keng joy) / bitta ustun (`single`, tor joy — Contact), LIVE nuqtasi dekorativ.
describe('TelegramPanel — qayta dizayn (Bosqich 6.11b)', () => {
  it("odatda to'r (`data-layout=\"grid\"`), `single` bersa bitta ustun (`data-layout=\"single\"`); postlar soni o'zgarmaydi", () => {
    const { container, rerender } = render(<TelegramPanel />)
    expect(container.firstChild).toHaveAttribute('data-layout', 'grid')
    expect(container.querySelectorAll('.tg-msg')).toHaveLength(4)
    rerender(<TelegramPanel single />)
    expect(container.firstChild).toHaveAttribute('data-layout', 'single')
    expect(container.querySelectorAll('.tg-msg')).toHaveLength(4)
  })

  it("LIVE belgisi: matn 'LIVE' qoladi, nuqta `aria-hidden`; ikonkalar dekorativ", () => {
    const { container } = render(<TelegramPanel />)
    expect(container.querySelector('.tg-live')).toHaveTextContent('LIVE')
    expect(container.querySelector('.tg-live-dot')).toHaveAttribute('aria-hidden', 'true')
    container.querySelectorAll('svg').forEach(svg => expect(svg).toHaveAttribute('aria-hidden', 'true'))
  })
})
