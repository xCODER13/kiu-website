import { useTranslation } from 'react-i18next'

export default function About() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'var(--gradient-hero)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-text)', marginBottom: '.5rem' }}>{t('about.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('about.subtitle')}</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ marginBottom: '3rem' }}>
            <div className="reveal">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text)' }}>{t('about.ourUniversity')}</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                {t('about.p1')}
              </p>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                {t('about.p2')}
              </p>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>
                {t('about.p3')}
              </p>
            </div>
            <div className="reveal reveal-delay-1">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { n: '6875', k: 'students', color: 'var(--color-brand)' },
                  { n: '151', k: 'teachers', color: 'var(--color-brand-hover)' },
                  { n: '10', k: 'programs', color: '#0088cc' },
                  { n: '8', k: 'awards', color: '#059669' },
                  { n: '2', k: 'grants', color: '#d97706' },
                  { n: '16', k: 'clubs', color: '#db2777' },
                ].map(s => (
                  <div key={s.k} style={{ padding: '1.25rem', borderRadius: 12, background: `color-mix(in srgb, ${s.color} 6.27%, transparent)`, border: `1px solid color-mix(in srgb, ${s.color} 14.51%, transparent)`, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.n}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{t(`about.stats.${s.k}`)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal" style={{ background: 'var(--gradient-dark)', borderRadius: 16, padding: '2.5rem', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--color-on-brand)', fontSize: '1.3rem', marginBottom: '1rem' }}>{t('about.missionTitle')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8 }}>
              {t('about.missionText')}
            </p>
          </div>

          <h2 className="reveal" style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>{t('about.advantagesTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/></svg>,
               k: 'campus'
             },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
                k: 'grant'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
                k: 'bus'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
                k: 'dorm'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
                k: 'abroad'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                k: 'international'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                k: 'softSkills'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M17 11a4 4 0 1 0-3.995-4.2"/><path d="M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><path d="M17 13a4 4 0 0 1 4 4v4"/></svg>,
                k: 'creative'
              },
            ].map((item, i) => (
              <div key={i} className={`card reveal reveal-delay-${(i % 4) + 1}`} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="achieve-icon" style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-hero-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'var(--color-brand)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>{t(`about.advantages.${item.k}.title`)}</h3>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{t(`about.advantages.${item.k}.desc`)}</p>
              </div>
            ))}
          </div>

          <h2 className="reveal" style={{ fontSize: '1.4rem', margin: '2.5rem 0 1.5rem', color: 'var(--color-text)' }}>{t('about.leadershipTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { k: 'rector', hasInfo: true, color: 'var(--color-brand)' },
              { k: 'viceRector', color: '#08b310' },
              { k: 'financeDirector', hasInfo: true, color: '#0088cc' },
              { k: 'boardChair', hasInfo: true, color: '#059669' },
            ].map((p, i) => {
              // Avatar bosh harflari tarjima qilingan ismdan olinadi (Panjiyev Ulug'bek → PU, Панжиев Улугбек → ПУ)
              const name = t(`about.leaders.${p.k}.name`)
              const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
              return (
              <div key={i} className={`card reveal reveal-delay-${i + 1}`} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--color-on-brand)', fontSize: 18, fontWeight: 700 }}>{initials}</div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{name}</h3>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-brand)', background: 'color-mix(in srgb, var(--color-brand) 10%, transparent)', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 6 }}>{t(`about.leaders.${p.k}.role`)}</div>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{p.hasInfo ? t(`about.leaders.${p.k}.info`) : undefined}</p>
              </div>
              )
            })}
          </div>

          <h2 className="reveal" style={{ fontSize: '1.4rem', margin: '2.5rem 0 1.5rem', color: 'var(--color-text)' }}>{t('about.infraTitle')}</h2>
          <p className="reveal" style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.25rem', maxWidth: 520 }}>
            {t('about.infraText')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
                k: 'wifi'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
                k: 'computers'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
                k: 'library'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
                k: 'cctv'
              },
            ].map((item, i) => (
              <div key={i} className={`card reveal reveal-delay-${i + 1}`} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="achieve-icon" style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-hero-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'var(--color-brand)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>{t(`about.infra.${item.k}.title`)}</h3>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{t(`about.infra.${item.k}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}