import { useTranslation } from 'react-i18next'
import config from '../config'
import { NavLink } from '../i18n/router'
 
const STEPS = [
  {
    key: 'documents',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    key: 'application',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    key: 'exam',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    key: 'result',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
      </svg>
    ),
  },
]
 
export default function Admission({ onApply }) {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      {/* Hero */}
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>
          {t('admission.title', { year: config.admission.year })}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('admission.subtitle')}</p>
      </section>
 
      <section className="section">
        <div className="container">
 
          {/* Banner */}
          <div className="reveal" style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: 16, padding: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '.35rem' }}>
                {t('admission.banner')}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
                {t('admission.deadlineLabel', { deadline: t('admission.deadline') })}
              </p>
            </div>
 
            {/* Tugmalar */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={onApply} className="btn btn-primary">
                {t('admission.apply')}
              </button>
 
              <NavLink to="/sorting-hat" style={{ textDecoration: 'none' }}>
  <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
    {t('admission.findProgram')}
  </button>
</NavLink>
            </div>
          </div>
 
          {/* Steps */}
          <div className="grid-auto">
            {STEPS.map((s, i) => (
              <div key={s.key} className={`card reveal reveal-delay-${i + 1}`}>
                <div className="step-icon" style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: '#7c3aed' }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 9px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>
                  {t('admission.stepN', { n: i + 1 })}
                </span>
                <h3 style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 3 }}>
                  {t(`admission.steps.${s.key}.title`)}
                </h3>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{t(`admission.steps.${s.key}.desc`)}</p>
              </div>
            ))}
          </div>
 
        </div>
      </section>
    </div>
  )
}