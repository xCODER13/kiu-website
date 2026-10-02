import { useTranslation } from 'react-i18next'

const REVIEWS = [
  { id: 1, name: "Aziza Karimova", year: 3, avatar: "AK" },
  { id: 2, name: "Jasur Toshmatov", year: 2, avatar: "JT" },
  { id: 3, name: "Malika Yusupova", year: 4, avatar: "MY" },
  { id: 4, name: "Bobur Rahimov", year: 1, avatar: "BR" },
  { id: 5, name: "Nilufar Hasanova", year: 3, avatar: "NH" },
  { id: 6, name: "Sardor Mirzayev", year: 'graduate', avatar: "SM" },
]

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

export default function Testimonials() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>{t('testimonials.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('testimonials.subtitle')}</p>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {REVIEWS.map((r, i) => (
              <div key={r.id} className={`card reveal reveal-delay-${(i % 4) + 1}`}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {[1,2,3,4,5].map(s => <StarIcon key={s} />)}
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>"{t(`testimonials.reviews.${r.id}.text`)}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-brand)', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                    {r.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t(`testimonials.reviews.${r.id}.faculty`)} · {r.year === 'graduate' ? t('testimonials.graduate') : t('testimonials.year', { n: r.year })}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 