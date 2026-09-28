import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

// Google Analytics (GA4). VITE_GA_MEASUREMENT_ID o'rnatilmagan bo'lsa (masalan
// local dev'da), hech narsa yuklanmaydi — xato chiqmaydi, shunchaki o'chiq.
//
// SPA ekanligi uchun (React Router, sahifa to'liq qayta yuklanmaydi) gtag'ning
// avtomatik page_view'i o'chirilgan (send_page_view: false) — buning o'rniga
// har route almashganda o'zimiz page_view yuboramiz, aks holda faqat birinchi
// yuklangan sahifa hisoblanib, keyingi navigatsiyalar butunlay ko'rinmas edi.
export default function useAnalytics() {
  const location = useLocation()
  const loaded = useRef(false)

  useEffect(() => {
    if (!GA_ID || loaded.current) return
    loaded.current = true

    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    script.async = true
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', GA_ID, { send_page_view: false })
  }, [])

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== 'function') return
    // Admin panel — o'zingizning ish faoliyatingiz, ziyoratchi statistikasiga
    // aralashmasligi uchun kuzatilmaydi
    if (location.pathname.startsWith('/admin')) return
    window.gtag('event', 'page_view', {
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [location.pathname])
}