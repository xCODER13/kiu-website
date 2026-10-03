import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import useApi from '../hooks/useApi'
import useJsonLd from '../hooks/useJsonLd'
import config from '../config'
import ContentLangNote from '../i18n/ContentLangNote'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'

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

// Tur chip'i: nomi (label) tarjima faylidan (events.types.<tur>), rangi CSS da (`.ev-chip[data-type]` → `--chart-N`,
// qotirilgan 4.4 palitrasi). Noma'lum tur → `general`.
const EVENT_TYPES = ['general', 'graduation', 'sport', 'culture', 'open', 'admission', 'science']

function getTypeInfo(type, t) {
  const key = EVENT_TYPES.includes(type) ? type : 'general'
  return { key, label: t(`events.types.${key}`) }
}

const CalendarIcon = ({ size = 16 }) => (
  <Icon size={size}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Icon>
)

function TypeChip({ typeInfo }) {
  return (
    <span className="ev-chip" data-type={typeInfo.key}>
      <span className="cat-dot" aria-hidden="true" />
      {typeInfo.label}
    </span>
  )
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
    <div className="ev-modal-overlay" onClick={onClose}>
      <div
        className="ev-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="ev-modal__close"
          data-over-image={event.image ? 'true' : undefined}
          onClick={onClose}
          title={t('events.closeHint')}
          aria-label={t('events.closeLabel')}
        >
          <Icon size={18}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
        </button>

        {event.image && (
          <img
            className="ev-modal__img"
            src={event.image}
            alt={event.title}
            onError={ev => { ev.currentTarget.dataset.broken = 'true' }}
          />
        )}
        <TypeChip typeInfo={typeInfo} />
        <h2 id="event-modal-title" className="ev-modal__title" lang="uz">{event.title}</h2>
        {dateInfo.full && <div className="ev-when ev-when--lg"><CalendarIcon />{dateInfo.full}</div>}
        <p className="ev-modal__desc" lang="uz">{event.desc}</p>
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
      <PageHero title={t('events.title')} sub={t('events.subtitle')} note={<ContentLangNote />} />
      <section className={`page-body${error && !loading && !(Array.isArray(events) && events.length) ? ' page-body--offline' : ''}`}>
        <div className="container container--920">
          {loading && (
            <div className="page-loading">
              <div className="spinner" />
              {t('common.loading')}
            </div>
          )}
          {error && (
            <div className="notice-banner" role="status">
              <Icon size={20}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>
              <span>{t('events.offline')}</span>
            </div>
          )}
          {!loading && (
            <div className="ev-list">
              {/* useApi noto'g'ri shakldagi (array bo'lmagan) javob bersa ham
                  ".map is not a function" bilan qulamasin */}
              {(Array.isArray(events) ? events : []).map((e) => {
                const ti = getTypeInfo(e.type, t)
                const fd = formatEventDate(e.eventDate, t)
                return (
                  <div key={e._id} className="rv-item reveal">
                    <div
                      className="card card--lift ev-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => openEvent(e)}
                      onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openEvent(e) } }}
                    >
                      {/* Sana plitkasi har doim chapda (rasm bo'lsa ham) */}
                      <div className="ev-date" aria-hidden="true">
                        {fd.day ? (
                          <>
                            <div className="ev-date__day">{fd.day}</div>
                            <div className="ev-date__month">{fd.monthShort}</div>
                          </>
                        ) : <CalendarIcon size={30} />}
                      </div>
                      <div className="ev-body">
                        <div className="ev-head">
                          <h2 className="ev-title" lang="uz">{e.title}</h2>
                          <TypeChip typeInfo={ti} />
                        </div>
                        {fd.full && <div className="ev-when"><CalendarIcon />{fd.full}</div>}
                        <p className="ev-desc" lang="uz">{e.desc}</p>
                      </div>
                      {e.image && (
                        <img
                          className="ev-img"
                          src={e.image}
                          alt={e.title}
                          loading="lazy"
                          onError={ev => { ev.currentTarget.dataset.broken = 'true' }}
                        />
                      )}
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