import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'

// Statistika plitkalari: hammasi bitta brend rangida (6.11 — alohida ranglar bekor); matn `about.stats.<k>`
const STATS = [
  { n: '6875', k: 'students' },
  { n: '151', k: 'teachers' },
  { n: '10', k: 'programs' },
  { n: '8', k: 'awards' },
  { n: '2', k: 'grants' },
  { n: '16', k: 'clubs' },
]

const ADVANTAGES = [
  { k: 'campus', icon: <><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/></> },
  { k: 'grant', icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></> },
  { k: 'bus', icon: <><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></> },
  { k: 'dorm', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
  { k: 'abroad', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
  { k: 'international', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { k: 'softSkills', icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> },
  { k: 'creative', icon: <><circle cx="9" cy="7" r="4"/><path d="M17 11a4 4 0 1 0-3.995-4.2"/><path d="M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><path d="M17 13a4 4 0 0 1 4 4v4"/></> },
]

const LEADERS = [
  { k: 'rector', hasInfo: true },
  { k: 'viceRector' },
  { k: 'financeDirector', hasInfo: true },
  { k: 'boardChair', hasInfo: true },
]

const INFRA = [
  { k: 'wifi', icon: <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></> },
  { k: 'computers', icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></> },
  { k: 'library', icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
  { k: 'cctv', icon: <><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></> },
]

// Karta hover/ko'tarilishi `.rv-item` ichidagi `.card` da (`.reveal` o'zida transform bor — hover bilan to'qnashmasligi uchun alohida o'rama)
function InfoCard({ icon, title, desc, delay }) {
  return (
    <div className={`rv-item reveal reveal-delay-${delay}`}>
      <div className="card card--lift info-card">
        <div className="tile">{icon}</div>
        <h3 className="info-card__title">{title}</h3>
        <p className="info-card__desc">{desc}</p>
      </div>
    </div>
  )
}

export default function About() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <PageHero title={t('about.title')} sub={t('about.subtitle')} />

      <section className="page-body about-page">
        <div className="container-wide about-flow">
          <div className="about-intro">
            <div className="reveal">
              <h2 className="section-title">{t('about.ourUniversity')}</h2>
              <p className="about-text">{t('about.p1')}</p>
              <p className="about-text">{t('about.p2')}</p>
              <p className="about-text">{t('about.p3')}</p>
            </div>
            <div className="about-stats reveal reveal-delay-1">
              {STATS.map(s => (
                <div key={s.k} className="card about-stat">
                  <div className="about-stat__value">{s.n}</div>
                  <div className="about-stat__label">{t(`about.stats.${s.k}`)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="wine-banner reveal">
            {/* Taxta: sarlavha ustida oltin yulduz + "KIU" yorlig'i (dekorativ ikonka) */}
            <div className="wine-banner__kicker">
              <Icon size={20}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>
              <span>KIU</span>
            </div>
            <h2 className="wine-banner__title">{t('about.missionTitle')}</h2>
            <p className="wine-banner__text">{t('about.missionText')}</p>
          </div>

          <div>
          <h2 className="section-title reveal">{t('about.advantagesTitle')}</h2>
          <div className="cards-4">
            {ADVANTAGES.map((item, i) => (
              <InfoCard key={item.k} delay={(i % 4) + 1} icon={<Icon>{item.icon}</Icon>}
                title={t(`about.advantages.${item.k}.title`)} desc={t(`about.advantages.${item.k}.desc`)} />
            ))}
          </div>
          </div>

          <div>
          <h2 className="section-title reveal">{t('about.leadershipTitle')}</h2>
          <div className="cards-4">
            {LEADERS.map((p, i) => {
              // Avatar bosh harflari tarjima qilingan ismdan olinadi (Panjiyev Ulug'bek → PU, Панжиев Улугбек → ПУ)
              const name = t(`about.leaders.${p.k}.name`)
              const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
              return (
                <div key={p.k} className={`rv-item reveal reveal-delay-${i + 1}`}>
                  <div className="card card--lift info-card info-card--person">
                    <div className="avatar-wine" aria-hidden="true">{initials}</div>
                    <h3 className="info-card__title">{name}</h3>
                    <div className="pill-brand">{t(`about.leaders.${p.k}.role`)}</div>
                    {p.hasInfo && <p className="info-card__desc">{t(`about.leaders.${p.k}.info`)}</p>}
                  </div>
                </div>
              )
            })}
          </div>
          </div>

          <div>
          <h2 className="section-title about-infra-title reveal">{t('about.infraTitle')}</h2>
          <p className="about-text about-text--lead reveal">{t('about.infraText')}</p>
          <div className="cards-4">
            {INFRA.map((item, i) => (
              <InfoCard key={item.k} delay={i + 1} icon={<Icon>{item.icon}</Icon>}
                title={t(`about.infra.${item.k}.title`)} desc={t(`about.infra.${item.k}.desc`)} />
            ))}
          </div>
          </div>
        </div>
      </section>
    </div>
  )
}
