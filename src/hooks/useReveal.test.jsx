import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import useReveal from './useReveal'

function Probe() { useReveal(); return <div><p className="reveal">a</p><p className="reveal">b</p><p>c</p></div> }

describe('useReveal', () => {
  it('.reveal elementlarni kuzatadi, disconnect qiladi', () => {
    const observe = vi.fn(), disconnect = vi.fn()
    let cb
    vi.stubGlobal('IntersectionObserver', vi.fn(function (fn) { cb = fn; this.observe = observe; this.disconnect = disconnect }))
    const { container, unmount } = render(<Probe />)
    expect(observe).toHaveBeenCalledTimes(2)
    const [a, b] = container.querySelectorAll('.reveal')
    cb([{ isIntersecting: true, target: a }, { isIntersecting: false, target: b }])
    expect(a).toHaveClass('visible')
    expect(b).not.toHaveClass('visible')
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
