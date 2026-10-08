import { useState } from 'react'
import useMediaQuery from './useMediaQuery'

// Karusel avtoaylanishini to'xtatish shartlari (WCAG 2.2.2): sichqoncha ustida, klaviatura fokusi ichida (faqat `:focus-visible` —
// sichqoncha bilan strelka bosilgandan keyin avtoaylanish chiqib ketgach davom etadi) va tizimda «animatsiyani kamaytirish» yoqilgan bo'lsa.
export default function useCarouselPause() {
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  return {
    paused: hover || focus || reduce,
    handlers: {
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      onFocus: e => {
        let visible = true
        try { visible = e.target.matches(':focus-visible') } catch { /* eski brauzer: ehtiyot uchun pauza */ }
        if (visible) setFocus(true)
      },
      onBlur: e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false) },
    },
  }
}
