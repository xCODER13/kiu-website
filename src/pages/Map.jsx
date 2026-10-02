import { useTranslation } from 'react-i18next'

export default function Map() {
  const { t } = useTranslation()
  const campus1 = "Qarshi+sh+Bahodir+Sherqulov+ko'chasi+7"
  const campus2 = "Qarshi+sh+Mustaqillik+ko'chasi+71"

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'var(--gradient-hero)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-text)', marginBottom: '.5rem' }}>{t('map.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('map.subtitle')}</p>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="card reveal" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-brand)', flexShrink: 0, fontSize: 16, fontWeight: 700 }}>1</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t('map.campus', { n: 1 })}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('university.address1')}</div>
              </div>
            </div>
            <div className="card reveal reveal-delay-1" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--color-brand-hover), #0088cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-brand)', flexShrink: 0, fontSize: 16, fontWeight: 700 }}>2</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t('map.campus', { n: 2 })}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('university.address2')}</div>
              </div>
            </div>
          </div>

          <div className="reveal" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            <iframe
              title={t('map.campus', { n: 1 })}
              src={`https://maps.google.com/maps?q=${campus1}&output=embed&z=15`}
              width="100%"
              height="350"
              style={{ border: 'none', display: 'block' }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div className="reveal" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <iframe
              title={t('map.campus', { n: 2 })}
              src={`https://maps.google.com/maps?q=${campus2}&output=embed&z=15`}
              width="100%"
              height="350"
              style={{ border: 'none', display: 'block' }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  )
}