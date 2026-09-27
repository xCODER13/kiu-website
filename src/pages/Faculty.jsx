import { useState } from 'react'
import './faculty/faculty-styles.js'
import { IC } from './faculty/Icons.jsx'
import { BAKALAVR, MAGISTRATURA } from './faculty/data'
import FacultyCard from './faculty/FacultyCard.jsx'
import FacultyModal from './faculty/FacultyModal.jsx'

/* ── Main Page ─────────────────────────────────────────────── */
export default function Faculty() {
  const [tab, setTab] = useState('bakalavr')
  const [modal, setModal] = useState(null)

  const list = tab === 'bakalavr' ? BAKALAVR : MAGISTRATURA

  const tabMeta = {
    bakalavr:     { count: BAKALAVR.length,    duration: '4 yil', from: '12 850 000' },
    magistratura: { count: MAGISTRATURA.length, duration: '2 yil', from: '18 000 000' },
  }

  return (
    <div className="fade-up">
      {/* Hero */}
      <section style={{
        padding: '3rem 2rem 2rem',
        background: 'linear-gradient(135deg,#faf5ff 0%,#ede9fe 40%,#e0e7ff 100%)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text)', marginBottom: '.5rem' }}>Yo'nalishlar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: '1.75rem' }}>
          Xalqaro standartlarda yuqori sifatli ta'lim
        </p>

        {/* ✅ FIX 2: Tab switcher — markazlash wrapper + className-lar */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="kiu-tab-wrap">
            {['bakalavr', 'magistratura'].map(t => {
              const active = tab === t
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="kiu-tab-btn"
                  style={{
                    border: active ? 'none' : '1px solid rgba(124,58,237,.35)',
                    background: active ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'transparent',
                    color: active ? '#fff' : 'var(--text)',
                    boxShadow: active ? '0 3px 10px rgba(124,58,237,.35)' : 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: active ? '#fff' : '#7c3aed' }}>
                    {t === 'bakalavr' ? IC.graduation(15) : IC.building(15)}
                  </span>
                  {t === 'bakalavr' ? 'Bakalavr' : 'Magistratura'}
                  <span
                    className="kiu-tab-badge"
                    style={{
                      background: active ? 'rgba(255,255,255,.2)' : 'rgba(124,58,237,.15)',
                      color: active ? '#fff' : '#7c3aed',
                    }}
                  >
                    {tabMeta[t].count}
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
            { v: tabMeta[tab].count,           l: "Yo'nalish"    },
            { v: tabMeta[tab].duration,         l: 'Davomiyligi'  },
            { v: tabMeta[tab].from + " so'm",   l: 'Eng past narx' },
            { v: 'Kunduzgi',                    l: "O'qish shakli" },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{v}</div>
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
                key={tab + '-' + f.name}
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