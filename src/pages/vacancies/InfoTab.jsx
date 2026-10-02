import { Trans, useTranslation } from 'react-i18next'
import { BENEFITS, REQUIREMENTS, DOCS_NEEDED } from './data'
import config from '../../config'
import { iconClass, iconClassSm } from './styles'

// "INFO TAB" bo'limi — Vacancies.jsx'dan o'zgarishsiz ko'chirilgan
// (banner, benefits grid, requirements, "qanday ariza topshirish" grid, CTA).
export default function InfoTab({ setActiveTab }) {
  const { t } = useTranslation()
  return (
    <div>
      {/* Banner */}
      <div className="vac-banner">
        <h2 className="vac-banner-title">{t('vacancies.info.whyTitle')}</h2>
        <p className="vac-banner-text">
          {t('vacancies.info.whyText')}
        </p>
      </div>

      {/* Benefits */}
      <h2 className="vac-heading">{t('vacancies.info.offerTitle')}</h2>
      <div className="grid-3 vac-mb-lg">
        {BENEFITS.map((b, i) => (
          <div key={i} className="card vac-benefit">
            <div className={iconClass}>{b.icon}</div>
            <div>
              <div className="vac-benefit-title">{t(`vacancies.info.benefits.${b.id}.title`)}</div>
              <div className="vac-benefit-desc">{t(`vacancies.info.benefits.${b.id}.desc`)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Requirements */}
      <h2 className="vac-heading">{t('vacancies.info.reqTitle')}</h2>
      <div className="card vac-mb-lg">
        <div className="vac-req-list">
          {REQUIREMENTS.map((r, i) => (
            <div key={i} className="vac-req">
              <div className="vac-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="vac-req-text">{t(`vacancies.info.requirements.${r}`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to apply */}
      <h2 className="vac-heading">{t('vacancies.info.howTitle')}</h2>
      <div className="grid-2 vac-mb-md">
        <div className="card">
          <h3 className="vac-card-title">
            <div className={iconClassSm}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            {t('vacancies.info.byEmail')}
          </h3>
          <p className="vac-card-text">
            <Trans i18nKey="vacancies.info.sendDocs" values={{ email: config.contact.email }} components={{ b: <strong className="vac-strong--brand" /> }} />
          </p>
          <div className="vac-docs">
            {DOCS_NEEDED.map((d, i) => (
              <div key={i} className="vac-doc">
                <span className="vac-doc-icon">{d.icon}</span> {t(`vacancies.docs.${d.id}`)}
              </div>
            ))}
          </div>
          <div className="vac-note">
            <span className="vac-note-line">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <Trans i18nKey="vacancies.info.reviewTime" components={{ b: <strong className="vac-strong" /> }} />
            </span>
          </div>
        </div>

        <div className="card">
          <h3 className="vac-card-title">
            <div className={iconClassSm}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.58 4.88C1.58 3.85 2.35 3 3.39 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18v-.08z"/></svg>
            </div>
            {t('vacancies.info.contact')}
          </h3>
          <div className="vac-contact-list">
            {[
              { label: t('vacancies.info.phone1'), value: '+998 91 961 11 00' },
              { label: t('vacancies.info.phone2'), value: '+998 91 211 54 52' },
              { label: 'Email', value: 'info@kiu.uz' },
            ].map((c, i) => (
              <div key={i} className="vac-contact">
                <div className="vac-contact-label">{c.label}</div>
                <div className="vac-contact-value">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="vac-cta">
        <button onClick={() => setActiveTab('form')} className="btn btn-primary vac-cta-btn">
          {t('vacancies.info.cta')}
        </button>
      </div>
    </div>
  )
}