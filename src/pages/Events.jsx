import { useMemo } from 'react'
import useApi from '../hooks/useApi'
import useJsonLd from '../hooks/useJsonLd'
import config from '../config'

const SITE_URL = 'https://kiu-university.vercel.app'
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']

// eventDate — to'liq ISO sana (yil bilan). Avval date/month alohida matn
// sifatida (yilsiz) saqlanardi — bazaga ham, shu yerga ham eventDate qo'shildi.
const FALLBACK_EVENTS = [
  { _id: 1, eventDate: '2026-03-28', title: "Ochiq eshiklar kuni", desc: "Abituriyentlar va ota-onalar uchun universitet bilan tanishuv kuni. Soat 10:00.", type: 'open' },
  { _id: 2, eventDate: '2026-04-01', title: "Navro'z sayli", desc: "Milliy bayram munosabati bilan o'tkaziladigan katta shodiyona tadbir.", type: 'culture' },
  { _id: 3, eventDate: '2026-04-15', title: "Ilmiy konferensiya", desc: "Talabalar va o'qituvchilar ishtirokidagi ilmiy-amaliy konferensiya.", type: 'science' },
  { _id: 4, eventDate: '2026-05-01', title: "Sport musobaqalari", desc: "Universitetlararo sport musobaqalari.", type: 'sport' },
  { _id: 5, eventDate: '2026-05-20', title: "Bitiruvchilar kuni", desc: "2025-2026 o'quv yili bitiruvchilari tantanali marosimi.", type: 'graduation' },
  { _id: 6, eventDate: '2026-07-01', title: "Qabul boshlanadi", desc: "2026-2027 o'quv yiliga hujjat qabul qilish boshlandi.", type: 'admission' },
]

// Kartochkadagi kun/oy nishonchasi va sana matni uchun — eventDate'dan (ISO)
// kun, oy nomi va yilni ajratib oladi.
function formatEventDate(iso) {
  if (!iso) return { day: '', month: '', year: '', full: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '', month: '', year: '', full: '' }
  const day = d.getUTCDate()
  const month = UZ_MONTHS[d.getUTCMonth()] || ''
  const year = d.getUTCFullYear()
  return { day: String(day), month, year: String(year), full: `${day} ${month} ${year}` }
}

const typeColors = {
  open:       { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', label: 'Ochiq kun' },
  culture:    { bg: 'rgba(251,191,36,0.1)', color: '#d97706', label: 'Madaniy' },
  science:    { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', label: 'Ilmiy' },
  sport:      { bg: 'rgba(16,185,129,0.1)', color: '#059669', label: 'Sport' },
  graduation: { bg: 'rgba(236,72,153,0.1)', color: '#db2777', label: 'Bitiruvchilar' },
  admission:  { bg: 'rgba(161,98,7,0.1)', color: '#a16207', label: 'Qabul' },
  general:    { bg: 'rgba(15,118,110,0.1)', color: '#0f766e', label: 'Umumiy' },
}

export default function Events() {
  const { data: events, loading, error } = useApi(
    `${import.meta.env.VITE_API_URL}/api/events`,
    FALLBACK_EVENTS
  )

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
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Tadbirlar taqvimi</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU dagi yaqinlashib kelayotgan tadbirlar</p>
      </section>
      <section className="section">
        <div className="container">
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Yuklanmoqda...
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', padding: '0.75rem', marginBottom: '1rem', background: 'rgba(124,58,237,.06)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', border: '1px solid var(--border)' }}>
              Serverga ulanib bo'lmadi — saqlangan ma'lumotlar ko'rsatilmoqda
            </div>
          )}
          {!loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* useApi noto'g'ri shakldagi (array bo'lmagan) javob bersa ham
                  ".map is not a function" bilan qulamasin */}
              {(Array.isArray(events) ? events : []).map((e) => {
                const tc = typeColors[e.type] || typeColors.general
                const fd = formatEventDate(e.eventDate)
                return (
                  <div key={e._id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
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
                        <div style={{ fontSize: 10, opacity: .8 }}>{fd.month}</div>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{e.title}</h3>
                        <span style={{ fontSize: 11, fontWeight: 600, color: tc.color, background: tc.bg, padding: '2px 8px', borderRadius: 20 }}>{tc.label}</span>
                        {e.image && (
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{fd.full}</span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{e.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}