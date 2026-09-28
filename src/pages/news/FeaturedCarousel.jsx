import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoryColor, getCategoryLabel } from '../../utils/newsCategories'
import { parseImages } from './utils'

// ── FEATURED CAROUSEL ── (News.jsx'dan o'zgarishsiz ko'chirilgan)
export default function FeaturedCarousel({ items }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
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
  const catColor = getCategoryColor(item.category)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 480,
        overflow: 'hidden',
        background: '#13102b',
        borderRadius: 20,
        margin: '1.5rem 0',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div
        key={idx}
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: parseImages(item.image)[0]
            ? `url(${parseImages(item.image)[0]})`
            : `linear-gradient(135deg, #1e1545 0%, #13102b 60%, #0d0b1e 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'carouselFadeIn .6s ease',
          transition: 'background .4s ease',
        }}
      />

      {/* Overlay gradients */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.4) 50%, rgba(0,0,0,.15) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${catColor}40, transparent 65%)` }} />

      {/* Slide counter top-right */}
      <div style={{
        position: 'absolute', top: 24, right: 24,
        fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)',
        letterSpacing: '.1em', fontFamily: 'var(--font-body)',
      }}>
        {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
      </div>

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '2.5rem 3rem',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Category badge */}
        {item.category && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
              color: '#fff', textTransform: 'uppercase',
              background: catColor,
              padding: '4px 12px', borderRadius: 20,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,.7)', display: 'inline-block' }} />
              {getCategoryLabel(item.category)}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-body)' }}>
              {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 style={{
          fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
          fontWeight: 800, color: '#fff', lineHeight: 1.3,
          fontFamily: 'var(--font-body)', maxWidth: 700,
          textShadow: '0 2px 20px rgba(0,0,0,.5)',
        }}>
          {item.title}
        </h2>

        {/* Excerpt */}
        {item.content && (
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,.7)',
            lineHeight: 1.6, maxWidth: 560,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {item.content}
          </p>
        )}

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {item.views}
          </span>
          <button
            onClick={() => navigate(`/news/${item._id}`)}
            style={{
              padding: '7px 18px',
              background: 'rgba(255,255,255,.15)',
              border: '1px solid rgba(255,255,255,.3)',
              borderRadius: 8, color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              backdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-body)',
              transition: 'background .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
          >
            Batafsil →
          </button>
        </div>
      </div>

      {/* Prev / Next buttons */}
      {items.length > 1 && (<>
        <button onClick={prev} style={{
          position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
          width: 42, height: 42, borderRadius: '50%',
          background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', transition: 'background .2s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={next} style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          width: 42, height: 42, borderRadius: '50%',
          background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', transition: 'background .2s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 24, right: 28, display: 'flex', gap: 6 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 24 : 6, height: 6, borderRadius: 10, padding: 0,
              background: i === idx ? '#fff' : 'rgba(255,255,255,.3)',
              border: 'none', cursor: 'pointer', transition: 'all .3s ease',
            }} />
          ))}
        </div>
      </>)}

      <style>{`@keyframes carouselFadeIn { from { opacity: 0; transform: scale(1.02) } to { opacity: 1; transform: scale(1) } }`}</style>
    </div>
  )
}