import { Trans, useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero.jsx'
import config from '../config'
import { NavLink } from '../i18n/router'
 
const STEPS = [
  {
    key: 'documents',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    key: 'application',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    key: 'exam',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    key: 'result',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <PageHero
        badge={t('admission.badge')}
        title={<Trans i18nKey="admission.title" values={{ year: config.admission.year }} components={{ brand: <span className="hl-brand" /> }} />}
        sub={t('admission.subtitle')}
        className="adm-hero"
      />

      <section className="page-body adm-page">
        <div className="container-wide adm-flow">

          {/* Banner */}
          <div className="reveal apply-banner">
            <div>
              <h2 className="apply-banner__title">{t('admission.banner')}</h2>
              <span className="deadline-chip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {t('admission.deadlineLabel', { deadline: t('admission.deadline') })}
              </span>
            </div>

            {/* Tugmalar: ikkalasi ham havola/tugma — ichma-ich interaktiv element yo'q (avval NavLink ichida <button> edi) */}
            <div className="apply-banner__actions">
              <button type="button" onClick={onApply} className="btn btn-primary btn-cta">
                {t('admission.apply')}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
              <NavLink to="/sorting-hat" className="btn btn-accent btn-cta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                {t('admission.findProgram')}
              </NavLink>
            </div>
          </div>

          {/* Steps */}
          <div className="steps-grid">
            {/* `.reveal` o'ramda, hover (`card--lift`) ichidagi kartada — transform to'qnashmasin (boshqa sahifalardagi kabi) */}
            {STEPS.map((s, i) => (
              <div key={s.key} className={`rv-item reveal reveal-delay-${i + 1}`}>
                <div className="card card--lift step-card">
                  <div className="step-head">
                    <div className="step-icon">{s.icon}</div>
                    <span className="step-badge">{t('admission.stepN', { n: i + 1 })}</span>
                  </div>
                  <h3 className="step-title">{t(`admission.steps.${s.key}.title`)}</h3>
                  <p className="step-desc">{t(`admission.steps.${s.key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  )
}
