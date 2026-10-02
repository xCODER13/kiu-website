import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import { getCategoryLabel } from '../../utils/newsCategories'
import { parseImages } from './utils'

// Home uchun ixchamlashtirilgan yangiliklar karuseli (6.11c5): ko'rinish Yangiliklar sahifasi karuseli bilan umumiy
// (`.carousel*` klasslari, pages.css). Mantiq o'zgarmagan: 5 s avtoaylanish, sichqoncha ustida pauza.
export default function HomeNewsCarousel({ items }) {
  const { t } = useTranslation()
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  const next = useCallback(() => setIdx(i => (i + 1) % items.length), [items.length])
  const prev = () => setIdx(i => (i - 1 + items.length) % items.length)

  useEffect(() => {
    if (paused || items.length < 2) return
    timerRef.current = setInterval(next, 5000)
    return () => clearInterval(timerRef.current)
  }, [paused, next, items.length])

  if (!items.length) return null
  const item = items[idx]
  const img = parseImages(item.image)[0]

  return (
    <div
      className="carousel carousel--home"
      role="region"
      aria-label={t('home.news.title')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fon: faqat rasm manzili dinamik; rasm yo'q bo'lsa CSS dagi gradient */}
      <div key={idx} className="carousel-bg" style={img ? { backgroundImage: `url(${img})` } : undefined} />
      {/* Rasm yo'q bo'lsa — taxtadagi bo'sh joy belgisi (dekorativ) */}
      {!img && (
        <div className="carousel-ph" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
      )}

      {/* Taxtada "Batafsil" tugmasi va "01 / 05" hisoblagichi yo'q: butun slayd — bitta havola (sarlavha ustidan cho'zilgan) */}
      <div className="carousel-content">
        {item.category && <span className="carousel-cat">{getCategoryLabel(item.category, t)}</span>}
        <h3 lang="uz" className="carousel-title">
          <NavLink to={`/news/${item._id}`} className="carousel-title__link">{item.title}</NavLink>
        </h3>
        <time className="carousel-date" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString(t('meta.dateLocale'))}</time>
      </div>

      {items.length > 1 && (
        <>
          <button type="button" onClick={prev} aria-label={t('home.news.prev')} className="carousel-nav carousel-nav--prev">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button type="button" onClick={next} aria-label={t('home.news.next')} className="carousel-nav carousel-nav--next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div className="carousel-dots">
            {items.map((_, i) => (
              <button key={i} type="button" onClick={() => setIdx(i)} aria-label={t('home.news.itemN', { n: i + 1 })} aria-current={i === idx ? 'true' : undefined} className="carousel-dot" />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
