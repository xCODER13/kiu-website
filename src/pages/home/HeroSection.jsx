import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import config from '../../config'

// config.stats tartibi bilan mos: label matnlari i18n'da (home.stats.<kalit>)
const STAT_KEYS = ['students', 'teachers', 'programs', 'founded']

// "HERO" bo'limi — Home.jsx'dan o'zgarishsiz ko'chirilgan.
// stat-${i} id'lari orkestrator (Home.jsx)dagi useEffect statistika
// hisoblagichi tomonidan document.getElementById orqali topiladi.
export default function HeroSection() {
  const { t } = useTranslation()
  return (
    <section style={{ padding: '4.5rem 2rem 4rem', background: 'var(--gradient-hero)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04, backgroundImage: 'radial-gradient(var(--color-brand) 1px, transparent 1px)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-grid">

          {/* Chap — matn */}
          <div>
            <div className="reveal hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-brand)', background: 'color-mix(in srgb, var(--color-brand) 14%, transparent)', padding: '5px 14px', borderRadius: 20, marginBottom: '1.25rem', border: '1px solid color-mix(in srgb, var(--color-brand) 20%, transparent)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              {t('home.hero.badge', { from: config.admission.year, to: parseInt(config.admission.year) + 1 })}
            </div>
            <h1 className="reveal reveal-delay-1" style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>{t('university.name')}</h1>
            <p className="reveal reveal-delay-2" style={{ fontSize: '0.95rem', color: 'var(--muted)', maxWidth: 460, marginBottom: '2rem', lineHeight: 1.75 }}>
              {t('home.hero.lead')}
            </p>
            <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '2.25rem' }}>
              <NavLink to="/admission"><button className="btn btn-primary">{t('home.hero.ctaAdmission')}</button></NavLink>
              <NavLink to="/faculty"><button className="btn btn-secondary">{t('home.hero.ctaPrograms')}</button></NavLink>
            </div>
            <div className="stats-grid reveal reveal-delay-4">
              {config.stats.map((s, i) => (
                <div key={STAT_KEYS[i]} className="stat-item">
                  <div id={`stat-${i}`} style={{ fontSize: '1.5rem', fontWeight: 700, background: 'var(--gradient-brand-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>0</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t(`home.stats.${STAT_KEYS[i]}`)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* O'ng — kampus rasmi (3:2 aspect-ratio — bino to'liq ko'rinadi, kesilmaydi) */}
          <div className="reveal reveal-delay-2 hero-photo-wrap">
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'var(--color-brand)', opacity: 0.12, top: -30, right: -30, filter: 'blur(20px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 50px color-mix(in srgb, var(--color-brand) 22%, transparent)', border: '1px solid color-mix(in srgb, var(--color-brand) 15%, transparent)', aspectRatio: '3 / 2' }}>
              <img
                src="/gallery/Asosiy-kampus.png"
                alt={t('home.hero.photoAlt')}
                loading="eager"
                fetchPriority="high"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(26,26,46,.75)', backdropFilter: 'blur(6px)', color: 'var(--color-on-brand)', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                {t('home.hero.campus1')}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}