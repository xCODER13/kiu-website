import { NavLink } from 'react-router-dom'
import config from '../config'

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '2.5rem 0 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', paddingBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>{config.university.name}</h3>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
            Xalqaro standartlarda ta'lim va ilmiy tadqiqot markazi. {config.university.founded} yildan buyon Qashqadaryo viloyatida sifatli ta'lim.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={config.social.telegram} aria-label="Telegram" target="_blank" rel="noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
            </a>
            <a href={config.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="二十" height="二十" rx="五" ry="五"/><path d="M十六 十一点三七A四 四 0 一 一 十二点六三 八 四 四 没有 没有 十六 十一點三七z"/><line x1="十七点五" y1="六点五" x2="十七点五一" y２="六点五"/></svg>
            </a>
            <a href={config.social.youtube} aria-label="YouTube" target="_blank" rel="noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
            </a>
            <a href={config.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb', marginBottom: 10 }}>Universitet</h4>
          {[
            ['/about', 'Biz haqimizda'],
            ['/teachers', "O'qituvchilar"],
            ['/international', 'Xalqaro hamkorlik'],
            ['/documents', 'Normativ hujjatlar'],
            ['/vacancies', "Bo'sh ish o'rinlari"],
            ['/hemis', 'Elektron universitet'],
          ].map(([to, label]) => (
            <NavLink key={to} to={to} style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 5 }}
              onMouseEnter={e => e.target.style.color='#a78bfa'}
              onMouseLeave={e => e.target.style.color='#6b7280'}
            >{label}</NavLink>
          ))}
        </div>

        <div>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb', marginBottom: 10 }}>Talabalar</h4>
          {[
            ['/faculty', 'Yonalishlar'],
            ['/admission', 'Qabul'],
            ['/events', 'Tadbirlar'],
            ['/achievements', 'Yutuqlar'],
            ['/testimonials', 'Sharhlar'],
            ['/faq', 'FAQ'],
            ['/chatbot', 'AI Yordamchi'],
          ].map(([to, label]) => (
            <NavLink key={to} to={to} style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 5 }}
              onMouseEnter={e => e.target.style.color='#a78bfa'}
              onMouseLeave={e => e.target.style.color='#6b7280'}
            >{label}</NavLink>
          ))}
        </div>

        <div>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb', marginBottom: 10 }}>Bog'lanish</h4>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{config.contact.phone}</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{config.contact.email}</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>{config.contact.workHours}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['/gallery', 'Fotogalerеya',<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>],
              ['/map', 'Xarita', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 10 18 10 2 1 6"/><polygon points="14 2 14 18 23 22 23 6 14 2z"/></svg>],
              ['/qrcode', 'QR Kod',<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><path d="M17 17h4v4M17 21h4"/></svg>],
            ].map(([to, label, icon]) => (
              <NavLink key={to} to={to} style={{ fontSize: 12, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{icon}</span> {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1rem', paddingBottom: '1.25rem', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4b5563', flexWrap: 'wrap', gap: 8 }}>
        <span>© 2026 {config.university.name}. Barcha huquqlar himoyalangan.</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <NavLink to="/about" style={{ color: '#6b7280', fontSize: 11 }}>Biz haqimizda</NavLink>
          <NavLink to="/documents" style={{ color: '#6b7280', fontSize: 11 }}>Hujjatlar</NavLink>
          <NavLink to="/vacancies" style={{ color: '#6b7280', fontSize: 11 }}>Vakansiyalar</NavLink>
        </div>
      </div>
    </footer>
  )
}