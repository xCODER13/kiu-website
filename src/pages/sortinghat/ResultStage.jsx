import { useTranslation, Trans } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import { IcStar, IcHat, IcGrad, IcArrow, IcFile, IcBulb, IcRefresh } from './Icons.jsx'
import { FACULTIES, MEDALS, RANKS } from './Data'

const list = (t, key) => {
  const v = t(key, { returnObjects: true })
  return Array.isArray(v) ? v : []
}

/* ── Result Stage ──────────────────────────────────────────────
   6.11d: yo'nalish kartalari bitta brend gradient/rangda (`FACULTIES[k]` da `color`/`grad` maydoni yo'q — 6.19 da
   olib tashlandi). Birinchi karta: tepada oltin hairline + "Eng mos" pill (doimiy); hover/glow — hamma kartada bir xil
   (`.card--lift`). Natija ko'rsatilgach yaratiladi (async yuklashdan keyin) — shuning uchun `.reveal` ishlatilmaydi. */
export default function ResultStage({ result, onRestart }) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="wine-banner wine-banner--center sh-result-banner">
        <div className="sh-result-banner__hat">
          <IcStar s={22} />
          <IcHat s={72} />
          <IcStar s={22} />
        </div>
        <h2 className="wine-banner__title sh-result-banner__title">{t('sortingHat.result.title')}</h2>
        <p className="wine-banner__text sh-result-banner__text">{t('sortingHat.result.desc')}</p>
      </div>

      <div className="sh-facs">
        {result.map((key, idx) => {
          const fac = FACULTIES[key]
          if (!fac) return null
          return (
            <article key={key} className="card card--lift sh-fac" data-best={idx === 0}>
              <span className="tile tile--60 sh-fac__tile">{fac.icon}</span>
              <div className="sh-fac__body">
                <div className="sh-fac__rank">
                  <span className="sh-fac__medal">{MEDALS[idx]} {t(`sortingHat.result.ranks.${RANKS[idx]}`)}</span>
                  {idx === 0 && (
                    <span className="sh-fac__best"><IcStar s={12} c="currentColor" /> {t('sortingHat.result.best')}</span>
                  )}
                </div>
                <h3 className="sh-fac__name">{t(`sortingHat.faculties.${key}.name`)}</h3>
                <p className="sh-fac__desc">{t(`sortingHat.faculties.${key}.desc`)}</p>
                <div className="sh-fac__lists">
                  <div className="sh-fac__col">
                    <h4 className="sh-fac__list-title"><IcGrad s={15} /> {t('sortingHat.result.careers')}</h4>
                    <ul className="sh-fac__list">
                      {list(t, `sortingHat.faculties.${key}.career`).map((c, i) => (
                        <li key={i}><IcArrow s={13} /> {c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="sh-fac__col">
                    <h4 className="sh-fac__list-title"><IcFile s={15} /> {t('sortingHat.result.subjects')}</h4>
                    <ul className="sh-fac__list">
                      {list(t, `sortingHat.faculties.${key}.subjects`).map((s, i) => (
                        <li key={i}><IcArrow s={13} /> {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="sh-cta">
        <div className="sh-cta__head">
          <span className="tile sh-cta__tile"><IcBulb s={24} /></span>
          <p className="sh-cta__text">
            <Trans i18nKey="sortingHat.result.cta" components={{ b: <strong className="sh-cta__em" /> }} />
          </p>
        </div>
        <div className="sh-cta__actions">
          <NavLink to="/admission" className="btn btn-primary sh-cta__btn">
            <IcFile s={17} /> {t('sortingHat.result.apply')}
          </NavLink>
          <NavLink to="/faculty" className="btn btn-accent sh-cta__btn">
            <IcGrad s={17} /> {t('sortingHat.result.viewPrograms')}
          </NavLink>
          <button type="button" onClick={onRestart} className="btn btn-secondary sh-cta__btn">
            <IcRefresh s={16} /> {t('sortingHat.result.restart')}
          </button>
        </div>
      </div>
    </div>
  )
}
