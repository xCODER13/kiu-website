import { Trans, useTranslation } from 'react-i18next'
import { BENEFITS, REQUIREMENTS, DOCS_NEEDED } from './data'
import config from '../../config'
import { iconStyle } from './styles'

// "INFO TAB" bo'limi — Vacancies.jsx'dan o'zgarishsiz ko'chirilgan
// (banner, benefits grid, requirements, "qanday ariza topshirish" grid, CTA).
export default function InfoTab({ setActiveTab }) {
  const { t } = useTranslation()
  return (
    <div>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: 16, padding: '2.5rem', marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1rem' }}>{t('vacancies.info.whyTitle')}</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8 }}>
          {t('vacancies.info.whyText')}
        </p>
      </div>

      {/* Benefits */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>{t('vacancies.info.offerTitle')}</h2>
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {BENEFITS.map((b, i) => (
          <div key={i} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div className="vacancy-icon" style={iconStyle}>{b.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t(`vacancies.info.benefits.${b.id}.title`)}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t(`vacancies.info.benefits.${b.id}.desc`)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Requirements */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>{t('vacancies.info.reqTitle')}</h2>
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REQUIREMENTS.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{t(`vacancies.info.requirements.${r}`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to apply */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>{t('vacancies.info.howTitle')}</h2>
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="vacancy-icon" style={{ ...iconStyle, width: 32, height: 32 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            {t('vacancies.info.byEmail')}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            <Trans i18nKey="vacancies.info.sendDocs" values={{ email: config.contact.email }} components={{ b: <strong style={{ color: '#7c3aed' }} /> }} />
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DOCS_NEEDED.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                <span style={{ color: '#7c3aed' }}>{d.icon}</span> {t(`vacancies.docs.${d.id}`)}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', padding: '10px 12px', background: 'rgba(124,58,237,.05)', borderRadius: 8, border: '1px solid rgba(124,58,237,.15)', fontSize: 12, color: 'var(--muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  <Trans i18nKey="vacancies.info.reviewTime" components={{ b: <strong style={{ color: 'var(--text)' }} /> }} />
</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="vacancy-icon" style={{ ...iconStyle, width: 32, height: 32 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.58 4.88C1.58 3.85 2.35 3 3.39 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18v-.08z"/></svg>
            </div>
            {t('vacancies.info.contact')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: t('vacancies.info.phone1'), value: '+998 91 961 11 00' },
              { label: t('vacancies.info.phone2'), value: '+998 91 211 54 52' },
              { label: 'Email', value: 'info@kiu.uz' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setActiveTab('form')} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 14 }}>
          {t('vacancies.info.cta')}
        </button>
      </div>
    </div>
  )
}