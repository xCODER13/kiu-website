// Nom/davlat/turi i18n'da (international.partners.<id>); bu yerda faqat id va davlat kodi
import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'

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
  { id: 'mobility', icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></> },
  { id: 'programs', icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></> },
  { id: 'exchange', icon: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></> },
  { id: 'grants', icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
  { id: 'methods', icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></> },
]

const EXCHANGE = [
  { id: 'students', icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></> },
  { id: 'teachers', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
]

// 12 ustunli to'r: imkoniyatlar 3 + 2 (4/6 ustun), hamkorlar 4 + 3 (3/4 ustun) — yetim qator bo'lmaydi
const OPP_COL = ['col-4', 'col-4', 'col-4', 'col-6', 'col-6']
const PARTNER_COL = ['col-3', 'col-3', 'col-3', 'col-3', 'col-4', 'col-4', 'col-4']

export default function International() {
  const { t } = useTranslation()
  const stats = [{ n: PARTNERS.length, k: 'partners' }, { n: COUNTRY_COUNT, k: 'countries' }, { n: '11', k: 'programs' }, { n: '2', k: 'formats' }]
  return (
    <div className="fade-up">
      <PageHero title={t('international.title')} sub={t('international.subtitle')} />

      <section className="page-body intl-page">
        <div className="container-wide intl-flow">

          {/* Strategiya banneri (About dagi missiya banneri bilan bir xil) */}
          <div className="wine-banner wine-banner--center reveal">
            <div className="wine-banner__kicker">
              <Icon size={16}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>
              <span>KIU</span>
            </div>
            <h2 className="wine-banner__title">{t('international.strategyTitle')}</h2>
            <p className="wine-banner__text">{t('international.strategyText')}</p>
            <div className="wine-stats">
              {stats.map(s => (
                <div key={s.k} className="wine-stat">
                  <div className="wine-stat__value">{s.n}</div>
                  <div className="wine-stat__label">{t(`international.stats.${s.k}`)}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
          <h2 className="section-title reveal">{t('international.opportunitiesTitle')}</h2>
          <div className="grid-12">
            {OPPORTUNITIES.map((item, i) => (
              <div key={item.id} className={`rv-item ${OPP_COL[i]} reveal reveal-delay-${(i % 4) + 1}`}>
                <div className="card card--lift feature-card">
                  <div className="tile"><Icon>{item.icon}</Icon></div>
                  <div>
                    <h3 className="feature-card__title">{t(`international.opportunities.${item.id}.title`)}</h3>
                    <p className="feature-card__desc">{t(`international.opportunities.${item.id}.desc`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          </div>

          <div>
          <h2 className="section-title reveal">{t('international.partnersTitle')}</h2>
          <div className="grid-12">
            {PARTNERS.map((p, i) => (
              <div key={p.id} className={`rv-item ${PARTNER_COL[i]} reveal reveal-delay-${(i % 4) + 1}`}>
                <div className="card card--lift partner-card">
                  <div className="partner-card__code" aria-hidden="true">{p.code}</div>
                  <div className="partner-card__body">
                    <div className="partner-card__name">{t(`international.partners.${p.id}.name`)}</div>
                    <div className="partner-card__country">{t(`international.partners.${p.id}.country`)}</div>
                    <span className="pill-brand">{t(`international.partners.${p.id}.type`)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          </div>

          <div>
          <h2 className="section-title reveal">{t('international.exchangeTitle')}</h2>
          <div className="cards-2">
            {EXCHANGE.map((item, i) => (
              <div key={item.id} className={`rv-item reveal reveal-delay-${i + 1}`}>
                <div className="card card--lift feature-card feature-card--lg">
                  <div className="tile tile--60"><Icon size={26}>{item.icon}</Icon></div>
                  <div>
                    <h3 className="feature-card__title">{t(`international.exchange.${item.id}.title`)}</h3>
                    <p className="feature-card__desc">{t(`international.exchange.${item.id}.desc`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>
    </div>
  )
}
