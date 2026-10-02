import { Trans, useTranslation } from 'react-i18next'
import { errorBorder } from '../../utils/validation'
import { POSITIONS, FACULTIES, EDUCATION, EXPERIENCE, DOCS_NEEDED } from './data'
import config from '../../config'
import { inputStyle, labelStyle, sectionBoxStyle, sectionTitleStyle } from './styles'

// "FORM TAB" bo'limi — Vacancies.jsx'dan o'zgarishsiz ko'chirilgan
// (forma va muvaffaqiyat/success ekrani ikkalasi ham shu yerda,
// asl faylda ham bir-biriga bog'liq `sent` holati orqali almashtirilgan edi).
export default function ApplicationForm({
  form, fieldErrors, loading, error, sent,
  handleChange, handleSubmit, onNewApplication, setActiveTab,
}) {
  const { t } = useTranslation()
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {!sent ? (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#1a1a2e', marginBottom: '.5rem' }}>{t('vacancies.form.title')}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>{t('vacancies.form.subtitle')}</p>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Shaxsiy */}
            <div style={sectionBoxStyle}>
              <div style={sectionTitleStyle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {t('vacancies.form.personal')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={labelStyle}>{t('vacancies.form.fullName')}</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder={t('vacancies.form.fullNamePh')} style={errorBorder(fieldErrors.fullName, inputStyle)} />
                  {fieldErrors.fullName && <div style={{ fontSize: 11.5, color: 'var(--color-danger)', marginTop: 4 }}>{fieldErrors.fullName}</div>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>{t('vacancies.form.phone')}</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67" style={errorBorder(fieldErrors.phone, inputStyle)} />
                    {fieldErrors.phone && <div style={{ fontSize: 11.5, color: 'var(--color-danger)', marginTop: 4 }}>{fieldErrors.phone}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" style={errorBorder(fieldErrors.email, inputStyle)} />
                    {fieldErrors.email && <div style={{ fontSize: 11.5, color: 'var(--color-danger)', marginTop: 4 }}>{fieldErrors.email}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Ish */}
            <div style={sectionBoxStyle}>
              <div style={sectionTitleStyle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                {t('vacancies.form.work')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>{t('vacancies.form.position')}</label>
                    <select name="position" value={form.position} onChange={handleChange} style={errorBorder(fieldErrors.position, inputStyle)}>
                      <option value="">{t('vacancies.form.select')}</option>
                      {POSITIONS.map(p => <option key={p.value} value={p.value}>{t(`vacancies.form.options.position.${p.key}`)}</option>)}
                    </select>
                    {fieldErrors.position && <div style={{ fontSize: 11.5, color: 'var(--color-danger)', marginTop: 4 }}>{fieldErrors.position}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>{t('vacancies.form.faculty')}</label>
                    <select name="faculty" value={form.faculty} onChange={handleChange} style={errorBorder(fieldErrors.faculty, inputStyle)}>
                      <option value="">{t('vacancies.form.select')}</option>
                      {FACULTIES.map(f => <option key={f.value} value={f.value}>{t(`vacancies.form.options.faculty.${f.key}`)}</option>)}
                    </select>
                    {fieldErrors.faculty && <div style={{ fontSize: 11.5, color: 'var(--color-danger)', marginTop: 4 }}>{fieldErrors.faculty}</div>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>{t('vacancies.form.education')}</label>
                    <select name="education" value={form.education} onChange={handleChange} style={errorBorder(fieldErrors.education, inputStyle)}>
                      <option value="">{t('vacancies.form.select')}</option>
                      {EDUCATION.map(o => <option key={o.value} value={o.value}>{t(`vacancies.form.options.education.${o.key}`)}</option>)}
                    </select>
                    {fieldErrors.education && <div style={{ fontSize: 11.5, color: 'var(--color-danger)', marginTop: 4 }}>{fieldErrors.education}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>{t('vacancies.form.experience')}</label>
                    <select name="experience" value={form.experience} onChange={handleChange} style={errorBorder(fieldErrors.experience, inputStyle)}>
                      <option value="">{t('vacancies.form.select')}</option>
                      {EXPERIENCE.map(o => <option key={o.value} value={o.value}>{t(`vacancies.form.options.experience.${o.key}`)}</option>)}
                    </select>
                    {fieldErrors.experience && <div style={{ fontSize: 11.5, color: 'var(--color-danger)', marginTop: 4 }}>{fieldErrors.experience}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Qo'shimcha */}
            <div style={sectionBoxStyle}>
              <div style={sectionTitleStyle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {t('vacancies.form.extra')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={labelStyle}>{t('vacancies.form.about')}</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    placeholder={t('vacancies.form.aboutPh')}
                    rows={4} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
                  <input type="checkbox" name="hasPortfolio" checked={form.hasPortfolio} onChange={handleChange}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-brand)' }} />
                  {t('vacancies.form.hasPortfolio')}
                </label>
              </div>
            </div>

            {/* Docs reminder */}
            <div style={{ padding: '1rem', background: 'color-mix(in srgb, var(--color-brand) 5%, transparent)', borderRadius: 10, border: '1px solid color-mix(in srgb, var(--color-brand) 15%, transparent)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-brand)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                {t('vacancies.form.docsReminder', { email: config.contact.email })}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DOCS_NEEDED.map((d, i) => (
                  <span key={i} style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--bg)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: 'var(--color-brand)' }}>{d.icon}</span> {t(`vacancies.docs.${d.id}`)}
                  </span>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 12.5, color: 'var(--color-danger)', background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.25)', borderRadius: 10, padding: '10px 14px' }}>
                {t('vacancies.form.error')}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14 }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  {t('vacancies.form.sending')}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  {t('vacancies.form.submit')}
                </span>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple-pale), var(--purple-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--color-brand)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: '.75rem' }}>{t('vacancies.form.successTitle')}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            <Trans i18nKey="vacancies.form.successText" values={{ name: form.fullName }} components={{ b: <strong style={{ color: 'var(--text)' }} /> }} />
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onNewApplication} className="btn btn-primary" style={{ fontSize: 13 }}>
              {t('vacancies.form.newApplication')}
            </button>
            <button onClick={() => setActiveTab('info')} className="btn btn-primary" style={{ fontSize: 13 }}>
              {t('vacancies.form.backToInfo')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}