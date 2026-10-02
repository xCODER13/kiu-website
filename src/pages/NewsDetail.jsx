import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useNavigate from '../i18n/useLocalizedNavigate'
import { getCategoryToken, getCategoryLabel } from '../utils/newsCategories'
import { parseImages } from './news/utils'
import ContentLangNote from '../i18n/ContentLangNote'
import config from '../config'

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// Rasm galereyasi (6.11): bitta rasm — oddiy; ko'p rasm — o'qlar (SVG), hisoblagich, nuqtalar, svayp va ← → tugmalari.
// Holatlar (`data-*`) CSS ga beriladi: inline stil yo'q (spec 7.5); yuklanmagan rasm — `data-broken`.
function ImageCarousel({ imgs, title }) {
  const { t } = useTranslation()
  const [cur, setCur]   = useState(0)
  const [dir, setDir]   = useState(0)   // -1 chap, 1 o'ng
  const [anim, setAnim] = useState(false)
  const touchX          = useRef(null)

  const go = useCallback((next) => {
    if (anim) return
    setDir(next > cur ? 1 : -1)
    setAnim(true)
    setTimeout(() => { setCur(next); setAnim(false) }, 280)
  }, [cur, anim])

  const prev = () => go(cur === 0 ? imgs.length - 1 : cur - 1)
  const next = () => go(cur === imgs.length - 1 ? 0 : cur + 1)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchX.current === null) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchX.current = null
  }

  if (!imgs.length) return null
  if (imgs.length === 1) return (
    <div className="gallery gallery--single">
      <img src={imgs[0]} alt={title} fetchpriority="high" className="gallery-img"
        onError={e => { e.currentTarget.closest('.gallery').dataset.broken = 'true' }} />
    </div>
  )

  return (
    <div className="gallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <img
        key={cur}
        src={imgs[cur]}
        alt={`${title} ${cur + 1}`}
        fetchpriority={cur === 0 ? 'high' : undefined}
        className="gallery-img"
        data-slide={anim ? (dir > 0 ? 'right' : 'left') : undefined}
        onError={e => { e.currentTarget.dataset.broken = 'true' }}
      />

      <div className="gallery-counter">{cur + 1} / {imgs.length}</div>

      <button type="button" onClick={prev} aria-label={t('news.prevImage')} className="gallery-arrow gallery-arrow--prev"><ChevronLeft /></button>
      <button type="button" onClick={next} aria-label={t('news.nextImage')} className="gallery-arrow gallery-arrow--next"><ChevronRight /></button>

      <div className="gallery-dots">
        {imgs.map((_, i) => (
          <button key={i} type="button" onClick={() => go(i)} aria-label={t('news.imageN', { n: i + 1 })}
            aria-current={i === cur ? 'true' : undefined} className="gallery-dot" />
        ))}
      </div>
    </div>
  )
}

const API = import.meta.env.VITE_API_URL

export default function NewsDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`${API}/api/news/${id}`)
        if (!res.ok) throw new Error('Topilmadi')
        const data = await res.json()
        setNews(data)
        document.title = `${data.title} — ${t('seo.siteName')}`
        // Ko'rishlar sonini oshirish — yordamchi amal: xato bersa maqola yashirinmasligi kerak
        fetch(`${API}/api/news/${id}/view`, { method: 'PUT' }).catch(() => {})
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
    return () => { document.title = t('seo.siteName') }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t tilga qarab o'zgaradi; sahifa tilini almashtirganda qayta yuklash shart emas
  }, [id])

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      {t('common.loading')}
    </div>
  )

  if (error || !news) return (
    <div className="empty-state detail-missing">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p className="empty-state-title">{t('news.notFound')}</p>
      <p className="empty-state-hint">{t('news.notFoundHint')}</p>
      <button type="button" onClick={() => navigate('/news')} className="btn btn-primary detail-missing__btn">
        {t('news.backArrow')}
      </button>
    </div>
  )

  return (
    <div className="fade-up">

      {/* Hero: orqaga + meta + sarlavha (spec 6.11 — umumiy hero foni) */}
      <section className="detail-hero">
        <div className="container detail-wrap">
          <button type="button" onClick={() => navigate('/news')} className="back-link">
            <ChevronLeft />
            {t('news.back')}
          </button>

          <div className="detail-meta">
            {news.category && (
              <span className="news-card-cat detail-cat" style={{ '--cat': getCategoryToken(news.category) }}>
                <span className="cat-dot" aria-hidden="true" />
                {getCategoryLabel(news.category, t)}
              </span>
            )}
            <span className="detail-date">
              {new Date(news.createdAt).toLocaleDateString(t('meta.dateLocale'), {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            <span className="detail-views">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {t('news.views', { count: news.views })}
            </span>
          </div>

          <h1 lang="uz" className="detail-title">{news.title}</h1>
          <ContentLangNote />
        </div>
      </section>

      {/* Maqola */}
      <section className="section detail-body">
        <div className="container detail-wrap">
          <ImageCarousel imgs={parseImages(news.image)} title={news.title} />

          {news.content ? (
            <div lang="uz" className="detail-content">{news.content}</div>
          ) : (
            <p className="detail-empty">{t('news.noContent')}</p>
          )}

          <div className="detail-foot">
            <button type="button" onClick={() => navigate('/news')} className="btn btn-primary back-btn">
              <ChevronLeft />
              {t('news.back')}
            </button>
            <a href={config.telegram.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              {config.telegram.username}
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
