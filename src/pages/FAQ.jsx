import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useJsonLd from '../hooks/useJsonLd'

// Savol/javoblar matni i18n'da (faq.items) — bu yerda faqat soni. Massiv tilga qarab
// alohida olinadi (returnObjects), JSON-LD ham shu tilda quriladi.
function buildFaqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export default function FAQ() {
  const { t } = useTranslation()
  const faqs = t('faq.items', { returnObjects: true })
  // useMemo: useJsonLd barqaror referensga tayanadi (har render'da script qayta yaratilmasin)
  const schema = useMemo(() => buildFaqSchema(faqs), [faqs])
  useJsonLd('jsonld-faq', schema)
  const [open, setOpen] = useState(null)

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'var(--gradient-hero)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-text)', marginBottom: '.5rem' }}>{t('faq.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('faq.subtitle')}</p>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          {faqs.map((faq, i) => (
            <div key={i} className="reveal" style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: open === i ? 'var(--color-brand)' : 'var(--text)' }}>{faq.q}</span>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: open === i ? 'linear-gradient(135deg,var(--color-brand),var(--color-brand-hover))' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={open === i ? '#fff' : 'var(--color-brand)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {open === i ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                  </svg>
                </div>
              </button>
              {open === i && (
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, paddingBottom: '1rem' }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}