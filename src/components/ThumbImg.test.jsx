import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThumbImg from './ThumbImg'

const ORIGINAL = 'https://abc.supabase.co/storage/v1/object/public/uploads/news/x.png'
const THUMB = `${ORIGINAL}.thumb.webp`

describe('ThumbImg', () => {
  it("o'z Storage rasmi: avval thumbnail, boshqa atributlar saqlanadi", () => {
    render(<ThumbImg src={ORIGINAL} alt="Rasm" loading="lazy" className="c" />)
    const img = screen.getByAltText('Rasm')
    expect(img).toHaveAttribute('src', THUMB)
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveClass('c')
  })

  it("thumbnail yuklanmasa (eski rasm) — originalga qaytadi, onError chaqirilmaydi", () => {
    const onError = vi.fn()
    render(<ThumbImg src={ORIGINAL} alt="Rasm" onError={onError} />)
    fireEvent.error(screen.getByAltText('Rasm'))
    expect(screen.getByAltText('Rasm')).toHaveAttribute('src', ORIGINAL)
    expect(onError).not.toHaveBeenCalled()
  })

  it("original ham yuklanmasa — onError endi chaqiriladi (data-broken mexanizmi ishlaydi)", () => {
    const onError = vi.fn(e => { e.currentTarget.dataset.broken = 'true' })
    render(<ThumbImg src={ORIGINAL} alt="Rasm" onError={onError} />)
    fireEvent.error(screen.getByAltText('Rasm'))
    fireEvent.error(screen.getByAltText('Rasm'))
    expect(onError).toHaveBeenCalledTimes(1)
    expect(screen.getByAltText('Rasm')).toHaveAttribute('data-broken', 'true')
  })

  it("begona URL: thumbnail urinilmaydi, xato darhol onError'ga", () => {
    const onError = vi.fn()
    render(<ThumbImg src="https://example.com/a.png" alt="Rasm" onError={onError} />)
    const img = screen.getByAltText('Rasm')
    expect(img).toHaveAttribute('src', 'https://example.com/a.png')
    fireEvent.error(img)
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it("src o'zgarsa yangi rasm uchun yana thumbnail sinaladi", () => {
    const other = ORIGINAL.replace('x.png', 'y.png')
    const { rerender } = render(<ThumbImg src={ORIGINAL} alt="Rasm" />)
    fireEvent.error(screen.getByAltText('Rasm'))
    expect(screen.getByAltText('Rasm')).toHaveAttribute('src', ORIGINAL)
    rerender(<ThumbImg src={other} alt="Rasm" />)
    expect(screen.getByAltText('Rasm')).toHaveAttribute('src', `${other}.thumb.webp`)
  })

  it("src yo'q bo'lsa xato bermaydi", () => {
    render(<ThumbImg src={undefined} alt="Rasm" />)
    expect(screen.getByAltText('Rasm')).not.toHaveAttribute('src', expect.stringContaining('thumb'))
  })
})
