import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function parseImages(imageField) {
  if (!imageField) return []
  try {
    const parsed = JSON.parse(imageField)
    if (Array.isArray(parsed)) return parsed
  } catch { return [imageField] }
  return [imageField]
}

function ImageCarousel({ imgs, title }) {
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
    <div style={{ marginBottom: '2rem', borderRadius: 16, overflow: 'hidden' }}>
      <img src={imgs[0]} alt={title} style={{ width: '100%', maxHeight: 500, objectFit: 'cover', display: 'block' }} onError={e => e.target.parentElement.style.display='none'} />
    </div>
  )

  return (
    <div style={{ marginBottom: '2rem', borderRadius: 16, overflow: 'hidden', position: 'relative', background: '#000', userSelect: 'none' }}
         onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      <div style={{ position: 'relative', width: '100%', height: 'auto', overflow: 'hidden' }}>
        <img
          key={cur}
          src={imgs[cur]}
          alt={`${title} ${cur + 1}`}
          style={{
            width: '100%', maxHeight: 520, objectFit: 'cover', display: 'block',
            animation: anim ? `slide-${dir > 0 ? 'in-right' : 'in-left'} 0.28s ease` : 'none',
          }}
          onError={e => e.target.style.opacity = '0.3'}
        />

        <style>{`
          @keyframes slide-in-right { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes slide-in-left  { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `}</style>

        {/* Counter */}
        <div style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(0,0,0,.45)', color: '#fff', fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
          {cur + 1} / {imgs.length}
        </div>

        {/* Arrows */}
        <button onClick={prev} aria-label="Oldingi rasm" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.45)', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background .15s' }}
          onMouseEnter={e => e.target.style.background='rgba(0,0,0,.7)'} onMouseLeave={e => e.target.style.background='rgba(0,0,0,.45)'}>‹</button>
        <button onClick={next} aria-label="Keyingi rasm" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.45)', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background .15s' }}
          onMouseEnter={e => e.target.style.background='rgba(0,0,0,.7)'} onMouseLeave={e => e.target.style.background='rgba(0,0,0,.45)'}>›</button>
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {imgs.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`${i + 1}-rasm`}
            style={{ width: i === cur ? 22 : 8, height: 8, borderRadius: 4, border: 'none', background: i === cur ? '#fff' : 'rgba(255,255,255,.45)', cursor: 'pointer', padding: 0, transition: 'all .25s' }} />
        ))}
      </div>
    </div>
  )
}



const API = import.meta.env.VITE_API_URL

const CAT_COLORS = {
  umumiy:    '#d7bb04',
  talim:     '#0ea5e9',
  sport:     '#16a34a',
  madaniyat: '#dc2626',
  xalqaro:   '#d97706',
  fan:       '#0891b2',
}

const CAT_LABELS = {
  umumiy: 'Umumiy', talim: "Ta'lim", sport: 'Sport',
  madaniyat: 'Madaniyat', xalqaro: 'Xalqaro', fan: 'Fan',
}

export default function NewsDetail() {
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
        document.title = `${data.title} — Qarshi Xalqaro Universiteti | KIU`
        // Ko'rishlar sonini oshirish
        await fetch(`${API}/api/news/${id}/view`, { method: 'PUT' })
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
    return () => { document.title = 'Qarshi Xalqaro Universiteti | KIU' }
  }, [id])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--muted)' }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--border)', borderTopColor: '#7c3aed',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        margin: '0 auto 14px',
      }} />
      <p style={{ fontSize: 14 }}>Yuklanmoqda...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error || !news) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--muted)' }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
        style={{ opacity: .3, marginBottom: 16 }}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p style={{ fontSize: 15, marginBottom: 20 }}>Yangilik topilmadi</p>
      <button onClick={() => navigate('/news')} style={{
        padding: '9px 22px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
        color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
      }}>
        ← Yangiliklarga qaytish
      </button>
    </div>
  )

  const catColor = CAT_COLORS[news.category] || '#7c3aed'

  return (
    <div className="fade-up">

      {/* Hero */}
      <section style={{
        padding: '2.5rem 2rem 1.5rem',
        background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <button
            onClick={() => navigate('/news')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#7c3aed', fontSize: 13, fontWeight: 600,
              padding: 0, fontFamily: 'var(--font-body)', transition: 'opacity .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Yangiliklarga qaytish
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
            {news.category && (
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
                color: catColor, background: `${catColor}18`,
                padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase',
              }}>
                {CAT_LABELS[news.category] || news.category}
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {new Date(news.createdAt).toLocaleDateString('uz-UZ', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {news.views} ko'rish
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
            fontWeight: 800, color: 'var(--text)',
            lineHeight: 1.3, marginBottom: '1.75rem',
            fontFamily: 'var(--font-body)',
          }}>
            {news.title}
          </h1>

          {/* Images */}
          <ImageCarousel imgs={parseImages(news.image)} title={news.title} />

          {/* Body text */}
          {news.content ? (
            <div style={{
              fontSize: 15.5, color: 'var(--text)', lineHeight: 1.85,
              fontFamily: 'var(--font-body)', whiteSpace: 'pre-wrap',
            }}>
              {news.content}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--muted)', fontStyle: 'italic' }}>
              Matn kiritilmagan.
            </p>
          )}

          {/* Footer */}
          <div style={{
            marginTop: '3rem', paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'flex-start',
          }}>
            <button
              onClick={() => navigate('/news')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 22px', borderRadius: 10,
                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                transition: 'opacity .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Yangiliklarga qaytish
            </button>
          </div>

        </div>
      </section>

    </div>
  )
}