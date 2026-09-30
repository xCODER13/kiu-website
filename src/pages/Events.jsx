import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import useApi from '../hooks/useApi'
import useJsonLd from '../hooks/useJsonLd'
import config from '../config'
import ContentLangNote from '../i18n/ContentLangNote'

const API = import.meta.env.VITE_API_URL
const SITE_URL = 'https://kiu-university.vercel.app'

// Kartochkadagi kun/oy nishonchasi va sana matni uchun — eventDate'dan (ISO)
// kun, oy nomi va yilni ajratib oladi. Oy nomlari tarjima faylidan (events.months /
// events.monthsShort) olinadi — brauzer/ICU sozlamasiga bog'liq emas.
// month — to'liq nom (sana matni), monthShort — kichik nishoncha uchun.
function formatEventDate(iso, t) {
  const empty = { day: '', month: '', monthShort: '', year: '', full: '' }
  if (!iso) return empty
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return empty
  const day = d.getUTCDate()
  const idx = d.getUTCMonth()
  const month = t('events.months', { returnObjects: true })[idx] || ''
  const monthShort = t('events.monthsShort', { returnObjects: true })[idx] || ''
  const year = d.getUTCFullYear()
  return { day: String(day), month, monthShort, year: String(year), full: t('events.dateFull', { day, month, year }) }
}

// Nomi (label) tarjima faylidan: events.types.<tur>
const typeColors = {
  open:       { bg: 'rgba(220,38,38,0.1)', color: '#dc2626' },
  culture:    { bg: 'rgba(251,191,36,0.1)', color: '#d97706' },
  science:    { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' },
  sport:      { bg: 'rgba(16,185,129,0.1)', color: '#059669' },
  graduation: { bg: 'rgba(236,72,153,0.1)', color: '#db2777' },
  admission:  { bg: 'rgba(161,98,7,0.1)', color: '#a16207' },
  general:    { bg: 'rgba(15,118,110,0.1)', color: '#0f766e' },
}

function getTypeInfo(type, t) {
  const key = typeColors[type] ? type : 'general'
  return { ...typeColors[key], label: t(`events.types.${key}`) }
}

// Band 6 (admin statistika — "tadbirlar ko'rilishi"): Events sahifasida avval
// alohida "detail" sahifa/modal yo'q edi, shuning uchun ko'rish sonini
// kuzatib bo'lmasdi. Endi kartaga bosilganda shu kengaytirilgan ko'rinish
// ochiladi va PUT /api/events/:id/view chaqiriladi (News'dagi PUT /:id/view
// bilan bir xil naqsh). Modal FacultyModal.jsx'dagi eng so'nggi/eng
// accessible naqshga (portal + inert + focus qaytarish + Esc) qurilgan.
function EventModal({ event, typeInfo, dateInfo, onClose }) {
  const { t } = useTranslation()
  const closeBtnRef = useRef(null)

  useEffect(() => {
    const scrollW = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = scrollW + 'px'
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  useEffect(() => {
    const root = document.getElementById('root')
    const previouslyFocused = document.activeElement
    if (root) root.inert = true
    closeBtnRef.current?.focus()
    return () => {
      if (root) root.inert = false
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [])

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(10,10,30,.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem', overflowY: 'auto' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        style={{ background: 'var(--bg)', borderRadius: 18, padding: '1.5rem', maxWidth: 480, width: '100%', maxHeight: 'calc(100vh - 1.5rem)', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,.35)', position: 'relative' }}
      >
        <button
          ref={closeBtnRef}
          onClick={onClose}
          title={t('events.closeHint')}
          aria-label={t('events.closeLabel')}
          style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }}
            onError={ev => { ev.target.style.display = 'none' }}
          />
        )}
        <span style={{ fontSize: 11, fontWeight: 600, color: typeInfo.color, background: typeInfo.bg, padding: '3px 10px', borderRadius: 20 }}>{typeInfo.label}</span>
        <h3 id="event-modal-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '10px 0 4px', fontFamily: 'var(--font-body)' }}>{event.title}</h3>
        {dateInfo.full && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{dateInfo.full}</div>}
        <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{event.desc}</p>
      </div>
    </div>,
    document.body
  )
}

export default function Events() {
  const { t } = useTranslation()
  const { data: events, loading, error } = useApi(
    `${API}/api/events`,
    // fallback ma'lumotlar ishlatilmaydi, chunki ular faqat frontend'da ko'rsatiladi, backend'da esa haqiqiy ma'lumotlar bo'lmasa ham bo'sh array qaytariladi
    []
  )
  const [activeEvent, setActiveEvent] = useState(null)

  // Modal ochilganda "ko'rish" sifatida hisoblanadi — News'dagi PUT /:id/view
  // bilan bir xil naqsh, auth talab qilmaydi. So'rov muvaffaqiyatsiz bo'lsa
  // ham (masalan fallback ma'lumot ishlatilayotganda, _id haqiqiy emas)
  // modalning ochilishiga xalaqit bermaydi — shuning uchun natija kutilmaydi.
  function openEvent(e) {
    setActiveEvent(e)
    fetch(`${API}/api/events/${e._id}/view`, { method: 'PUT' }).catch(() => {})
  }

  // events fetch tugagandagina yangi referensga ega bo'ladi (useApi.js) —
  // shuning uchun bu har render'da emas, faqat ma'lumot chindan o'zgarganda
  // qayta hisoblanadi (keraksiz script qayta yaratilmaydi)
  const eventsSchema = useMemo(() => {
    const valid = (Array.isArray(events) ? events : []).filter(e => e.eventDate && !Number.isNaN(new Date(e.eventDate).getTime()))
    if (valid.length === 0) return null
    return valid.map(e => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: e.title,
      description: e.desc || undefined,
      startDate: e.eventDate,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      image: e.image || undefined,
      location: {
        '@type': 'Place',
        name: config.university.name,
        address: config.contact.address1,
      },
      organizer: { '@type': 'Organization', name: config.university.name, url: SITE_URL },
    }))
  }, [events])
  useJsonLd('jsonld-events', eventsSchema)

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>{t('events.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('events.subtitle')}</p>
        <ContentLangNote />
      </section>
      <section className="section">
        <div className="container">
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              {t('common.loading')}
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', padding: '0.75rem', marginBottom: '1rem', background: 'rgba(124,58,237,.06)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', border: '1px solid var(--border)' }}>
              {t('events.offline')}
            </div>
          )}
          {!loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* useApi noto'g'ri shakldagi (array bo'lmagan) javob bersa ham
                  ".map is not a function" bilan qulamasin */}
              {(Array.isArray(events) ? events : []).map((e) => {
                const tc = getTypeInfo(e.type, t)
                const fd = formatEventDate(e.eventDate, t)
                return (
                  <div
                    key={e._id}
                    className="card"
                    role="button"
                    tabIndex={0}
                    onClick={() => openEvent(e)}
                    onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openEvent(e) } }}
                    style={{ display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer' }}
                  >
                    {e.image ? (
                      <img
                        src={e.image}
                        alt={e.title}
                        loading="lazy"
                        style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                        onError={ev => { ev.target.style.display = 'none' }}
                      />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{fd.day}</div>
                        <div style={{ fontSize: 10, opacity: .8 }}>{fd.monthShort}</div>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }} lang="uz">{e.title}</h3>
                        <span style={{ fontSize: 11, fontWeight: 600, color: tc.color, background: tc.bg, padding: '2px 8px', borderRadius: 20 }}>{tc.label}</span>
                        {e.image && (
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{fd.full}</span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }} lang="uz">{e.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {activeEvent && (
        <EventModal
          event={activeEvent}
          typeInfo={getTypeInfo(activeEvent.type, t)}
          dateInfo={formatEventDate(activeEvent.eventDate, t)}
          onClose={() => setActiveEvent(null)}
        />
      )}
    </div>
  )
}