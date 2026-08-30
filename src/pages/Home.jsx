import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import config from '../config'
import useReveal from '../hooks/useReveal'
import useApi from '../hooks/useApi'

const API = import.meta.env.VITE_API_URL

// News.jsx bilan bir xil mantiq — rasm maydonidan URL massivini olish
function parseImages(imageField) {
  if (!imageField) return []
  try {
    const parsed = JSON.parse(imageField)
    if (Array.isArray(parsed)) return parsed
  } catch {
    return [imageField]
  }
  return [imageField]
}

const CAT_COLORS = {
  umumiy: '#d7bb04', "ta'lim": '#0ea5e9', sport: '#16a34a',
  madaniyat: '#dc2626', xalqaro: '#d97706', fan: '#0891b2',
}
const CAT_LABELS = {
  umumiy: 'Umumiy', "ta'lim": "Ta'lim", sport: 'Sport',
  madaniyat: 'Madaniyat', xalqaro: 'Xalqaro', fan: 'Fan',
}

const navBtnStyle = (side) => ({
  position: 'absolute', [side]: 14, top: '50%', transform: 'translateY(-50%)',
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.25)',
  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(6px)',
})

// ── Home uchun ixchamlashtirilgan yangiliklar karuseli ──
function HomeNewsCarousel({ items }) {
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
  const catColor = CAT_COLORS[item.category] || '#7c3aed'
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
            {CAT_LABELS[item.category] || item.category}
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

// ── Home uchun ixcham yangilik kartasi ──
function HomeNewsCard({ item, index }) {
  const catColor = CAT_COLORS[item.category] || '#7c3aed'
  const img = parseImages(item.image)[0]
  return (
    <NavLink to={`/news/${item._id}`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{ padding: 0, overflow: 'hidden', height: '100%', animation: `homeSectionFadeIn .4s ease ${index * 0.06}s both` }}
      >
        {img
          ? <img src={img} alt={item.title} loading="lazy" style={{ width: '100%', height: 140, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
          : <div style={{ width: '100%', height: 140, background: `linear-gradient(135deg, ${catColor}22, ${catColor}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={`${catColor}66`} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
        }
        <div style={{ padding: '0.85rem 1rem' }}>
          {item.category && (
            <span style={{ fontSize: 10, fontWeight: 600, color: catColor, background: `${catColor}18`, padding: '2px 8px', borderRadius: 20 }}>
              {CAT_LABELS[item.category] || item.category}
            </span>
          )}
          <h4 style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.title}
          </h4>
          <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 6 }}>
            {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
          </div>
        </div>
      </div>
    </NavLink>
  )
}

export default function Home() {
  useReveal()

  const { data: newsData, loading: newsLoading, error: newsError } = useApi(`${API}/api/news`, [])
  const articles = newsData.filter(n => !n.videoId)
  const featured = articles.slice(0, 5)
  const latest4 = articles.slice(0, 4)

  useEffect(() => {
    const timers = []
    const targets = config.stats.map((s, i) => ({
      el: document.getElementById(`stat-${i}`),
      target: parseInt(s.n.replace(/\D/g, '')),
      suffix: s.n.replace(/[0-9]/g, ''),
    }))
    targets.forEach(({ el, target, suffix }) => {
      if (!el) return
      let current = 0
      const step = Math.ceil(target / 60)
      const timer = setInterval(() => {
        current += step
        if (current >= target) { current = target; clearInterval(timer) }
        el.textContent = current + suffix
      }, 30)
      timers.push(timer)
    })
    return () => timers.forEach(clearInterval)
  }, [])

  return (
    <div className="fade-up">

      {/* ── HERO ── */}
      <section style={{ padding: '4.5rem 2rem 4rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04, backgroundImage: 'radial-gradient(#7c3aed 1px, transparent 1px)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '2.5rem', alignItems: 'center' }}>

            {/* Chap — matn */}
            <div>
              <div className="reveal hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.14)', padding: '5px 14px', borderRadius: 20, marginBottom: '1.25rem', border: '1px solid rgba(124,58,237,.2)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                {config.admission.year}–{parseInt(config.admission.year) + 1} qabul ochiq
              </div>
              <h1 className="reveal reveal-delay-1" style={{ marginBottom: '1rem', color: '#1a1a2e' }}>{config.university.name}</h1>
              <p className="reveal reveal-delay-2" style={{ fontSize: '0.95rem', color: 'var(--muted)', maxWidth: 460, marginBottom: '2rem', lineHeight: 1.75 }}>
                Xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish — Qashqadaryo qalbida.
              </p>
              <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '2.25rem' }}>
                <NavLink to="/admission"><button className="btn btn-primary">Qabul haqida</button></NavLink>
                <NavLink to="/faculty"><button className="btn btn-secondary">Yo'nalishlar</button></NavLink>
              </div>
              <div className="stats-grid reveal reveal-delay-4" style={{ margin: 0, maxWidth: 480 }}>
                {config.stats.map((s, i) => (
                  <div key={s.l} className="stat-item">
                    <div id={`stat-${i}`} style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>0</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* O'ng — kampus rasmi (3:2 aspect-ratio — bino to'liq ko'rinadi, kesilmaydi) */}
            <div className="reveal reveal-delay-2 hero-photo-wrap" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: '#7c3aed', opacity: 0.12, top: -30, right: -30, filter: 'blur(20px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 50px rgba(124,58,237,.22)', border: '1px solid rgba(124,58,237,.15)', aspectRatio: '3 / 2' }}>
                <img
                  src="/gallery/Asosiy-kampus.png"
                  alt="KIU bosh bino"
                  loading="eager"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(26,26,46,.75)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  1-kampus — bosh bino
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Biz haqimizda ── */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            {/* Chap — matn */}
            <div>
              <div className="reveal section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
                2022 yildan buyon
              </div>
              <h2 className="reveal reveal-delay-1" style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '1rem' }}>
                Qarshi Xalqaro Universiteti haqida
              </h2>
              <p className="reveal reveal-delay-2" style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                Qarshi Xalqaro Universiteti (KIU) 2022-yilda Qashqadaryo viloyati Qarshi shahrida tashkil topgan. O'zbekiston Respublikasidagi zamonaviy oliy ta'lim markazlaridan biri.
              </p>
              <p className="reveal reveal-delay-3" style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                Bizning maqsad — talabalarga sifatli ta'lim va soft skills berib, ularni hayotga tayyorlash. Xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish imkoniyatlarini yaratish.
              </p>
              <div className="reveal reveal-delay-4" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <NavLink to="/about">
                  <button className="btn btn-primary">Batafsil ma'lumot</button>
                </NavLink>
              </div>
            </div>

            {/* O'ng — 2-kampus rasmi (xuddi shu aspect-ratio tuzatmasi bilan) */}
            <div className="reveal reveal-delay-2" style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,.1)', aspectRatio: '3 / 2' }}>
              <img
                src="/gallery/2-kampus.png"
                alt="KIU 2-kampus"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(26,26,46,.75)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                2-kampus
              </div>
            </div>
          </div>

          {/* Afzalliklar — to'liq kenglikda gorizontal qator */}
          <div className="reveal reveal-delay-3 grid-auto" style={{ marginTop: '2.5rem' }}>
            {[
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, title: "Grant asosida o'qish", desc: "Rektor va ta'sischilar stipendiyasi mavjud" },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: "Xalqaro hamkorlik", desc: "6+ xorijiy universitetlar bilan aloqa" },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: "Bepul avtobus xizmati", desc: "Talabalar uchun transport kafolatlangan" },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: "Zamonaviy yotoqxona", desc: "Qulay va arzon talabalar turar joyi" },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <div className="fac-icon" style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#7c3aed' }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Yangiliklar ── */}
      <section className="section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="reveal section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
              Yangiliklar
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '.5rem' }}>So'nggi yangiliklar</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU hayotidan so'nggi xabarlar</p>
          </div>

          {newsLoading ? (
            // ── Yuklanmoqda: skeleton — layout sakramasligi uchun ──
            <>
              <div style={{
                width: '100%', height: 380, borderRadius: 20,
                background: 'linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%)',
                backgroundSize: '200% 100%', animation: 'homeSkelShimmer 1.4s ease-in-out infinite',
                marginBottom: '1.75rem',
              }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{
                    height: 220, borderRadius: 14,
                    background: 'linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%)',
                    backgroundSize: '200% 100%', animation: `homeSkelShimmer 1.4s ease-in-out infinite ${i * 0.1}s`,
                  }} />
                ))}
              </div>
            </>
          ) : articles.length > 0 ? (
            // ── Muvaffaqiyatli yuklandi ──
            <>
              <div style={{ marginBottom: '1.75rem' }}>
                <HomeNewsCarousel items={featured} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {latest4.map((n, i) => <HomeNewsCard key={n._id} item={n} index={i} />)}
              </div>
            </>
          ) : (
            // ── Xato yoki bo'sh natija ──
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 14 }}>
              {newsError ? "Yangiliklar serveriga ulanib bo'lmadi." : "Hozircha yangiliklar yo'q."}
            </div>
          )}

          <div className="reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <NavLink to="/news"><button className="btn btn-primary">Barcha yangiliklar</button></NavLink>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes homeCarouselFade { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
        @keyframes homeSkelShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes homeSectionFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 1080px) {
          .hero-grid .stats-grid { grid-template-columns: repeat(2, 1fr) !important; max-width: 320px !important; }
        }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-photo-wrap { order: -1; }
        }
      `}</style>
    </div>
  )
}