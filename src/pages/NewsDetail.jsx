import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function parseImages(imageField) {
  if (!imageField) return []
  try {
    const parsed = JSON.parse(imageField)
    if (Array.isArray(parsed)) return parsed
  } catch { return [imageField] }
  return [imageField]
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
          {news.image && (() => {
            const imgs = parseImages(news.image)
            if (!imgs.length) return null
            if (imgs.length === 1) return (
              <div style={{ marginBottom: '2rem', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.1)' }}>
                <img src={imgs[0]} alt={news.title} style={{ width: '100%', maxHeight: 500, objectFit: 'cover', display: 'block' }} onError={e => e.target.parentElement.style.display='none'} />
              </div>
            )
            // Ko'p rasm: birinchisi katta, qolganlari grid
            return (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.1)', marginBottom: 8 }}>
                  <img src={imgs[0]} alt={news.title} style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }} onError={e => e.target.parentElement.style.display='none'} />
                </div>
                {imgs.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(imgs.length - 1, 4)}, 1fr)`, gap: 8 }}>
                    {imgs.slice(1).map((src, i) => (
                      <div key={i} style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img src={src} alt={`${news.title} ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.parentElement.style.display='none'} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

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