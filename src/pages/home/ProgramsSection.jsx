import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import Icon from '../../components/Icon'
import { IC } from '../faculty/Icons.jsx'
import { BAKALAVR } from '../faculty/data'
import { fmt } from '../faculty/utils'

// Bosh sahifada ko'rsatiladigan yo'nalishlar (tartib bo'yicha); qolganlari /faculty sahifasida.
// Karta nomi/narxi/davomiyligi faculty/data.js dan olinadi — `id` o'zgarsa, bu ro'yxat ham yangilanadi.
const HOME_PROGRAM_IDS = ['economics', 'softwareEng', 'oilGas', 'philology', 'primary']
const HOME_PROGRAMS = HOME_PROGRAM_IDS.map(id => BAKALAVR.find(p => p.id === id)).filter(Boolean)

// "Yo'nalishlar" bo'limi ("Biz haqimizda" dan keyin): Yangiliklar bo'limi kabi markazlashgan sarlavha,
// so'ng 5 ta tanlangan yo'nalish kartalari (/faculty sahifasi bilan bir xil ma'lumot manbai — faculty/data.js)
// va "Barcha yo'nalishlar" tugmasi. Karta — butun havola: modal /faculty sahifasida ochiladi.
// Karta "faol" ko'rinishi (wine chegara + gradient) faqat hover/fokusda, `.home-feature` bilan bir xil.
export default function ProgramsSection() {
  const { t } = useTranslation()
  return (
    <section className="home-programs">
      <div className="container-wide home-programs__inner">
        <div className="reveal home-programs__head">
          <span className="section-badge">{t('home.programs.badge')}</span>
          <h2 className="home-h2">{t('home.programs.title')}</h2>
          <p className="home-programs__sub">{t('home.programs.subtitle')}</p>
        </div>

        <div className="home-programs__grid">
          {HOME_PROGRAMS.map((p, i) => (
            <div key={p.id} className={`rv-item reveal reveal-delay-${(i % 5) + 1}`}>
              <NavLink to="/faculty" className="card card--lift home-program">
                {/* IC ikonkalari dekorativ: nom matnda bor */}
                <span className="tile tile--46" aria-hidden="true">{IC[p.icon](22)}</span>
                <h3 className="home-program__name">{t(`faculty.programs.${p.id}.name`)}</h3>
                <span className="home-program__meta">
                  <span aria-hidden="true" className="home-program__clock">{IC.clock(13)}</span>
                  {t('faculty.years', { count: p.years })}
                  <span aria-hidden="true" className="home-program__sep">·</span>
                  {t(`faculty.studyForms.${p.studyForm}`)}
                </span>
                <span className="home-program__price">
                  {t('faculty.pricePerYear', { price: fmt(p.price, t('meta.thousandsSep')) })}
                </span>
              </NavLink>
            </div>
          ))}
        </div>

        <div className="reveal home-programs__more">
          <NavLink to="/faculty" className="btn btn-primary btn-cta">{t('home.programs.all')} <Icon size={18} strokeWidth={1.8}><path d="M5 12h14M13 6l6 6-6 6" /></Icon></NavLink>
        </div>
      </div>
    </section>
  )
}
