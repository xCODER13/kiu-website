import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import { getCategoryToken, getCategoryLabel } from '../../utils/newsCategories'
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
      <div className="carousel-shade" />
      <div className="carousel-tint" />

      {items.length > 1 && (
        <div className="carousel-counter">
          {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </div>
      )}

      <div className="carousel-content">
        {item.category && (
          <div className="carousel-meta">
            <span className="carousel-cat" style={{ '--cat': getCategoryToken(item.category) }}>
              <span className="carousel-cat-dot" aria-hidden="true" />
              {getCategoryLabel(item.category, t)}
            </span>
          </div>
        )}
        <h3 lang="uz" className="carousel-title">{item.title}</h3>
        <div className="carousel-foot">
          {/* Havola tugma ko'rinishida (avval `<a>` ichida stil bilan) */}
          <NavLink to={`/news/${item._id}`} className="btn btn-primary carousel-more">
            {t('home.news.more')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </NavLink>
        </div>
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
