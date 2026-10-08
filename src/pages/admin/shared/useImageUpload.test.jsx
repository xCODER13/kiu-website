import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSingleImageUpload, useMultiImageUpload } from './useImageUpload'

const file = (name = 'a.png', type = 'image/png', size = 1000) => {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}
const evt = (...files) => ({ target: { files } })
let n
beforeEach(() => {
  n = 0
  URL.createObjectURL = vi.fn(() => `blob:mock-${++n}`)
  URL.revokeObjectURL = vi.fn()
  vi.stubGlobal('alert', vi.fn())
})

describe('useSingleImageUpload', () => {
  it('rasm tanlanadi — file va blob preview', () => {
    const { result } = renderHook(() => useSingleImageUpload())
    const f = file()
    act(() => result.current.handleImageSelect(evt(f)))
    expect(result.current.imageFile).toBe(f)
    expect(result.current.imagePreview).toBe('blob:mock-1')
  })
  it('rasm bo\'lmagan fayl rad etiladi (PDF, SVG emas-image turi)', () => {
    const { result } = renderHook(() => useSingleImageUpload())
    act(() => result.current.handleImageSelect(evt(file('a.pdf', 'application/pdf'))))
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Faqat rasm fayli qabul qilinadi'))
    expect(result.current.imageFile).toBeNull()
  })
  it.each(['image/svg+xml', 'image/bmp', 'image/tiff', 'image/x-icon'])('%s rad etiladi (faqat JPEG/PNG/WebP/GIF)', type => {
    const { result } = renderHook(() => useSingleImageUpload())
    act(() => result.current.handleImageSelect(evt(file('x', type))))
    expect(alert).toHaveBeenCalled()
    expect(result.current.imageFile).toBeNull()
  })
  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])('%s qabul qilinadi', type => {
    const { result } = renderHook(() => useSingleImageUpload())
    act(() => result.current.handleImageSelect(evt(file('x', type))))
    expect(result.current.imageFile).not.toBeNull()
  })
  it('5 MB dan katta rad etiladi, aynan 5 MB qabul qilinadi (chegara)', () => {
    const { result } = renderHook(() => useSingleImageUpload())
    act(() => result.current.handleImageSelect(evt(file('b.png', 'image/png', 5 * 1024 * 1024 + 1))))
    expect(alert).toHaveBeenCalledWith("Rasm 5 MB dan katta bo'lmasin!")
    expect(result.current.imageFile).toBeNull()
    act(() => result.current.handleImageSelect(evt(file('c.png', 'image/png', 5 * 1024 * 1024))))
    expect(result.current.imageFile).not.toBeNull()
  })
  it('fayl tanlanmasa (bekor qilingan dialog) hech narsa o\'zgarmaydi', () => {
    const { result } = renderHook(() => useSingleImageUpload())
    act(() => result.current.handleImageSelect({ target: { files: [] } }))
    expect(result.current.imageFile).toBeNull()
    expect(alert).not.toHaveBeenCalled()
  })
  it('almashtirilganda eski blob URL bo\'shatiladi (xotira oqishi yo\'q)', () => {
    const { result } = renderHook(() => useSingleImageUpload())
    act(() => result.current.handleImageSelect(evt(file())))
    act(() => result.current.handleImageSelect(evt(file('b.png'))))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-1')
    expect(result.current.imagePreview).toBe('blob:mock-2')
  })
  it('mavjud (blob bo\'lmagan) URL revoke qilinmaydi', () => {
    const { result } = renderHook(() => useSingleImageUpload())
    act(() => result.current.setImagePreview('https://x.supabase.co/a.jpg'))
    act(() => result.current.handleImageSelect(evt(file())))
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
  })
  it('clearImage — file va preview tozalanadi, blob revoke', () => {
    const { result } = renderHook(() => useSingleImageUpload())
    act(() => result.current.handleImageSelect(evt(file())))
    act(() => result.current.clearImage())
    expect(result.current.imageFile).toBeNull()
    expect(result.current.imagePreview).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-1')
  })
})

describe('useMultiImageUpload', () => {
  it('bir nechta rasm qo\'shiladi, ketma-ket tanlash to\'planadi', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.handleFileSelect(evt(file('1.png'), file('2.png'))))
    act(() => result.current.handleFileSelect(evt(file('3.png'))))
    expect(result.current.imageFiles.map(f => f.name)).toEqual(['1.png', '2.png', '3.png'])
    expect(result.current.imagePreviews).toHaveLength(3)
    expect(result.current.imagePreviews.every(p => p.isNew)).toBe(true)
  })
  it('bitta yaroqsiz fayl bo\'lsa — butun tanlov rad (hech biri qo\'shilmaydi)', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.handleFileSelect(evt(file('1.png'), file('x.pdf', 'application/pdf'))))
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Faqat rasm fayllari qabul qilinadi'))
    expect(result.current.imageFiles).toHaveLength(0)
  })
  it('ko\'p rasm: SVG aralashgan tanlov butunlay rad etiladi', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.handleFileSelect(evt(file('1.png'), file('evil.svg', 'image/svg+xml'))))
    expect(alert).toHaveBeenCalled()
    expect(result.current.imageFiles).toHaveLength(0)
  })
  it('katta fayl nomi bilan xabar beriladi va rad etiladi', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.handleFileSelect(evt(file('big.png', 'image/png', 6 * 1024 * 1024))))
    expect(alert).toHaveBeenCalledWith('big.png — 5 MB dan katta!')
    expect(result.current.imageFiles).toHaveLength(0)
  })
  it('reset(urls) — mavjud URL lar isNew:false, yangi fayllar tozalanadi', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.handleFileSelect(evt(file())))
    act(() => result.current.reset(['https://a/1.jpg', 'https://a/2.jpg']))
    expect(result.current.imageFiles).toHaveLength(0)
    expect(result.current.imagePreviews).toEqual([{ url: 'https://a/1.jpg', isNew: false }, { url: 'https://a/2.jpg', isNew: false }])
  })
  it('clear() hammasini tozalaydi', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.reset(['https://a/1.jpg']))
    act(() => result.current.clear())
    expect(result.current.imagePreviews).toEqual([])
  })
  it('removeImage: mavjud + yangi aralash bo\'lganda TO\'G\'RI faylni olib tashlaydi', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.reset(['https://a/old.jpg']))            // preview[0] mavjud
    act(() => result.current.handleFileSelect(evt(file('n1.png'), file('n2.png'), file('n3.png'))))  // preview[1..3] yangi
    act(() => result.current.removeImage(2))                          // n2.png ni olib tashlaymiz
    expect(result.current.imageFiles.map(f => f.name)).toEqual(['n1.png', 'n3.png'])
    expect(result.current.imagePreviews).toHaveLength(3)
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
  })
  it('removeImage: mavjud rasm — fayllar ro\'yxatiga tegmaydi, blob revoke qilinmaydi', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.reset(['https://a/old.jpg']))
    act(() => result.current.handleFileSelect(evt(file('n1.png'))))
    act(() => result.current.removeImage(0))
    expect(result.current.imageFiles.map(f => f.name)).toEqual(['n1.png'])
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
  })
  // 6.24: drag-and-drop uchun `addFiles`, jami son chegarasi va `alert()` o'rniga `onError`
  it('addFiles — fayl tanlash bilan bir xil yo\'l (drag-and-drop uchun)', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.addFiles([file('d1.png'), file('d2.png')]))
    expect(result.current.imageFiles.map(f => f.name)).toEqual(['d1.png', 'd2.png'])
    act(() => result.current.addFiles([]))
    act(() => result.current.addFiles(null))
    expect(result.current.imageFiles).toHaveLength(2)
  })
  it('`onError` berilsa alert() chaqirilmaydi; xato turi va fayl uzatiladi, hech narsa qo\'shilmaydi', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useMultiImageUpload({ onError }))
    act(() => result.current.addFiles([file('x.pdf', 'application/pdf')]))
    expect(onError).toHaveBeenLastCalledWith({ kind: 'type', file: expect.objectContaining({ name: 'x.pdf' }) })
    const big = file('big.png', 'image/png', 5 * 1024 * 1024 + 1)
    act(() => result.current.addFiles([file('ok.png'), big]))
    expect(onError).toHaveBeenLastCalledWith({ kind: 'size', file: big })
    expect(alert).not.toHaveBeenCalled()
    expect(result.current.imageFiles).toHaveLength(0)
  })
  it('`max`: mavjud + yangi jami chegaradan oshsa butun tanlov rad etiladi (aynan chegaraga teng — qabul)', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useMultiImageUpload({ onError, max: 3 }))
    act(() => result.current.reset(['https://a/1.jpg']))
    act(() => result.current.addFiles([file('1.png'), file('2.png'), file('3.png')]))
    expect(onError).toHaveBeenCalledWith({ kind: 'count', max: 3 })
    expect(result.current.imagePreviews).toHaveLength(1)
    act(() => result.current.addFiles([file('1.png'), file('2.png')]))
    expect(result.current.imagePreviews).toHaveLength(3)
  })
  it('`max` va `onError` yo\'q bo\'lsa xatti-harakat avvalgidek (cheklovsiz, `alert()`)', () => {
    const { result } = renderHook(() => useMultiImageUpload())
    act(() => result.current.addFiles(Array.from({ length: 12 }, (_, i) => file(`${i}.png`))))
    expect(result.current.imageFiles).toHaveLength(12)
    act(() => result.current.addFiles([file('x.pdf', 'application/pdf')]))
    expect(alert).toHaveBeenCalledTimes(1)
  })
})
