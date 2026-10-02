import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
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
  const [open, setOpen] = useState(null)   // bir vaqtda faqat bitta savol ochiq

  return (
    <div className="fade-up">
      <PageHero title={t('faq.title')} sub={t('faq.subtitle')} />

      <section className="section">
        <div className="container container--820 faq-list">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="rv-item reveal">
                <div className="card faq-card" data-open={isOpen}>
                  <h2 className="faq-card__heading">
                    <button
                      type="button"
                      className="faq-card__q"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${i}`}
                      id={`faq-question-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span>{faq.q}</span>
                      <span className="faq-card__chev" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </button>
                  </h2>
                  {isOpen && (
                    <div id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`}>
                      <p className="faq-card__a">{faq.a}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
