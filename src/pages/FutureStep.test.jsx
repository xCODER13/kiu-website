import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import FutureStep from './FutureStep'

const NBU_PRODUCTS = 'https://nbu.uz/kichik-biznes/kreditlar/yangi-kelajakka-qadam-kreditlari'

describe('FutureStep («Kelajakka qadam»)', () => {
  it("hero + 4 imkoniyat + 5 yo'nalish (raqamlangan) + yakuniy banner; inline stil yo'q", () => {
    const { container } = render(<FutureStep />)
    expect(screen.getByRole('heading', { level: 1, name: '«Kelajakka qadam» dasturi' }).closest('.inner-hero')).not.toBeNull()
    expect(container.querySelectorAll('.feature-card')).toHaveLength(4)
    const products = container.querySelectorAll('.kq-product')
    expect(products).toHaveLength(5)
    expect([...products].map(p => p.querySelector('.kq-product__num').textContent)).toEqual(['1', '2', '3', '4', '5'])
    expect(container.querySelectorAll('.wine-banner')).toHaveLength(1)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it("kredit shartlari NBU manbasiga mos: summa, muddat, imtiyozli davr, stavka", () => {
    render(<FutureStep />)
    expect(screen.getByText("Kredit summasi — 20 mln so'mgacha")).toBeInTheDocument()
    expect(screen.getByText("Kredit summasi — 300 mln so'mgacha")).toBeInTheDocument()
    expect(screen.getByText("Kredit summasi — 2 mlrd so'mgacha")).toBeInTheDocument()
    expect(screen.getByText("Kredit summasi — 10 mlrd so'mgacha")).toBeInTheDocument()
    expect(screen.getAllByText('Markaziy bank asosiy stavkasi + 1%')).toHaveLength(4)
  })

  it("«Batafsil» havolasi faqat 4 ta kredit mahsulotida (NBU sahifasiga); «Mening birinchi kasbim»da yo'q", () => {
    render(<FutureStep />)
    const more = screen.getAllByRole('link', { name: 'Batafsil' })
    expect(more).toHaveLength(4)
    more.forEach(a => expect(a).toHaveAttribute('href', NBU_PRODUCTS))
  })

  it("tashqi havolalar xavfsiz (noopener noreferrer, yangi tab); telefon tozalangan `tel:` havolasi; asosiy tugma btn-primary", () => {
    render(<FutureStep />)
    const nbu = screen.getAllByRole('link', { name: 'Batafsil: nbu.uz' })
    expect(nbu).toHaveLength(2) // hero + yakuniy banner
    nbu.forEach(a => {
      expect(a).toHaveAttribute('href', 'https://nbu.uz/')
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(a).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    })
    expect(nbu[0]).toHaveClass('btn', 'btn-primary')
    screen.getAllByRole('link', { name: '(78) 148 00 10' }).forEach(a => expect(a).toHaveAttribute('href', 'tel:+998781480010'))
  })

  it("barcha ikonkalar dekorativ (`aria-hidden`)", () => {
    const { container } = render(<FutureStep />)
    container.querySelectorAll('svg').forEach(svg => expect(svg).toHaveAttribute('aria-hidden', 'true'))
  })
})

describe('FutureStep — plakatlar (qirqilmaydi, katta ko\'rinish)', () => {
  it("har yo'nalish kartasida to'liq plakat: alt, haqiqiy o'lcham (width/height), lazy; 5 ta", () => {
    const { container } = render(<FutureStep />)
    const imgs = container.querySelectorAll('.kq-product .kq-poster__img')
    expect(imgs).toHaveLength(5)
    imgs.forEach(img => {
      expect(img.getAttribute('alt')).toMatch(/^Plakat: «.+»$/)
      expect(Number(img.getAttribute('width'))).toBeGreaterThan(1000)
      expect(Number(img.getAttribute('height'))).toBeGreaterThan(1000)
      expect(img).toHaveAttribute('loading', 'lazy')
    })
    expect(screen.getAllByRole('button', { name: /Plakatni ko'rish/ })).toHaveLength(5)
  })

  it("CSS: plakat kenglikka moslanadi, balandlik nisbat bo'yicha (height: auto) va `object-fit: contain` — `cover` yo'q", () => {
    const css = readFileSync('src/styles/pages.css', 'utf-8')
    const rule = css.match(/\.kq-poster__img \{([^}]*)\}/)[1]
    expect(rule).toMatch(/width: 100%/)
    expect(rule).toMatch(/height: auto/)
    expect(rule).toMatch(/object-fit: contain/)
    expect(rule).not.toMatch(/cover|aspect-ratio|max-height|overflow/)
    const lb = css.match(/\.photo-lightbox--poster \.photo-lightbox__img \{([^}]*)\}/)[1]
    expect(lb).toMatch(/height: auto/)
    expect(lb).not.toMatch(/object-fit: cover/)
  })

  it("CSS: karta ustunlari vertikal markazlangan — matn tepasi va pastidagi bo'sh joy teng (`align-items: center`)", () => {
    const css = readFileSync('src/styles/pages.css', 'utf-8')
    const rule = css.match(/\.card\.kq-product \{([^}]*)\}/)[1]
    expect(rule).toMatch(/align-items: center/)
    expect(rule).not.toMatch(/align-items: (start|flex-start)/)
  })

  it("plakatni bosganda dialog ochiladi (to'liq rasm), Esc yoki yopish tugmasi bilan yopiladi", async () => {
    const user = userEvent.setup()
    render(<FutureStep />)
    await user.click(screen.getAllByRole('button', { name: /Plakatni ko'rish/ })[2])
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAccessibleName('«Biznes progress»')
    expect(dialog.querySelector('img')).toHaveAttribute('alt', 'Plakat: «Biznes progress»')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /Plakatni ko'rish/ })[0])
    await user.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
