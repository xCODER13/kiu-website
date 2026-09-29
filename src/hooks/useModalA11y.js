import { useEffect } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Modal uchun klaviatura qulayligi: Esc bilan yopish, Tab fokusni modal ichida ushlab turish,
// ochilganda fokusni modalga o'tkazish va yopilganda avvalgi elementga qaytarish,
// modal ochiq paytda orqa sahifa scroll bo'lmasligi.
export default function useModalA11y(ref, onClose) {
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return undefined
    const previouslyFocused = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null || el === document.activeElement)
    // Birinchi maydonga (yopish tugmasidan keyingi) fokus; topilmasa dialogning o'ziga
    const first = dialog.querySelector('input, select, textarea') || focusables()[0]
    if (first) first.focus()
    else { dialog.setAttribute('tabindex', '-1'); dialog.focus() }

    function onKeyDown(e) {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) { e.preventDefault(); return }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === firstEl || !dialog.contains(document.activeElement))) {
        e.preventDefault(); lastEl.focus()
      } else if (!e.shiftKey && (document.activeElement === lastEl || !dialog.contains(document.activeElement))) {
        e.preventDefault(); firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) previouslyFocused.focus()
    }
    // onClose har renderda yangi funksiya bo'lishi mumkin — effect faqat mount/unmount'da ishlashi kerak
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
