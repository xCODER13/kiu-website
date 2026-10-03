import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import Icon from '../../components/Icon'

// Afzalliklar: ikonka (dekorativ SVG) + i18n kaliti (home.about.features.<k>)
const FEATURES = [
  { k: 'grant', icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></> },
  { k: 'international', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
  { k: 'bus', icon: <><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></> },
  { k: 'dorm', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
]

// "Biz haqimizda" bo'limi (spec 6.10): matn + 2-kampus rasmi (ramkasiz yumshoq yorug'lik) + 4 ta afzallik kartasi.
// Karta "faol" ko'rinishi (wine chegara + `--shadow-card-active`) faqat hover'da chiqadi — doimiy belgilangan karta yo'q.
export default function AboutSection() {
  const { t } = useTranslation()
  return (
    <section className="home-about">
      <div className="container-wide">
        <div className="home-about__grid">
          {/* Chap — matn */}
          <div className="home-about__text-col">
            <span className="reveal section-badge">{t('home.about.badge')}</span>
            <h2 className="reveal reveal-delay-1 home-h2">{t('home.about.title')}</h2>
            <p className="reveal reveal-delay-2 home-about__text">{t('home.about.p1')}</p>
            <p className="reveal reveal-delay-3 home-about__text">{t('home.about.p2')}</p>
            <div className="reveal reveal-delay-4 home-about__more">
              <NavLink to="/about" className="btn btn-primary btn-cta">{t('home.about.more')} <Icon size={18} strokeWidth={1.8}><path d="M5 12h14M13 6l6 6-6 6" /></Icon></NavLink>
            </div>
          </div>

          {/* O'ng — 2-kampus rasmi */}
          <div className="reveal reveal-delay-2 home-about__photo">
            <div className="home-about__frame">
              <img src="/gallery/2-kampus.png" alt={t('home.about.campus2Alt')} width="768" height="512" loading="lazy" />
              <span className="campus-label">
                <Icon size={14}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>
                {t('home.about.campus2')}
              </span>
            </div>
          </div>
        </div>

        {/* Afzalliklar */}
        <div className="cards-4 home-features">
          {FEATURES.map((f, i) => (
            <div key={f.k} className={`rv-item reveal reveal-delay-${Math.min(i + 1, 4)}`}>
              <div className="card card--lift home-feature">
                <div className="tile tile--46"><Icon size={22} strokeWidth={1.8}>{f.icon}</Icon></div>
                <h3 className="home-feature__title">{t(`home.about.features.${f.k}.title`)}</h3>
                <p className="home-feature__desc">{t(`home.about.features.${f.k}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
