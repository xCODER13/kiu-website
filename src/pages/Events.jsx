import { useEffect, useState } from 'react'

const FALLBACK_EVENTS = [
  { _id: 1, date: '28 mart', month: 'mart', title: "Ochiq eshiklar kuni", desc: "Abituriyentlar va ota-onalar uchun universitet bilan tanishuv kuni. Soat 10:00.", type: 'open' },
  { _id: 2, date: '1 aprel', month: 'aprel', title: "Navro'z sayli", desc: "Milliy bayram munosabati bilan o'tkaziladigan katta shodiyona tadbir.", type: 'culture' },
  { _id: 3, date: '15 aprel', month: 'aprel', title: "Ilmiy konferensiya", desc: "Talabalar va o'qituvchilar ishtirokidagi ilmiy-amaliy konferensiya.", type: 'science' },
  { _id: 4, date: '1 may', month: 'may', title: "Sport musobaqalari", desc: "Universitetlararo sport musobaqalari.", type: 'sport' },
  { _id: 5, date: '20 may', month: 'may', title: "Bitiruvchilar kuni", desc: "2024-2025 o'quv yili bitiruvchilari tantanali marosimi.", type: 'graduation' },
  { _id: 6, date: '1 iyul', month: 'iyul', title: "Qabul boshlanadi", desc: "2025-2026 o'quv yiliga hujjat qabul qilish boshlandi.", type: 'admission' },
]

const typeColors = {
  open:       { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed', label: 'Ochiq kun' },
  culture:    { bg: 'rgba(251,191,36,0.1)', color: '#d97706', label: 'Madaniy' },
  science:    { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', label: 'Ilmiy' },
  sport:      { bg: 'rgba(16,185,129,0.1)', color: '#059669', label: 'Sport' },
  graduation: { bg: 'rgba(236,72,153,0.1)', color: '#db2777', label: 'Bitiruvchilar' },
  admission:  { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed', label: 'Qabul' },
  general:    { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Umumiy' },
}

export default function Events() {
  const [events, setEvents] = useState(FALLBACK_EVENTS)

  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then(r => r.json())
      .then(data => { if (data.length > 0) setEvents(data) })
      .catch(() => {})
  }, [])

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Tadbirlar taqvimi</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU dagi yaqinlashib kelayotgan tadbirlar</p>
      </section>
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {events.map((e, ) => {
              const tc = typeColors[e.type] || typeColors.general
              return (
                <div key={e._id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{e.date?.split(' ')[0]}</div>
                    <div style={{ fontSize: 10, opacity: .8 }}>{e.month}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{e.title}</h3>
                      <span style={{ fontSize: 11, fontWeight: 600, color: tc.color, background: tc.bg, padding: '2px 8px', borderRadius: 20 }}>{tc.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{e.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}