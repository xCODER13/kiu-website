import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'

const ICONS = {
  medal: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
  trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>,
  star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  target: <><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 9.17l4.24-4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M9.17 14.83l-4.24 4.24"/><circle cx="12" cy="12" r="4"/></>,
  cup: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>,
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
}

const AWARDS = [
  { id: 1, year: '2023', icon: 'medal' },
  { id: 2, year: '2024', icon: 'trophy' },
  { id: 3, year: '2024', icon: 'star' },
  { id: 4, year: '2023', icon: 'globe' },
  { id: 5, year: '2024', icon: 'target' },
  { id: 6, year: '2023', icon: 'cup' },
  { id: 7, year: '2024', icon: 'home' },
  { id: 8, year: '2024', icon: 'trophy' },
]

export default function Achievements() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <PageHero title={t('achievements.title')} sub={t('achievements.subtitle')} />

      <section className="page-body">
        <div className="container-wide">
          <div className="cards-4">
            {AWARDS.map((a, i) => (
              <div key={a.id} className={`rv-item reveal reveal-delay-${(i % 4) + 1}`}>
                <div className="card card--lift info-card award-card">
                  <div className="tile tile--64"><Icon size={30}>{ICONS[a.icon]}</Icon></div>
                  <span className="pill-brand">{a.year}</span>
                  <h3 className="info-card__title">{t(`achievements.awards.${a.id}.title`)}</h3>
                  <p className="info-card__desc">{t(`achievements.awards.${a.id}.org`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
