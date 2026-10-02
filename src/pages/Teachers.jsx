import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useApi from '../hooks/useApi'
import ContentLangNote from '../i18n/ContentLangNote'

const KAFEDRALAR = [
  "Aniq fanlar kafedrasi",
  "Filologiya va tillarni o'qitish kafedrasi",
  "Ijtimoiy fanlar kafedrasi",
  "Ijtimoiy-gumanitar fanlar kafedrasi",
  "Iqtisodiyot va muhandislik kafedrasi",
  "Maktabgacha va boshlang'ich ta'lim kafedrasi",
]



const colors = ['#7c3aed','#4f46e5','#0088cc','#059669','#d97706','#db2777']

function KafedraSidebar({ teachers, activeKafedra, onSelect }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)

  // Dinamik kafedra ro'yxati — teachers dan olinadi. useApi noto'g'ri shakldagi
  // (array bo'lmagan) javob bersa ham ".map is not a function" bilan qulamasin.
  const list = Array.isArray(teachers) ? teachers : []
  const kafedralar = [...new Set(list.map(x => x.dept).filter(Boolean))].sort()

  return (
    <div className="card" style={{ padding: '1rem', position: 'sticky', top: '5rem' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: open ? '0.75rem' : 0 }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{t('teachers.departments')}</span>
        <svg style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div>
          <KafedraBtn label={t('teachers.all')} count={list.length} active={!activeKafedra} onClick={() => onSelect(null)} />
          {kafedralar.map(k => {
            const count = list.filter(x => x.dept === k).length
            return <KafedraBtn key={k} label={k} count={count} active={activeKafedra === k} onClick={() => onSelect(k)} />
          })}
        </div>
      )}
    </div>
  )
}

function KafedraBtn({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 4, background: active ? 'var(--gradient-brand)' : 'transparent', color: active ? '#fff' : 'var(--text)', fontSize: 12, fontWeight: 500, textAlign: 'left', lineHeight: 1.4 }}
    >
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 6, background: active ? 'rgba(255,255,255,.25)' : 'color-mix(in srgb, var(--color-brand) 10%, transparent)', color: active ? '#fff' : 'var(--color-brand)', padding: '1px 7px', borderRadius: 20 }}>{count}</span>
    </button>
  )
}

export default function Teachers() {
  const { t } = useTranslation()
  const { data: teachers, loading, error } = useApi(
    `${import.meta.env.VITE_API_URL}/api/teachers`,
    [] 
  )
  const [activeKafedra, setActiveKafedra] = useState(null)

  // useApi noto'g'ri shakldagi (array bo'lmagan) javob bersa ham qulamasin
  const teachersList = Array.isArray(teachers) ? teachers : []
  const filtered = activeKafedra ? teachersList.filter(x => x.dept === activeKafedra) : teachersList

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1.5rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>{t('teachers.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('teachers.subtitle')}</p>
        <ContentLangNote />
      </section>

      <section className="section">
        <div className="container">
          {error && (
            <div style={{ textAlign: 'center', padding: '0.75rem', marginBottom: '1rem', background: 'color-mix(in srgb, var(--color-brand) 6%, transparent)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', border: '1px solid var(--border)' }}>
              {t('teachers.offline')}
            </div>
          )}

          <div className="teachers-layout" style={{ display: 'grid', gridTemplateColumns: 'clamp(160px, 22%, 220px) 1fr', gap: '1.5rem', alignItems: 'start' }}>

            <KafedraSidebar teachers={teachers} activeKafedra={activeKafedra} onSelect={setActiveKafedra} />

            <div>
              {activeKafedra && (
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', padding: '8px 12px', background: 'color-mix(in srgb, var(--color-brand) 8%, transparent)', borderRadius: 8, border: '1px solid color-mix(in srgb, var(--color-brand) 20%, transparent)' }}>
                  {activeKafedra} — {t('teachers.count', { count: filtered.length })}
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--color-brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                  {t('common.loading')}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                  {filtered.map((tc, i) => (
                    <div key={tc._id || tc.id} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--color-on-brand)', fontSize: 18, fontWeight: 700 }}>
                        {tc.image
                          ? <img src={tc.image} alt={tc.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={ev => { ev.target.style.display = 'none' }} />
                          : (tc.avatar || tc.name?.slice(0,2).toUpperCase())}
                      </div>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)', lineHeight: 1.4 }} lang="uz">{tc.name}</h3>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-brand)', background: 'color-mix(in srgb, var(--color-brand) 10%, transparent)', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 6 }} lang="uz">{tc.role}</div>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }} lang="uz">{tc.dept}</p>
                      {tc.email && <p style={{ fontSize: 11, color: 'var(--color-brand)', marginTop: 4 }}>{tc.email}</p>}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: 13 }}>
                      {t('teachers.empty')}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}