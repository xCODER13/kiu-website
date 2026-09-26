import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useApi from './useApi'

const ok = body => Promise.resolve({ ok: true, json: () => Promise.resolve(body) })

describe('useApi', () => {
  it('massiv javobni data ga yozadi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ok([{ id: 1 }])))
    const { result } = renderHook(() => useApi('/x'))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: 1 }])
    expect(result.current.error).toBe(false)
  })

  it('{posts: [...]} shaklini ochadi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ok({ posts: [{ id: 2 }] })))
    const { result } = renderHook(() => useApi('/x'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: 2 }])
  })

  it('bo\'sh massiv — fallback saqlanadi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ok([])))
    const fb = [{ id: 'fb' }]
    const { result } = renderHook(() => useApi('/x', fb))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBe(fb)
  })

  it('massiv bo\'lmagan obyekt — o\'sha obyekt', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ok({ name: 'KIU' })))
    const { result } = renderHook(() => useApi('/x', {}))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ name: 'KIU' })
  })

  it('HTTP xato — error=true, fallback', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })))
    const { result } = renderHook(() => useApi('/x', ['fb']))
    await waitFor(() => expect(result.current.error).toBe(true))
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(['fb'])
  })

  it('tarmoq xatosi — error=true', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const { result } = renderHook(() => useApi('/x'))
    await waitFor(() => expect(result.current.error).toBe(true))
  })

  it('poyga holati: url almashgach eski so\'rovning kechikkan javobi e\'tiborga olinmaydi', async () => {
    const pending = {}
    vi.stubGlobal('fetch', vi.fn(u => new Promise(r => { pending[u] = r })))
    const res = body => ({ ok: true, json: () => Promise.resolve(body) })
    const { result, rerender } = renderHook(({ u }) => useApi(u), { initialProps: { u: '/a' } })
    rerender({ u: '/b' })
    pending['/b'](res([{ id: 'B' }]))
    await waitFor(() => expect(result.current.data).toEqual([{ id: 'B' }]))
    pending['/a'](res([{ id: 'A' }])) // eski javob keyin keladi
    await new Promise(r => setTimeout(r, 20))
    expect(result.current.data).toEqual([{ id: 'B' }])
  })

  it('url o\'zgarsa qayta so\'raydi', async () => {
    const f = vi.fn(() => ok([{ id: 1 }]))
    vi.stubGlobal('fetch', f)
    const { rerender } = renderHook(({ u }) => useApi(u), { initialProps: { u: '/a' } })
    await waitFor(() => expect(f).toHaveBeenCalledWith('/a'))
    rerender({ u: '/b' })
    await waitFor(() => expect(f).toHaveBeenCalledWith('/b'))
  })

  it('url o\'zgarganda loading qayta true bo\'ladi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ok([{ id: 1 }])))
    const { result, rerender } = renderHook(({ u }) => useApi(u), { initialProps: { u: '/a' } })
    await waitFor(() => expect(result.current.loading).toBe(false))
    rerender({ u: '/b' })
    expect(result.current.loading).toBe(true)
  })
})
