import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import TelegramPanel from '../components/TelegramPanel'
import config from '../config'
import useReveal from '../hooks/useReveal'


export default function Home() {
  const [news, setNews] = useState([])

  useReveal()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/news`)
      .then(r => r.json())
      .then(data => setNews(data.slice(0, 4)))
      .catch(err => console.log(err))
  }, [])

  useEffect(() => {
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
    })
  }, [])

  return (
    <div className="fade-up">
      <section style={{ padding: '5rem 2rem 4rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04, backgroundImage: 'radial-gradient(#7c3aed 1px, transparent 1px)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: '#7c3aed', opacity: 0.06, top: -100, left: -80, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: '#4f46e5', opacity: 0.06, bottom: -50, right: -40, pointerEvents: 'none' }} />

        {/* Floating icons */}
        <div style={{ position: 'absolute', left: '4%', top: '12%', opacity: 0.12, animation: 'floatIcon 7s ease-in-out infinite', pointerEvents: 'none' }}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none"><rect x="8" y="5" width="26" height="36" rx="3" fill="#7c3aed"/><rect x="10" y="7" width="22" height="32" rx="2" fill="#9b59b6"/><rect x="14" y="14" width="14" height="2" rx="1" fill="#fff" opacity=".6"/><rect x="14" y="19" width="14" height="2" rx="1" fill="#fff" opacity=".6"/><rect x="14" y="24" width="9" height="2" rx="1" fill="#fff" opacity=".6"/><rect x="34" y="5" width="4" height="36" rx="2" fill="#6d28d9"/></svg>
        </div>
        <div style={{ position: 'absolute', right: '5%', top: '18%', opacity: 0.12, animation: 'floatIcon 9s ease-in-out infinite 1s', pointerEvents: 'none' }}>
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><g transform="rotate(20,23,23)"><rect x="19" y="4" width="8" height="30" rx="2" fill="#7c3aed"/><polygon points="19,34 27,34 23,42" fill="#f59e0b"/><rect x="19" y="4" width="8" height="6" rx="2" fill="#4f46e5"/></g></svg>
        </div>
        <div style={{ position: 'absolute', left: '7%', bottom: '15%', opacity: 0.12, animation: 'floatIcon 11s ease-in-out infinite 2s', pointerEvents: 'none' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="21" cy="21" r="13" stroke="#7c3aed" strokeWidth="4" fill="none"/><circle cx="21" cy="21" r="8" fill="#ede9fe" opacity=".5"/><line x1="30" y1="30" x2="42" y2="42" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round"/></svg>
        </div>
        <div style={{ position: 'absolute', right: '8%', bottom: '20%', opacity: 0.12, animation: 'floatIcon 8s ease-in-out infinite 0.5s', pointerEvents: 'none' }}>
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><rect x="6" y="4" width="30" height="38" rx="3" fill="#4f46e5"/><rect x="6" y="4" width="6" height="38" rx="3" fill="#3730a3"/><rect x="16" y="13" width="14" height="2" rx="1" fill="#fff" opacity=".6"/><rect x="16" y="19" width="14" height="2" rx="1" fill="#fff" opacity=".6"/><rect x="16" y="25" width="9" height="2" rx="1" fill="#fff" opacity=".6"/></svg>
        </div>
        <div style={{ position: 'absolute', left: '44%', top: '6%', opacity: 0.12, animation: 'floatIcon 13s ease-in-out infinite 3s', pointerEvents: 'none' }}>
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none"><polygon points="19,3 22,13 32,13 24,19.5 27,30 19,24 11,30 14,19.5 6,13 16,13" fill="#7c3aed"/></svg>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="reveal hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.25)', padding: '5px 14px', borderRadius: 20, marginBottom: '1.5rem', border: '1px solid rgba(124,58,237,.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            {config.admission.year}–{parseInt(config.admission.year)+1} qabul ochiq
          </div>
          <h1 className="reveal reveal-delay-1" style={{ marginBottom: '.9rem', color: '#1a1a2e' }}>{config.university.name}</h1>
          <p className="reveal reveal-delay-2" style={{ fontSize: '0.9rem', color: 'var(--muted)', maxWidth: 460, margin: '0 auto 2rem', lineHeight: 1.75 }}>
            Xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish — Qashqadaryo qalbida.
          </p>
          <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <NavLink to="/admission"><button className="btn btn-primary">Qabul haqida</button></NavLink>
            <NavLink to="/faculty"><button className="btn btn-primary">Fakultetlar</button></NavLink>
          </div>
          <div className="stats-grid reveal reveal-delay-4">
            {config.stats.map((s, i) => (
              <div key={s.l} className="stat-item">
                <div id={`stat-${i}`} style={{ fontSize: '1.7rem', fontWeight: 700, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>0</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <h2>Yangiliklar va Telegram</h2>
            <p>KIU hayotidan so'nggi xabarlar va rasmiy kanal</p>
          </div>
          <div className="grid-2">
            <div>
              {news.map((n, i) => (
                <div key={n.id} className={`reveal reveal-delay-${i + 1}`} style={{ padding: '.85rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>{new Date(n.createdAt).toLocaleDateString('uz-UZ')}</span>
                  <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{n.title}</p>
                </div>
              ))}
              <NavLink to="/news" style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', paddingTop: '.75rem', display: 'inline-block' }}>
                Barcha yangiliklar →
              </NavLink>
            </div>
            <div className="reveal reveal-delay-2">
              <TelegramPanel />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes floatIcon {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-16px) rotate(8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

