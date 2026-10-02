// Nom/davlat/turi i18n'da (international.partners.<id>); bu yerda faqat id va davlat kodi
import { useTranslation } from 'react-i18next'

// Ro'yxat kiu.uz/xalqaro dagi hamkorlar (6 ta) + INTI (universitet talabi bilan saqlangan)
const PARTNERS = [
  { id: 'inti', code: 'MY' },
  { id: 'mgpu', code: 'RU' },
  { id: 'turiba', code: 'LV' },
  { id: 'gdansk', code: 'PL' },
  { id: 'mediterranea', code: 'IT' },
  { id: 'presidency', code: 'IN' },
  { id: 'icfai', code: 'IN' },
]

// Statistikadagi hamkor va davlat sonlari ro'yxatdan hisoblanadi: qo'lda yozilgan raqam ro'yxatga zid bo'lib qolmasin
const COUNTRY_COUNT = new Set(PARTNERS.map(p => p.code)).size

const OPPORTUNITIES = [
  {
    id: 'mobility',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
  },
  {
    id: 'programs',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  },
  {
    id: 'exchange',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
  },
  {
    id: 'grants',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  },
  {
    id: 'methods',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
  },
]

export default function International() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>{t('international.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('international.subtitle')}</p>
      </section>

      <section className="section">
        <div className="container">

          {/* Banner */}
          <div className="reveal" style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: 16, padding: '2.5rem', marginBottom: '2.5rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-on-brand)', fontSize: '1.3rem', marginBottom: '.75rem' }}>{t('international.strategyTitle')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8, maxWidth: 600, margin: '0 auto 1.5rem' }}>
              {t('international.strategyText')}
            </p>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[{ n: PARTNERS.length, k: 'partners' }, { n: COUNTRY_COUNT, k: 'countries' }, { n: '11', k: 'programs' }, { n: '2', k: 'formats' }].map(s => (
                <div key={s.k} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#c4b5fd' }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{t(`international.stats.${s.k}`)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <h2 className="reveal" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>{t('international.opportunitiesTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
            {OPPORTUNITIES.map((item, i) => (
              <div key={i} className={`card reveal reveal-delay-${(i % 4) + 1}`}>
                <div className="achieve-icon" style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: 'var(--color-brand)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{t(`international.opportunities.${item.id}.title`)}</h3>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{t(`international.opportunities.${item.id}.desc`)}</p>
              </div>
            ))}
          </div>

          {/* Partners */}
          <h2 className="reveal" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>{t('international.partnersTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
            {PARTNERS.map((p, i) => (
              <div key={i} className={`card reveal reveal-delay-${(i % 4) + 1}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-brand)', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{p.code}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t(`international.partners.${p.id}.name`)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{t(`international.partners.${p.id}.country`)}</div>
                  <span style={{ fontSize: 11, color: 'var(--color-brand)', background: 'color-mix(in srgb, var(--color-brand) 10%, transparent)', padding: '2px 8px', borderRadius: 20 }}>{t(`international.partners.${p.id}.type`)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Academic exchange */}
          <h2 className="reveal" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>{t('international.exchangeTitle')}</h2>
          <div className="grid-2">
            {[
              {
                id: 'students',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              },
              {
                id: 'teachers',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              },
            ].map((item, i) => (
              <div key={i} className={`card reveal reveal-delay-${i + 1}`}>
                <div className="achieve-icon" style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: 'var(--color-brand)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{t(`international.exchange.${item.id}.title`)}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{t(`international.exchange.${item.id}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
