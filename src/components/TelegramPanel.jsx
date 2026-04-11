import { useState } from 'react'
import config from '../config'

const DEMO_POSTS = [
  { id: 1, text: "Qabul hujjatlari to'plami yangilandi", date: 'Bugun 09:45', type: 'announce' },
  { id: 2, text: 'Stipendiya arizalari: 25-martgacha qabul qilinadi.', date: 'Kecha 14:20', type: 'edu' },
  { id: 3, text: 'Ochiq eshiklar kuni — 28-mart soat 10:00.', date: '13 mart', type: 'calendar' },
  { id: 4, text: "Yangi laboratoriya jihozlari o'rnatildi", date: '12 mart', type: 'check' },
]

const TgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
  </svg>
)

const PostIcon = ({ type }) => {
  if (type === 'announce') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  )
  if (type === 'edu') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
  if (type === 'calendar') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
  if (type === 'check') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

export default function TelegramPanel() {
  const [posts] = useState(DEMO_POSTS)

  return (
    <div className="tg-box" style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Head */}
      <div className="tg-head" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.9rem 1.1rem', background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0088cc, #0055aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          <TgIcon />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{config.telegram.username}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Rasmiy Telegram kanal</div>
        </div>
        <span style={{ marginLeft: 'auto', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>LIVE</span>
      </div>

      {/* Messages */}
      <div style={{ padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {posts.map(p => (
          <div key={p.id} className="tg-msg" style={{ background: '#faf5ff', borderRadius: '12px 12px 12px 4px', padding: '9px 11px', border: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div className="tg-msg-icon" style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0, border: '1px solid var(--border)' }}>
              <PostIcon type={p.type} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: '#1a1a2e' }}>{p.text}</p>
              <time style={{ fontSize: 10, color: 'var(--muted)', display: 'block', textAlign: 'right', marginTop: 3 }}>{p.date}</time>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="tg-foot" style={{ padding: '.75rem 1.1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
        <a href={config.telegram.url} target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #0088cc, #0055aa)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}>
          <TgIcon />
          Kanalga obuna bo'lish
        </a>
      </div>
    </div>
  )
}