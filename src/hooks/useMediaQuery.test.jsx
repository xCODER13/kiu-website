import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useMediaQuery from './useMediaQuery'

function fakeMatchMedia(initial) {
  const listeners = new Set()
  const mq = {
    matches: initial,
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mq))
  window.matchMedia = globalThis.matchMedia
  return { set(v) { mq.matches = v; listeners.forEach(fn => fn()) }, listeners }
}

describe('useMediaQuery', () => {
  afterEach(() => { vi.unstubAllGlobals(); delete window.matchMedia })

  it('matchMedia yo\'q muhitda — false', () => {
    delete window.matchMedia
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it("boshlang'ich qiymat va keyingi o'zgarish (ekran o'lchami/aylanishi) komponentni yangilaydi", () => {
    const mm = fakeMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(false)
    act(() => mm.set(true))
    expect(result.current).toBe(true)
  })

  it('unmount bo\'lganda tinglovchi olib tashlanadi', () => {
    const mm = fakeMatchMedia(true)
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(mm.listeners.size).toBe(1)
    unmount()
    expect(mm.listeners.size).toBe(0)
  })
})
