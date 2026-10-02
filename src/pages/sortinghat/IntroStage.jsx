import { useTranslation } from 'react-i18next'
import { IcQuestion, IcBolt, IcTarget, IcSparkle, IcBulb, IcPlay } from './Icons.jsx'
import { QUESTIONS } from './Data.jsx'

/* ── Intro Stage ───────────────────────────────────────────────
   6.11d: 4 ta ma'lumot kartasi aniq `repeat(4, 1fr)` (CSS: `.sh-info`); avvalgi JS'da hisoblangan auto-fit minimal
   ustun kengligi eksportlari endi kerak emas — konteyner 760 px. */
export default function IntroStage({ onStart }) {
  const { t } = useTranslation()
  const cards = [
    { icon: <IcQuestion />, title: t('sortingHat.intro.cards.questions.title', { n: QUESTIONS.length }), desc: t('sortingHat.intro.cards.questions.desc') },
    { icon: <IcBolt />,     title: t('sortingHat.intro.cards.time.title'),     desc: t('sortingHat.intro.cards.time.desc') },
    { icon: <IcTarget />,   title: t('sortingHat.intro.cards.top3.title'),     desc: t('sortingHat.intro.cards.top3.desc') },
    { icon: <IcSparkle />,  title: t('sortingHat.intro.cards.personal.title'), desc: t('sortingHat.intro.cards.personal.desc') },
  ]
  return (
    <div>
      <ul className="sh-info">
        {cards.map((c, i) => (
          <li key={i} className="card card--lift sh-info__card">
            <span className="tile sh-info__tile">{c.icon}</span>
            <strong className="sh-info__title">{c.title}</strong>
            <span className="sh-info__desc">{c.desc}</span>
          </li>
        ))}
      </ul>

      <div className="card sh-how">
        <div className="sh-how__head">
          <span className="tile sh-how__tile"><IcBulb s={22} /></span>
          <h2 className="sh-how__title">{t('sortingHat.intro.howTitle')}</h2>
        </div>
        <ol className="sh-steps">
          {[1, 2, 3, 4].map(n => (
            <li key={n} className="sh-step">
              <span className="sh-step__num" aria-hidden="true">{n}</span>
              <div>
                <div className="sh-step__title">{t(`sortingHat.intro.steps.${n}.title`)}</div>
                <div className="sh-step__desc">{t(`sortingHat.intro.steps.${n}.desc`)}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="sh-start-wrap">
        <button type="button" onClick={onStart} className="btn btn-primary sh-start">
          <IcPlay s={18} /> {t('sortingHat.intro.start')}
        </button>
      </div>
    </div>
  )
}
