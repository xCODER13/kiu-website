import { NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import TelegramPanel from '../components/TelegramPanel'
import config from '../config'
import useReveal from '../hooks/useReveal'
import useApi from '../hooks/useApi'
import { BAKALAVR, IC } from '../data/facultyData'
import { AWARDS } from '../data/achievementsData'
import { PARTNERS } from '../data/internationalData'
import { DOCS } from '../data/documentsData'

const API = import.meta.env.VITE_API_URL

// Yangiliklar rasm maydonini o'qish (News.jsx dagi parseImages bilan bir xil mantiq)
function parseNewsImage(imageField) {
  if (!imageField) return null
  try {
    const parsed = JSON.parse(imageField)
    return Array.isArray(parsed) ? parsed[0] : imageField
  } catch {
    return imageField
  }
}

export default function Home({ onApply }) {

  useReveal()
  const location = useLocation()

  const { data: newsData } = useApi(`${API}/api/news`, [])
  const latestNews = newsData.filter(n => !n.videoId).slice(0, 3)

  // Navbardan boshqa sahifadan Home'ga o'tib, bo'limga scroll qilish uchun
  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo)
      if (el) {
        // Sahifa render bo'lishini biroz kutamiz (rasmlar/kartalar joylashishi uchun)
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }))
      }
      window.history.replaceState({}, '')
    }
  }, [location.state])

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
            <NavLink to="/faculty"><button className="btn btn-primary">Yo'nalishlar</button></NavLink>
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
<section id="about-section" className="section anchor-section">
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

      {/* ── Yo'nalishlar (Faculty preview) ── */}
      <section id="faculty-section" className="section anchor-section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="reveal section-header" style={{ textAlign: 'center' }}>
            <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
              {config.stats.find(s => s.l === "Yo'nalish")?.n || BAKALAVR.length}+ yo'nalish
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Bakalavriat yo'nalishlari</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>Zamonaviy va bozor talabiga mos ta'lim yo'nalishlari</p>
          </div>
          <div className="grid-auto" style={{ marginTop: '2rem' }}>
            {BAKALAVR.slice(0, 4).map((f, i) => (
              <div key={f.name} className={`card reveal reveal-delay-${i + 1}`}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: f.color }}>
                  {IC[f.icon]?.(20)}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 4 }}>{f.name}</h3>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{f.duration} · {f.studyForm}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <NavLink to="/faculty"><button className="btn btn-primary">Barcha yo'nalishlar</button></NavLink>
          </div>
        </div>
      </section>

      {/* ── Qabul (Admission preview) ── */}
      <section id="admission-section" className="section anchor-section">
        <div className="container">
          <div className="reveal" style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: 16, padding: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#c4b5fd', marginBottom: 8 }}>
                Qabul — {config.admission.year}
              </div>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '.35rem' }}>Hujjatlar qabul qilinmoqda</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>Muddati: {config.admission.deadline}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={onApply} className="btn btn-primary">Ariza topshirish</button>
              <NavLink to="/admission">
                <button className="btn btn-primary" style={{ background: 'rgba(255,255,255,.12)', boxShadow: 'none' }}>Batafsil</button>
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── Yangiliklar (News preview) ── */}
      <section id="news-section" className="section anchor-section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="reveal section-header" style={{ textAlign: 'center' }}>
            <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
              Yangiliklar
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '.5rem' }}>KIU hayotidan so'nggi xabarlar</h2>
          </div>
          {latestNews.length > 0 ? (
            <div className="grid-auto" style={{ marginTop: '2rem' }}>
              {latestNews.map((n, i) => (
                <NavLink key={n._id} to={`/news/${n._id}`} className={`card reveal reveal-delay-${i + 1}`} style={{ padding: 0, overflow: 'hidden', display: 'block' }}>
                  {parseNewsImage(n.image)
                    ? <img src={parseNewsImage(n.image)} alt={n.title} style={{ width: '100%', height: 130, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                    : <div style={{ width: '100%', height: 130, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)' }} />
                  }
                  <div style={{ padding: '1rem' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(n.createdAt).toLocaleDateString('uz-UZ')}</span>
                    <h3 style={{ fontSize: 13, fontWeight: 600, marginTop: 4, lineHeight: 1.5, fontFamily: 'var(--font-body)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.title}</h3>
                  </div>
                </NavLink>
              ))}
            </div>
          ) : (
            <p className="reveal" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: '1.5rem' }}>Yangiliklar tez orada e'lon qilinadi.</p>
          )}
          <div className="reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <NavLink to="/news"><button className="btn btn-primary">Barcha yangiliklar</button></NavLink>
          </div>
        </div>
      </section>

      {/* ── Yutuqlar (Achievements preview) ── */}
      <section id="achievements-section" className="section anchor-section">
        <div className="container">
          <div className="reveal section-header" style={{ textAlign: 'center' }}>
            <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
              Yutuqlar
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Yutuqlar va mukofotlar</h2>
          </div>
          <div className="grid-auto" style={{ marginTop: '2rem' }}>
            {AWARDS.slice(0, 4).map((a, i) => (
              <div key={a.id} className={`card reveal reveal-delay-${i + 1}`} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#7c3aed' }}>
                  {a.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 9px', borderRadius: 20, display: 'inline-block', marginBottom: 6 }}>{a.year}</span>
                <h3 style={{ fontSize: 12, fontWeight: 600, marginBottom: 3, fontFamily: 'var(--font-body)' }}>{a.title}</h3>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <NavLink to="/achievements"><button className="btn btn-primary">Barcha yutuqlar</button></NavLink>
          </div>
        </div>
      </section>

      {/* ── Xalqaro hamkorlik (International preview) ── */}
      <section id="international-section" className="section anchor-section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="reveal section-header" style={{ textAlign: 'center' }}>
            <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
              {PARTNERS.length}+ xalqaro hamkor
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Xalqaro hamkorlik</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>Xorijiy universitetlar bilan akademik almashinuv dasturlari</p>
          </div>
          <div className="grid-auto" style={{ marginTop: '2rem' }}>
            {PARTNERS.slice(0, 4).map((p, i) => (
              <div key={p.name} className={`card reveal reveal-delay-${i + 1}`}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', marginBottom: 6 }}>{p.country}</div>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-body)' }}>{p.name}</h3>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{p.type}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <NavLink to="/international"><button className="btn btn-primary">Barcha hamkorlar</button></NavLink>
          </div>
        </div>
      </section>

      {/* ── Normativ hujjatlar (Documents preview) ── */}
      <section id="documents-section" className="section anchor-section">
        <div className="container">
          <div className="reveal section-header" style={{ textAlign: 'center' }}>
            <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
              Shaffoflik
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Normativ hujjatlar</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>Litsenziya, akkreditatsiya va boshqa rasmiy hujjatlar</p>
          </div>
          <div className="grid-auto" style={{ marginTop: '2rem' }}>
            {DOCS.slice(0, 3).map((d, i) => (
              <a key={d.title} href={d.url} target="_blank" rel="noreferrer" className={`card reveal reveal-delay-${i + 1}`} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
                  {d.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{d.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{d.desc}</div>
                </div>
              </a>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <NavLink to="/documents"><button className="btn btn-primary">Barcha hujjatlar</button></NavLink>
          </div>
        </div>
      </section>

      {/* ── Bog'lanish (Contact preview) ── */}
      <section id="contact-section" className="section anchor-section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="reveal section-header" style={{ textAlign: 'center' }}>
            <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
              Bog'lanish
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Biz bilan aloqada bo'ling</h2>
          </div>
          <div className="grid-2" style={{ marginTop: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: '1-kampus manzili', text: config.contact.address1 },
                { title: 'Telefon', text: config.contact.phone },
                { title: 'Email', text: config.contact.email },
              ].map((item, i) => (
                <div key={item.title} className={`card reveal reveal-delay-${i + 1}`}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.text}</div>
                </div>
              ))}
              <NavLink to="/contact" style={{ marginTop: 6, alignSelf: 'flex-start' }}>
                <button className="btn btn-primary">To'liq ma'lumot</button>
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

