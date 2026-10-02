import { Trans, useTranslation } from 'react-i18next'
import { POSITIONS, FACULTIES, EDUCATION, EXPERIENCE, DOCS_NEEDED } from './data'
import config from '../../config'
import { inputClass, areaClass, labelClass, sectionBoxClass, sectionTitleClass } from './styles'

// "FORM TAB" bo'limi — Vacancies.jsx'dan o'zgarishsiz ko'chirilgan
// (forma va muvaffaqiyat/success ekrani ikkalasi ham shu yerda,
// asl faylda ham bir-biriga bog'liq `sent` holati orqali almashtirilgan edi).
export default function ApplicationForm({
  form, fieldErrors, loading, error, sent,
  handleChange, handleSubmit, onNewApplication, setActiveTab,
}) {
  const { t } = useTranslation()
  return (
    <div className="vac-form-wrap">
      {!sent ? (
        <div className="card vac-form-card">
          <h2 className="vac-form-title">{t('vacancies.form.title')}</h2>
          <p className="vac-form-sub">{t('vacancies.form.subtitle')}</p>

          <form onSubmit={handleSubmit} noValidate className="vac-form">

            {/* Shaxsiy */}
            <div className={sectionBoxClass}>
              <div className={sectionTitleClass}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {t('vacancies.form.personal')}
              </div>
              <div className="vac-fields">
                <div>
                  <label className={labelClass}>{t('vacancies.form.fullName')}</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder={t('vacancies.form.fullNamePh')} className={inputClass} aria-invalid={!!fieldErrors.fullName} />
                  {fieldErrors.fullName && <div className="field-error field-error--form">{fieldErrors.fullName}</div>}
                </div>
                <div className="vac-row">
                  <div>
                    <label className={labelClass}>{t('vacancies.form.phone')}</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67" className={inputClass} aria-invalid={!!fieldErrors.phone} />
                    {fieldErrors.phone && <div className="field-error field-error--form">{fieldErrors.phone}</div>}
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className={inputClass} aria-invalid={!!fieldErrors.email} />
                    {fieldErrors.email && <div className="field-error field-error--form">{fieldErrors.email}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Ish */}
            <div className={sectionBoxClass}>
              <div className={sectionTitleClass}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                {t('vacancies.form.work')}
              </div>
              <div className="vac-fields">
                <div className="vac-row">
                  <div>
                    <label className={labelClass}>{t('vacancies.form.position')}</label>
                    <select name="position" value={form.position} onChange={handleChange} className={inputClass} aria-invalid={!!fieldErrors.position}>
                      <option value="">{t('vacancies.form.select')}</option>
                      {POSITIONS.map(p => <option key={p.value} value={p.value}>{t(`vacancies.form.options.position.${p.key}`)}</option>)}
                    </select>
                    {fieldErrors.position && <div className="field-error field-error--form">{fieldErrors.position}</div>}
                  </div>
                  <div>
                    <label className={labelClass}>{t('vacancies.form.faculty')}</label>
                    <select name="faculty" value={form.faculty} onChange={handleChange} className={inputClass} aria-invalid={!!fieldErrors.faculty}>
                      <option value="">{t('vacancies.form.select')}</option>
                      {FACULTIES.map(f => <option key={f.value} value={f.value}>{t(`vacancies.form.options.faculty.${f.key}`)}</option>)}
                    </select>
                    {fieldErrors.faculty && <div className="field-error field-error--form">{fieldErrors.faculty}</div>}
                  </div>
                </div>
                <div className="vac-row">
                  <div>
                    <label className={labelClass}>{t('vacancies.form.education')}</label>
                    <select name="education" value={form.education} onChange={handleChange} className={inputClass} aria-invalid={!!fieldErrors.education}>
                      <option value="">{t('vacancies.form.select')}</option>
                      {EDUCATION.map(o => <option key={o.value} value={o.value}>{t(`vacancies.form.options.education.${o.key}`)}</option>)}
                    </select>
                    {fieldErrors.education && <div className="field-error field-error--form">{fieldErrors.education}</div>}
                  </div>
                  <div>
                    <label className={labelClass}>{t('vacancies.form.experience')}</label>
                    <select name="experience" value={form.experience} onChange={handleChange} className={inputClass} aria-invalid={!!fieldErrors.experience}>
                      <option value="">{t('vacancies.form.select')}</option>
                      {EXPERIENCE.map(o => <option key={o.value} value={o.value}>{t(`vacancies.form.options.experience.${o.key}`)}</option>)}
                    </select>
                    {fieldErrors.experience && <div className="field-error field-error--form">{fieldErrors.experience}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Qo'shimcha */}
            <div className={sectionBoxClass}>
              <div className={sectionTitleClass}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {t('vacancies.form.extra')}
              </div>
              <div className="vac-fields">
                <div>
                  <label className={labelClass}>{t('vacancies.form.about')}</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    placeholder={t('vacancies.form.aboutPh')}
                    rows={4} className={areaClass} />
                </div>
                <label className="vac-check-label">
                  <input type="checkbox" name="hasPortfolio" checked={form.hasPortfolio} onChange={handleChange}
                    className="vac-checkbox" />
                  {t('vacancies.form.hasPortfolio')}
                </label>
              </div>
            </div>

            {/* Docs reminder */}
            <div className="vac-docs-box">
              <div className="vac-docs-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                {t('vacancies.form.docsReminder', { email: config.contact.email })}
              </div>
              <div className="vac-chips">
                {DOCS_NEEDED.map((d, i) => (
                  <span key={i} className="vac-chip">
                    <span className="vac-doc-icon">{d.icon}</span> {t(`vacancies.docs.${d.id}`)}
                  </span>
                ))}
              </div>
            </div>

            {error && (
              <div className="vac-alert">
                {t('vacancies.form.error')}
              </div>
            )}

            <button type="submit" className="btn btn-primary vac-submit" disabled={loading} aria-busy={loading}>
              {loading ? (
                <span className="vac-submit-inner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="vac-spin"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  {t('vacancies.form.sending')}
                </span>
              ) : (
                <span className="vac-submit-inner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  {t('vacancies.form.submit')}
                </span>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="card vac-success">
          <div className="vac-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="vac-success-title">{t('vacancies.form.successTitle')}</h2>
          <p className="vac-success-text">
            <Trans i18nKey="vacancies.form.successText" values={{ name: form.fullName }} components={{ b: <strong className="vac-strong" /> }} />
          </p>
          <div className="vac-success-actions">
            <button onClick={onNewApplication} className="btn btn-primary vac-btn-sm">
              {t('vacancies.form.newApplication')}
            </button>
            <button onClick={() => setActiveTab('info')} className="btn btn-primary vac-btn-sm">
              {t('vacancies.form.backToInfo')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}