import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import config from '../../config'
import Icon from '../../components/Icon'

// config.stats tartibi bilan mos: label matnlari i18n'da (home.stats.<kalit>)
const STAT_KEYS = ['students', 'teachers', 'programs', 'founded']

// "HERO" bo'limi (spec 6.10). Kirish animatsiyasi `.enter` (global.css) — faqat transform: `.reveal` kabi opacity:0 + JS kuzatuvchi
// kutmaydi, shuning uchun sarlavha va rasm birinchi chizilishdayoq ko'rinadi (LCP). Barcha uslublar `pages.css` da (`.home-hero*`, `.stat-tile*`), inline stil yo'q.
// stat-${i} id'lari orkestrator (Home.jsx)dagi useEffect statistika
// hisoblagichi tomonidan document.getElementById orqali topiladi.
export default function HeroSection() {
  const { t } = useTranslation()
  // Sarlavhaning oxirgi so'zi brend rangida (taxta: "Qarshi Xalqaro <Universiteti>")
  const name = t('university.name')
  const cut = name.lastIndexOf(' ')
  const head = cut > 0 ? name.slice(0, cut + 1) : ''
  const tail = cut > 0 ? name.slice(cut + 1) : name
  return (
    <section className="home-hero">
      <div className="container-wide">
        <div className="home-hero__grid">

          {/* Chap — matn */}
          <div className="home-hero__text">
            <h1 className="enter enter-delay-1 home-hero__title">{head}<span className="hl-brand">{tail}</span></h1>
            <p className="enter enter-delay-2 home-hero__lead">{t('home.hero.lead')}</p>
            {/* Havola tugma ko'rinishida (avval `<a><button>` — ichma-ich interaktiv element edi) */}
            <div className="enter enter-delay-3 home-hero__cta">
              <NavLink to="/admission" className="btn btn-primary btn-cta btn-glow">{t('home.hero.ctaAdmission')} <Icon size={18} strokeWidth={1.8}><path d="M5 12h14M13 6l6 6-6 6" /></Icon></NavLink>
              <NavLink to="/faculty" className="btn btn-accent btn-cta btn-glow">{t('home.hero.ctaPrograms')} <Icon size={18} strokeWidth={1.8}><path d="M5 12h14M13 6l6 6-6 6" /></Icon></NavLink>
            </div>
            <div className="enter enter-delay-4 home-stats">
              {config.stats.map((s, i) => (
                <div key={STAT_KEYS[i]} className={`stat-tile${STAT_KEYS[i] === 'founded' ? ' stat-2022' : ''}`} data-stat={STAT_KEYS[i]}>
                  <div id={`stat-${i}`} className="stat-tile__num">0</div>
                  <div className="stat-tile__label">{t(`home.stats.${STAT_KEYS[i]}`)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* O'ng — kampus rasmi (3:2 — bino to'liq ko'rinadi). Orqasida yumshoq wine va oltin dog' (`::before/::after`) */}
          <div className="enter enter-delay-2 home-hero__photo">
            <div className="home-hero__frame">
              <img
                src="/gallery/Asosiy-kampus.png"
                alt={t('home.hero.photoAlt')}
                width="768"
                height="512"
                loading="eager"
                fetchPriority="high"
              />
              <span className="campus-label">
                <Icon size={14}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>
                {t('home.hero.campus1')}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
