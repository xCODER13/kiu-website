import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './faculty/faculty-styles.js'
import { IC } from './faculty/Icons.jsx'
import { BAKALAVR, MAGISTRATURA } from './faculty/data'
import FacultyCard from './faculty/FacultyCard.jsx'
import FacultyModal from './faculty/FacultyModal.jsx'
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

  return (
    <div className="fade-up">
      {/* Hero */}
      <section style={{
        padding: '3rem 2rem 2rem',
        background: 'var(--gradient-hero)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text)', marginBottom: '.5rem' }}>{t('faculty.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: '1.75rem' }}>
          {t('faculty.subtitle')}
        </p>

        {/* ✅ FIX 2: Tab switcher — markazlash wrapper + className-lar */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="kiu-tab-wrap">
            {['bakalavr', 'magistratura'].map(tabKey => {
              const active = tab === tabKey
              return (
                <button
                  key={tabKey}
                  onClick={() => setTab(tabKey)}
                  className="kiu-tab-btn"
                  style={{
                    border: active ? 'none' : '1px solid color-mix(in srgb, var(--color-brand) 35%, transparent)',
                    background: active ? 'linear-gradient(135deg,var(--color-brand),var(--color-brand-hover))' : 'transparent',
                    color: active ? '#fff' : 'var(--text)',
                    boxShadow: active ? '0 3px 10px color-mix(in srgb, var(--color-brand) 35%, transparent)' : 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: active ? '#fff' : 'var(--color-brand)' }}>
                    {tabKey === 'bakalavr' ? IC.graduation(15) : IC.building(15)}
                  </span>
                  {t(`faculty.degrees.${tabKey}`)}
                  <span
                    className="kiu-tab-badge"
                    style={{
                      background: active ? 'rgba(255,255,255,.2)' : 'color-mix(in srgb, var(--color-brand) 15%, transparent)',
                      color: active ? '#fff' : 'var(--color-brand)',
                    }}
                  >
                    {tabMeta[tabKey].count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '.9rem 2rem',
      }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'center',
          gap: '2.5rem', flexWrap: 'wrap',
        }}>
          {[
            { v: tabMeta[tab].count,                                         l: t('faculty.stats.programs') },
            { v: t('faculty.years', { count: tabMeta[tab].years }),               l: t('faculty.stats.duration') },
            { v: t('faculty.price', { price: fmt(tabMeta[tab].from, t('meta.thousandsSep')) }), l: t('faculty.stats.lowestFee') },
            { v: t('faculty.studyForms.fullTime'),                            l: t('faculty.stats.studyForm') },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-brand)' }}>{v}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <section className="section">
        <div className="container-wide">
          <div className={`grid-auto faculty-grid-${tab}`}>
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