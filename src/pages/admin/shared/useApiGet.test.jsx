import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useApiGet } from './useApiGet'

const ok = body => ({ ok: true, status: 200, json: () => Promise.resolve(body) })
const fail = status => ({ ok: false, status, json: () => Promise.resolve({ error: 'xato' }) })

// 6.22: Stats.jsx dagi oltita `fetch().then(r => r.json())` o'rniga bitta hook.
describe('useApiGet', () => {
  it('muvaffaqiyatli javob: yuklanmoqda → data', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(ok({ a: 1 }))))
    const { result } = renderHook(() => useApiGet('/stats', 'x'))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current).toMatchObject({ data: { a: 1 }, error: false })
  })

  it("`res.ok` false (4xx/5xx) — xato holati; `{error}` tanasi ma'lumot sifatida o'qilmaydi", async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(fail(500))))
    const { result } = renderHook(() => useApiGet('/stats', 'x'))
    await waitFor(() => expect(result.current.error).toBe(true))
    expect(result.current.data).toBeNull()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it("tarmoq xatosi — xato holati", async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const { result } = renderHook(() => useApiGet('/stats', 'x'))
    await waitFor(() => expect(result.current.error).toBe(true))
    spy.mockRestore()
  })

  it("so'rovga `AbortSignal` beriladi va unmount'da bekor qilinadi (setState yo'q)", async () => {
    let signal
    vi.stubGlobal('fetch', vi.fn((url, init) => { signal = init.signal; return new Promise(() => {}) }))
    const { unmount } = renderHook(() => useApiGet('/stats', 'x'))
    expect(signal.aborted).toBe(false)
    unmount()
    expect(signal.aborted).toBe(true)
  })

  it("`path` almashganda eski so'rov bekor qilinadi; yangisi kelguncha eskirgan ma'lumot ko'rsatilmaydi", async () => {
    const signals = []
    const resolvers = []
    vi.stubGlobal('fetch', vi.fn((url, init) => {
      signals.push(init.signal)
      return new Promise(resolve => resolvers.push(() => resolve(ok({ path: String(url) }))))
    }))
    const { result, rerender } = renderHook(({ p }) => useApiGet(p, 'x'), { initialProps: { p: '/a' } })
    rerender({ p: '/b' })
    expect(signals[0].aborted).toBe(true)
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    // eskirgan (bekor qilingan) so'rovning javobi kech kelsa ham yangisini bosib ketmaydi
    await act(async () => { resolvers[0](); resolvers[1]() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data.path).toMatch(/\/b$/)
  })
})
