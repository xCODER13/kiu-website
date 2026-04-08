import { NavLink } from 'react-router-dom'
import { useEffect} from 'react'
import TelegramPanel from '../components/TelegramPanel'
import config from '../config'
import useReveal from '../hooks/useReveal'


export default function Home() {

  useReveal()

  
    

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

     {/* ── Biz haqimizda ── */}
<section className="section">
  <div className="container">
    <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
      {/* Chap — matn */}
      <div>
        <div className="reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
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
          <NavLink to="/teachers">
            <button className="btn btn-secondary">O'qituvchilar</button>
          </NavLink>
        </div>
      </div>

      {/* O'ng — afzalliklar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, title: "Grant asosida o'qish", desc: "Rektor va ta'sischilar stipendiyasi mavjud" },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: "Xalqaro hamkorlik", desc: "6+ xorijiy universitetlar bilan aloqa" },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: "Bepul avtobus xizmati", desc: "Talabalar uchun transport kafolatlangan" },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: "Zamonaviy yotoqxona", desc: "Qulay va arzon talabalar turar joyi" },
        ].map((item, i) => (
          <div key={i} className={`card reveal reveal-delay-${i + 1}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '1rem 1.25rem' }}>
            <div className="fac-icon" style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.desc}</div>
            </div>
          </div>
        ))}
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

