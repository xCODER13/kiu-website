import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IC } from './faculty/Icons.jsx'
import { BAKALAVR, MAGISTRATURA } from './faculty/data'
import FacultyCard from './faculty/FacultyCard.jsx'
import FacultyModal from './faculty/FacultyModal.jsx'
import PageHero from '../components/PageHero.jsx'
import { fmt } from './faculty/utils'

/* ── Main Page ─────────────────────────────────────────────── */
export default function Faculty() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('bakalavr')
  const [modal, setModal] = useState(null)

  const list = tab === 'bakalavr' ? BAKALAVR : MAGISTRATURA

  // Davomiylik va "eng past narx" endi ro'yxatning o'zidan hisoblanadi (avval qo'lda yozilgan edi)
  const tabMeta = Object.fromEntries([['bakalavr', BAKALAVR], ['magistratura', MAGISTRATURA]].map(([key, items]) => [key, {
    count: items.length,
    years: items[0].years,
    from: Math.min(...items.map(p => p.price)),
  }]))

  const stats = [
    { v: tabMeta[tab].count,                                                       l: t('faculty.stats.programs') },
    { v: t('faculty.years', { count: tabMeta[tab].years }),                        l: t('faculty.stats.duration') },
    { v: t('faculty.price', { price: fmt(tabMeta[tab].from, t('meta.thousandsSep')) }), l: t('faculty.stats.lowestFee') },
    { v: t('faculty.studyForms.fullTime'),                                         l: t('faculty.stats.studyForm') },
  ]

  return (
    <div className="fade-up">
      <PageHero title={t('faculty.title')} sub={t('faculty.subtitle')} className="fac-hero">
        {/* Tab almashtirgich (pill): faol holat `data-active`, `aria-pressed` ekran o'quvchiga holatni aytadi */}
        <div className="kiu-tab-wrap">
          {['bakalavr', 'magistratura'].map(tabKey => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setTab(tabKey)}
              className="kiu-tab-btn"
              data-active={tab === tabKey}
              aria-pressed={tab === tabKey}
            >
              <span className="kiu-tab-icon">
                {tabKey === 'bakalavr' ? IC.graduation(16) : IC.building(16)}
              </span>
              {t(`faculty.degrees.${tabKey}`)}
              <span className="kiu-tab-badge">{tabMeta[tabKey].count}</span>
            </button>
          ))}
        </div>
      </PageHero>

      <section className="page-body fac-page">
        <div className="container-wide">
          {/* Statistika: bitta karta ichida 4 katak */}
          <div className="card fac-stats">
            {stats.map(({ v, l }) => (
              <div key={l} className="fac-stat">
                <div className="fac-stat__value">{v}</div>
                <div className="fac-stat__label">{l}</div>
              </div>
            ))}
          </div>

          {/* Kartalar */}
          <div className={`faculty-grid faculty-grid-${tab}`}>
            {list.map((f, i) => (
              <FacultyCard
                key={tab + '-' + f.id}
                f={f}
                index={i}
                onClick={() => setModal({ ...f, degree: tab })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {modal && (
        <FacultyModal
          f={modal}
          degree={modal.degree}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
