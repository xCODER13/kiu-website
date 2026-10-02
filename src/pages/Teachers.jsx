import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useApi from '../hooks/useApi'
import ContentLangNote from '../i18n/ContentLangNote'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'

function KafedraSidebar({ teachers, activeKafedra, onSelect }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)

  // Dinamik kafedra ro'yxati — teachers dan olinadi. useApi noto'g'ri shakldagi
  // (array bo'lmagan) javob bersa ham ".map is not a function" bilan qulamasin.
  const list = Array.isArray(teachers) ? teachers : []
  const kafedralar = [...new Set(list.map(x => x.dept).filter(Boolean))].sort()

  return (
    <aside className="card kafedra-card" aria-label={t('teachers.departments')}>
      <button
        type="button"
        className="kafedra-toggle"
        aria-expanded={open}
        aria-controls="kafedra-list"
        onClick={() => setOpen(p => !p)}
      >
        <span className="kafedra-toggle__label">{t('teachers.departments')}</span>
        <Icon size={16}><polyline points="6 9 12 15 18 9" /></Icon>
      </button>

      {open && (
        <div id="kafedra-list" className="kafedra-list">
          <KafedraBtn label={t('teachers.all')} count={list.length} active={!activeKafedra} onClick={() => onSelect(null)} />
          {kafedralar.map(k => {
            const count = list.filter(x => x.dept === k).length
            return <KafedraBtn key={k} label={k} count={count} active={activeKafedra === k} onClick={() => onSelect(k)} />
          })}
        </div>
      )}
    </aside>
  )
}

function KafedraBtn({ label, count, active, onClick }) {
  return (
    <button type="button" className="kafedra-btn" data-active={active} aria-pressed={active} onClick={onClick}>
      <span className="kafedra-btn__label">{label}</span>
      <span className="kafedra-btn__count">{count}</span>
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
      <PageHero title={t('teachers.title')} sub={t('teachers.subtitle')} note={<ContentLangNote />} />

      <section className="section">
        <div className="container container-wide">
          {error && (
            <div className="notice-banner" role="status">
              <Icon size={20}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>
              <span>{t('teachers.offline')}</span>
            </div>
          )}

          <div className="teachers-layout">
            <KafedraSidebar teachers={teachers} activeKafedra={activeKafedra} onSelect={setActiveKafedra} />

            <div className="teachers-main">
              {activeKafedra && (
                <div className="kafedra-selected">
                  {activeKafedra} <span>— {t('teachers.count', { count: filtered.length })}</span>
                </div>
              )}

              {loading ? (
                <div className="page-loading">
                  <div className="spinner" />
                  {t('common.loading')}
                </div>
              ) : filtered.length === 0 ? (
                <div className="card teachers-empty">
                  <div className="tile tile--64">
                    <Icon size={30}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>
                  </div>
                  <p>{t('teachers.empty')}</p>
                </div>
              ) : (
                <div className="teachers-grid">
                  {filtered.map((tc, i) => (
                    <div key={tc._id || tc.id} className={`rv-item reveal reveal-delay-${(i % 3) + 1}`}>
                      <div className="card card--lift teacher-card">
                        {/* Rasm yuklanmasa yoki bo'lmasa — bosh harflar ko'rinib turadi (rasm ustida yotadi) */}
                        <div className="avatar-wine teacher-card__avatar">
                          <span aria-hidden="true">{tc.avatar || tc.name?.slice(0, 2).toUpperCase()}</span>
                          {tc.image && (
                            <img src={tc.image} alt={tc.name} loading="lazy" onError={ev => { ev.currentTarget.dataset.broken = 'true' }} />
                          )}
                        </div>
                        <h3 className="teacher-card__name" lang="uz">{tc.name}</h3>
                        <div className="pill-brand teacher-card__role" lang="uz">{tc.role}</div>
                        <p className="teacher-card__dept" lang="uz">{tc.dept}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
