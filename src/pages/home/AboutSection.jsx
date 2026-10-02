import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'

// "Biz haqimizda" bo'limi — Home.jsx'dan o'zgarishsiz ko'chirilgan
// (matn + kampus rasmi + afzalliklar qatori). Afzalliklar ro'yxati asl
// faylda ham shu joyning o'zida inline massiv sifatida e'lon qilingan edi.
export default function AboutSection() {
  const { t } = useTranslation()
  return (
    <section className="section">
      <div className="container">
        <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
          {/* Chap — matn */}
          <div>
            <div className="reveal section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-brand)', background: 'color-mix(in srgb, var(--color-brand) 10%, transparent)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid color-mix(in srgb, var(--color-brand) 20%, transparent)' }}>
              {t('home.about.badge')}
            </div>
            <h2 className="reveal reveal-delay-1" style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '1rem' }}>
              {t('home.about.title')}
            </h2>
            <p className="reveal reveal-delay-2" style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
              {t('home.about.p1')}
            </p>
            <p className="reveal reveal-delay-3" style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              {t('home.about.p2')}
            </p>
            <div className="reveal reveal-delay-4" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <NavLink to="/about">
                <button className="btn btn-primary">{t('home.about.more')}</button>
              </NavLink>
            </div>
          </div>

          {/* O'ng — 2-kampus rasmi (xuddi shu aspect-ratio tuzatmasi bilan) */}
          <div className="reveal reveal-delay-2" style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,.1)', aspectRatio: '3 / 2' }}>
            <img
              src="/gallery/2-kampus.png"
              alt={t('home.about.campus2Alt')}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(26,26,46,.75)', backdropFilter: 'blur(6px)', color: 'var(--color-on-brand)', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              {t('home.about.campus2')}
            </div>
          </div>
        </div>

        {/* Afzalliklar — to'liq kenglikda gorizontal qator */}
        <div className="reveal reveal-delay-3 grid-auto" style={{ marginTop: '2.5rem' }}>
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, k: 'grant' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, k: 'international' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, k: 'bus' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, k: 'dorm' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div className="fac-icon" style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'var(--color-brand)' }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t(`home.about.features.${item.k}.title`)}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t(`home.about.features.${item.k}.desc`)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}