import { useTranslation } from 'react-i18next'
import ContentLangNote from '../i18n/ContentLangNote'

// Sarlavha/tavsif i18n'da (documents.items.<id>); PDF fayllarning o'zi o'zbekcha
const DOCS = [
  { 
    id: 'license1',
    url: '/docs/Litsenziya-KIU-1.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> 
  },
  { 
    id: 'license2',
    url: '/docs/Litsenziya-KIU-2.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> 
  },
  { 
    id: 'accreditation',
    url: '/docs/Guvohnoma.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg> 
  },
  { 
    id: 'collective',
    url: '/docs/KIU-Jamoa-shartnomasi-2026-2026.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 
  },
  { 
    id: 'labor',
    url: '/docs/Ichki-mehnat-tartib-qoidalari-2026.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> 
  },
  { 
    id: 'ethics',
    url: '/docs/Odob-axloq-kodeksi.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> 
  },
  
]
export default function Documents() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'var(--gradient-hero)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-text)', marginBottom: '.5rem' }}>{t('documents.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('documents.subtitle')}</p>
        <ContentLangNote />
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {DOCS.map((doc, i) => (
              <a key={i}
  href={doc.url}
  target="_blank"
  rel="noopener noreferrer"
  style={{ textDecoration: 'none' }}>
                <div className={`card reveal reveal-delay-${(i % 4) + 1}`} style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
                  <div className="doc-icon" style={{ width: 44, height: 44, borderRadius: 10, background: 'color-mix(in srgb, var(--color-brand) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)', flexShrink: 0 }}>
                    {doc.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t(`documents.items.${doc.id}.title`)}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t(`documents.items.${doc.id}.desc`)}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}