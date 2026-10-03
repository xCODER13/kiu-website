import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { stripLangPrefix } from '../i18n/locale'

// SPA'da sahifa almashganda brauzer scroll holatini o'zi tiklamaydi — yangi sahifa
// oldingi sahifadagi joydan ochilardi. Yo'l (til prefiksisiz) o'zgarganda tepaga qaytaramiz.
// - Til almashtirish (/faq → /en/faq) bir xil sahifa: scroll joyida qoladi.
// - `#hash` bo'lsa — mos elementga o'tiladi (bo'lmasa tepaga).
// - `behavior: 'instant'` — global `html { scroll-behavior: smooth }` ni chetlab o'tadi
//   (yangi sahifa uchun silliq "uchib o'tish" kerak emas, u darhol boshidan ochilishi shart).
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const path = stripLangPrefix(pathname)
  const prev = useRef(null)

  useEffect(() => {
    const changed = prev.current !== null && prev.current !== path
    prev.current = path
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) { el.scrollIntoView({ behavior: 'instant', block: 'start' }); return }
    }
    if (changed) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [path, hash])

  return null
}
