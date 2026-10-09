// «Kelajakka qadam» — yoshlar va bitiruvchilarni qo'llab-quvvatlash dasturi (operator: O'zbekiston Milliy banki).
// Matnlar i18n'da (futureStep.*); bu yerda faqat tuzilma, havolalar va ikonkalar.
import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import telHref from '../utils/telHref'

const NBU_URL = 'https://nbu.uz/'
const NBU_PRODUCTS_URL = 'https://nbu.uz/kichik-biznes/kreditlar/yangi-kelajakka-qadam-kreditlari'
const NBU_PHONE = '(78) 148 00 10'
const NBU_PHONE_TEL = '+998 78 148 00 10'

const OPPORTUNITIES = [
  { id: 'business', icon: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></> },
  { id: 'skills', icon: <><path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12.2v5c3 3 9 3 12 0v-5M22 10v6"/></> },
  { id: 'jobs', icon: <><path d="M16.5 20.5v-2a4 4 0 0 0-4-4h-6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7.5" r="3.8"/><path d="M21.5 20.5v-2a4 4 0 0 0-3-3.9M15.5 3.8a3.8 3.8 0 0 1 0 7.4"/></> },
  { id: 'abroad', icon: <><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5a14.5 14.5 0 0 1 3.8 9.5A14.5 14.5 0 0 1 12 21.5 14.5 14.5 0 0 1 8.2 12 14.5 14.5 0 0 1 12 2.5z"/></> },
]

// `conditions` — shartlar kalitlari (futureStep.products.<id>.conditions.<kalit>); `link` — NBU'dagi mahsulot sahifasi bor-yo'qligi
const PRODUCTS = [
  { id: 'firstStep', conditions: ['amount', 'term', 'grace', 'rate'], link: true },
  { id: 'bizStart', conditions: ['amount', 'term', 'grace', 'rate'], link: true },
  { id: 'bizProgress', conditions: ['amount', 'term', 'grace', 'rate'], link: true },
  { id: 'studentInvest', conditions: ['amount', 'term', 'grace', 'rate'], link: true },
  { id: 'firstProfession', conditions: ['stipend', 'abroad', 'businessPlan', 'expo'], link: false },
]

export default function FutureStep() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <PageHero title={t('futureStep.title')} sub={t('futureStep.subtitle')}>
        <div className="kq-actions">
          <a href={NBU_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-cta">
            {t('futureStep.moreNbu')}
          </a>
          <a href={telHref(NBU_PHONE_TEL)} className="btn btn-secondary btn-cta">{NBU_PHONE}</a>
        </div>
      </PageHero>

      <section className="page-body kq-page">
        <div className="container-wide kq-flow">

          <div>
            <h2 className="section-title reveal">{t('futureStep.opportunitiesTitle')}</h2>
            <div className="grid-12">
              {OPPORTUNITIES.map((item, i) => (
                <div key={item.id} className={`rv-item col-6 reveal reveal-delay-${(i % 4) + 1}`}>
                  <div className="card card--lift feature-card">
                    <div className="tile"><Icon>{item.icon}</Icon></div>
                    <div>
                      <h3 className="feature-card__title">{t(`futureStep.opportunities.${item.id}.title`)}</h3>
                      <p className="feature-card__desc">{t(`futureStep.opportunities.${item.id}.desc`)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="section-title reveal">{t('futureStep.productsTitle')}</h2>
            <p className="kq-lead reveal">{t('futureStep.productsLead')}</p>
            <div className="kq-list">
              {PRODUCTS.map((p, i) => (
                <article key={p.id} className="rv-item reveal">
                  <div className="card card--lift kq-product">
                    <div className="kq-product__head">
                      <span className="kq-product__num" aria-hidden="true">{i + 1}</span>
                      <div>
                        <h3 className="kq-product__title">{t(`futureStep.products.${p.id}.title`)}</h3>
                        <p className="kq-product__desc">{t(`futureStep.products.${p.id}.desc`)}</p>
                      </div>
                    </div>
                    <div className="kq-product__body">
                      <div>
                        <h4 className="kq-product__label">{t('futureStep.whoLabel')}</h4>
                        <p className="kq-product__who">{t(`futureStep.products.${p.id}.who`)}</p>
                      </div>
                      <div>
                        <h4 className="kq-product__label">{t('futureStep.conditionsLabel')}</h4>
                        <ul className="kq-conditions">
                          {p.conditions.map(c => (
                            <li key={c}>
                              <span className="kq-conditions__mark"><Icon size={16} strokeWidth={2.4}><path d="M20 6 9 17l-5-5"/></Icon></span>
                              <span>{t(`futureStep.products.${p.id}.conditions.${c}`)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {p.link && (
                      <a href={NBU_PRODUCTS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm kq-product__link">
                        {t('futureStep.details')}
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <p className="kq-note reveal">{t('futureStep.note')}</p>
          </div>

          <div className="wine-banner wine-banner--center reveal">
            <div className="wine-banner__kicker">
              <Icon size={20}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Icon>
              <span>NBU</span>
            </div>
            <h2 className="wine-banner__title">{t('futureStep.ctaTitle')}</h2>
            <p className="wine-banner__text">{t('futureStep.ctaText')}</p>
            <div className="kq-actions kq-actions--center">
              <a href={NBU_URL} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-cta">{t('futureStep.moreNbu')}</a>
              <a href={telHref(NBU_PHONE_TEL)} className="btn btn-secondary btn-cta">{NBU_PHONE}</a>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
