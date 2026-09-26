import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { API, H } from './shared/api'
import { card } from './shared/styles'
import { NAV } from './shared/constants'
import { Ic } from './shared/Icons.jsx'

export default function Stats() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    fetch(`${API}/stats`, { headers: H() }).then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  if (!stats) return <p style={{ color: 'var(--muted)', fontSize: 13 }}>Yuklanmoqda...</p>

  const cards = [
    { label: 'Yangiliklar',        value: stats.newsCount,     color: '#7c3aed', icon: Ic.news,    to: '/admin/news'         },
    { label: 'Tadbirlar',          value: stats.eventsCount,   color: '#e546e5', icon: Ic.events,  to: '/admin/events'       },
    { label: "O'qituvchilar",      value: stats.teachersCount, color: '#0088cc', icon: Ic.teach,   to: '/admin/teachers'     },
    { label: 'Yangi arizalar',       value: stats.newApps,     color: '#ff0015', icon: Ic.apps,    to: '/admin/applications' },
    { label: 'Qabul arizalari',    value: stats.appsCount,     color: '#059669', icon: Ic.apps,    to: '/admin/applications' },
    { label: 'Vakansiya arizalari',value: stats.vacancyApps,   color: '#d97706', icon: Ic.vacancy, to: '/admin/vacancies'    },
  ]

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>Statistika</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12, marginBottom: '2rem' }}>
        {cards.map(c => (
          <NavLink key={c.label} to={c.to} style={{ textDecoration: 'none' }}>
            <div style={{ ...card, borderLeft: `3px solid ${c.color}`, cursor: 'pointer', transition: 'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c.color }}>{c.value ?? 0}</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.label}</div>
            </div>
          </NavLink>
        ))}
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem' }}>Tezkor havolalar</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
        {NAV.slice(1).map(l => (
          <NavLink key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ color: '#7c3aed' }}>{l.icon}</div>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{l.label}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
