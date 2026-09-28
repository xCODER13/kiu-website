import { useEffect, useRef, useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { getCategoryColor, getCategoryLabel } from '../../utils/newsCategories'
import { parseImages, navBtnStyle } from './utils'

// Home uchun ixchamlashtirilgan yangiliklar karuseli — Home.jsx'dan
// o'zgarishsiz ko'chirilgan.
export default function HomeNewsCarousel({ items }) {
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
  const catColor = getCategoryColor(item.category)
  const img = parseImages(item.image)[0]

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative', width: '100%', height: 380, borderRadius: 20,
        overflow: 'hidden', background: '#13102b',
        animation: 'homeSectionFadeIn .4s ease both',
      }}
    >
      <div key={idx} style={{
        position: 'absolute', inset: 0,
        backgroundImage: img ? `url(${img})` : 'linear-gradient(135deg,#1e1545,#13102b 60%,#0d0b1e)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        animation: 'homeCarouselFade .5s ease',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.88), rgba(0,0,0,.25) 55%, rgba(0,0,0,.1))' }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {item.category && (
          <span style={{ alignSelf: 'flex-start', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#fff', background: catColor, padding: '3px 11px', borderRadius: 20 }}>
            {getCategoryLabel(item.category)}
          </span>
        )}
        <h3 style={{ fontSize: 'clamp(1.1rem, 2.6vw, 1.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.3, maxWidth: 560 }}>
          {item.title}
        </h3>
        <NavLink to={`/news/${item._id}`} style={{ marginTop: 6, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', padding: '7px 16px', borderRadius: 8, backdropFilter: 'blur(6px)', textDecoration: 'none' }}>
          Batafsil
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </NavLink>
      </div>

      {items.length > 1 && (
        <>
          <button onClick={prev} aria-label="Oldingi" style={navBtnStyle('left')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={next} aria-label="Keyingi" style={navBtnStyle('right')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', gap: 6 }}>
            {items.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`${i + 1}-yangilik`}
                style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 10, border: 'none', padding: 0, cursor: 'pointer', background: i === idx ? '#fff' : 'rgba(255,255,255,.35)', transition: 'all .25s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}