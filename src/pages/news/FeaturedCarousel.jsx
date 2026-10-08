import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useNavigate from '../../i18n/useLocalizedNavigate'
import { getCategoryToken, getCategoryLabel } from '../../utils/newsCategories'
import { parseImages } from './utils'
import { formatDate } from '../../utils/formatDate'
import useCarouselPause from '../../hooks/useCarouselPause'

// ── FEATURED CAROUSEL ── (6.11: rasm ustida wine qoplama; kategoriya — pill ichida rangli nuqta)
export default function FeaturedCarousel({ items }) {
  const { t } = useTranslation()
  const [idx, setIdx] = useState(0)
  const { paused, handlers } = useCarouselPause()
  const timer = useRef(null)
  const navigate = useNavigate()

  const next = useCallback(() => setIdx(i => (i + 1) % items.length), [items.length])
  const prev = () => setIdx(i => (i - 1 + items.length) % items.length)

  useEffect(() => {
    if (paused || items.length < 2) return
    timer.current = setInterval(next, 4000)
    return () => clearInterval(timer.current)
  }, [paused, next, items.length])

  if (!items.length) return null
  const item = items[idx]

  const image = parseImages(item.image)[0]

  return (
    <div
      className="carousel"
      {...handlers}
    >
      {/* Background: faqat rasm manzili dinamik; rasm yo'q bo'lsa CSS dagi gradient */}
      <div
        key={idx}
        className="carousel-bg"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      />

      {/* Qoplamalar: pastdan qora gradient + chapdan wine (toifa rangidan mustaqil, spec 6.11) */}
      <div className="carousel-shade" />
      <div className="carousel-tint" />

      {/* Slide counter top-right */}
      <div className="carousel-counter">
        {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
      </div>

      {/* Content */}
      <div className="carousel-content">
        {/* Category badge */}
        {item.category && (
          <div className="carousel-meta">
            <span className="carousel-cat" style={{ '--cat': getCategoryToken(item.category) }}>
              <span className="carousel-cat-dot" aria-hidden="true" />
              {getCategoryLabel(item.category, t)}
            </span>
            <span className="carousel-date">
              {formatDate(item.createdAt)}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="carousel-title" lang="uz">
          {item.title}
        </h2>

        {/* Excerpt */}
        {item.content && (
          <p className="carousel-excerpt">
            {item.content}
          </p>
        )}

        {/* Bottom row */}
        <div className="carousel-foot">
          <span className="carousel-views">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {item.views}
          </span>
          <button type="button" onClick={() => navigate(`/news/${item._id}`)} className="btn btn-primary carousel-more">
            {t('news.more')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>

      {/* Prev / Next buttons */}
      {items.length > 1 && (<>
        <button type="button" onClick={prev} aria-label={t('news.prevNews')} className="carousel-nav carousel-nav--prev">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button type="button" onClick={next} aria-label={t('news.nextNews')} className="carousel-nav carousel-nav--next">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Dots */}
        <div className="carousel-dots">
          {items.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)} aria-label={t('news.goSlide', { n: i + 1 })} aria-current={i === idx ? 'true' : undefined} className="carousel-dot" />
          ))}
        </div>
      </>)}
    </div>
  )
}
