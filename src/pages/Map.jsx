import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'

// Google xaritasi so'rovi (`q`) — manzil matni i18n'dagi `university.addressN` bilan bir xil joy.
const CAMPUSES = [
  { n: 1, q: "Qarshi+sh+Bahodir+Sherqulov+ko'chasi+7", address: 'university.address1' },
  { n: 2, q: "Qarshi+sh+Mustaqillik+ko'chasi+71", address: 'university.address2' },
]

export default function Map() {
  const { t } = useTranslation()

  return (
    <div className="fade-up">
      <PageHero title={t('map.title')} sub={t('map.subtitle')} />
      <section className="section">
        <div className="container">
          <div className="map-grid">
            {CAMPUSES.map((c, i) => {
              const name = t('map.campus', { n: c.n })
              return (
                <div key={c.n} className={`rv-item reveal${i ? ` reveal-delay-${i}` : ''}`}>
                  <div className="card card--lift map-card">
                    <div className="map-card__head">
                      <div className="map-card__num" aria-hidden="true">{c.n}</div>
                      <div className="map-card__info">
                        <h2 className="map-card__name">{name}</h2>
                        <p className="map-card__address">
                          <Icon size={16}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></Icon>
                          <span>{t(c.address)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="map-card__frame" role="region" aria-label={name}>
                      <iframe
                        title={name}
                        src={`https://maps.google.com/maps?q=${c.q}&output=embed&z=15`}
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
