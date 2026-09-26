import { describe, it, expect, vi } from 'vitest'
import { postSortingHatLead } from './api'

describe('postSortingHatLead', () => {
  it('to\'g\'ri URL, POST va JSON tana bilan yuboradi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })))
    await postSortingHatLead({ name: 'Ali Valiyev', phone: '+998901234567', faculties: ['A', 'B', 'C'] })
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('http://api.test/api/sorting-hat-lead')
    expect(opts.method).toBe('POST')
    expect(opts.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(opts.body)).toEqual({ name: 'Ali Valiyev', phone: '+998901234567', faculties: ['A', 'B', 'C'] })
  })

  it('tarmoq xatosi — throw qilmaydi (foydalanuvchi natijani ko\'rishda davom etadi)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await expect(postSortingHatLead({ name: 'x', phone: 'y', faculties: [] })).resolves.toBeUndefined()
    expect(log).toHaveBeenCalled()
  })

  it('HTTP 4xx/5xx ham jim yutiladi (lead yo\'qolishi seziladi emas)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })))
    await expect(postSortingHatLead({ name: 'x', phone: 'y', faculties: [] })).resolves.toBeUndefined()
  })
})
