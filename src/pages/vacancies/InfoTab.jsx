import { Trans, useTranslation } from 'react-i18next'
import { BENEFITS, REQUIREMENTS, DOCS_NEEDED, HR_PHONES } from './data'
import config from '../../config'
import telHref from '../../utils/telHref'
import Icon from '../../components/Icon'
import { iconClass, iconClassSm } from './styles'

// "Ma'lumot" tabi: wine banner, afzalliklar (3×2), talablar, "qanday ariza topshirish" (Email + Bog'lanish), CTA.
// Matnlar, tartib va `setActiveTab('form')` xatti-harakati o'zgarmagan (6.11c4 — faqat ko'rinish va semantika).
export default function InfoTab({ setActiveTab }) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="wine-banner vac-banner reveal">
        <h2 className="wine-banner__title">{t('vacancies.info.whyTitle')}</h2>
        <p className="wine-banner__text">{t('vacancies.info.whyText')}</p>
      </div>

      <h2 className="section-title">{t('vacancies.info.offerTitle')}</h2>
      <div className="cards-3 vac-block">
        {BENEFITS.map((b, i) => (
          <div key={b.id} className={`rv-item reveal reveal-delay-${(i % 3) + 1}`}>
            <div className="card card--lift vac-benefit">
              <div className={iconClass}>{b.icon}</div>
              <div>
                <h3 className="vac-benefit__title">{t(`vacancies.info.benefits.${b.id}.title`)}</h3>
                <p className="vac-benefit__desc">{t(`vacancies.info.benefits.${b.id}.desc`)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">{t('vacancies.info.reqTitle')}</h2>
      <div className="card vac-req-card vac-block reveal">
        <ul className="vac-req-list">
          {REQUIREMENTS.map(r => (
            <li key={r} className="vac-req">
              <span className="vac-req__check" aria-hidden="true">
                <Icon size={14}><polyline points="20 6 9 17 4 12" /></Icon>
              </span>
              <p className="vac-req__text">{t(`vacancies.info.requirements.${r}`)}</p>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="section-title">{t('vacancies.info.howTitle')}</h2>
      <div className="cards-2 vac-block">
        <div className="rv-item reveal">
          <div className="card card--lift vac-how">
            <h3 className="vac-how__title">
              <span className={iconClassSm}>
                <Icon size={20}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Icon>
              </span>
              {t('vacancies.info.byEmail')}
            </h3>
            <p className="vac-how__text">
              <Trans i18nKey="vacancies.info.sendDocs" values={{ email: config.contact.email }} components={{ b: <strong className="vac-strong--brand" /> }} />
            </p>
            <ul className="vac-docs">
              {DOCS_NEEDED.map(d => (
                <li key={d.id} className="vac-doc">
                  <span className="vac-doc__icon" aria-hidden="true">{d.icon}</span>
                  {t(`vacancies.docs.${d.id}`)}
                </li>
              ))}
            </ul>
            <div className="vac-note">
              <Icon size={18}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>
              <span><Trans i18nKey="vacancies.info.reviewTime" components={{ b: <strong className="vac-strong" /> }} /></span>
            </div>
          </div>
        </div>

        <div className="rv-item reveal reveal-delay-1">
          <div className="card card--lift vac-how">
            <h3 className="vac-how__title">
              <span className={iconClassSm}>
                <Icon size={20}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.58 4.88C1.58 3.85 2.35 3 3.39 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18v-.08z" /></Icon>
              </span>
              {t('vacancies.info.contact')}
            </h3>
            <ul className="vac-contact-list">
              {HR_PHONES.map(p => (
                <li key={p.id} className="vac-contact">
                  <span className="vac-contact__label">{t(`vacancies.info.${p.id}`)}</span>
                  <a className="vac-contact__value" href={telHref(p.value)}>{p.value}</a>
                </li>
              ))}
              <li className="vac-contact">
                <span className="vac-contact__label">Email</span>
                <a className="vac-contact__value" href={`mailto:${config.contact.email}`}>{config.contact.email}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="vac-cta">
        <button type="button" onClick={() => setActiveTab('form')} className="btn btn-primary btn-lg vac-cta__btn">
          {t('vacancies.info.cta')}
          <Icon size={18}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
        </button>
      </div>
    </div>
  )
}
