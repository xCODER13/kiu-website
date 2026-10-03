import { Trans, useTranslation } from 'react-i18next'
import { POSITIONS, FACULTIES, EDUCATION, EXPERIENCE, DOCS_NEEDED } from './data'
import config from '../../config'
import Icon from '../../components/Icon'
import { inputClass, areaClass, labelClass, sectionBoxClass, sectionTitleClass } from './styles'

// Maydon: `<label htmlFor>` + (majburiy bo'lsa) dekorativ `*` + xato matni `aria-describedby` orqali input'ga bog'lanadi.
// `*` ekran o'quvchiga o'qilmaydi — majburiylikni `aria-required` aytadi.
function Field({ name, label, required, error, children }) {
  return (
    <div>
      <label htmlFor={`vac-${name}`} className={labelClass}>
        {label}
        {required && <span className="label__req" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <div id={`vac-${name}-err`} className="field-error field-error--lg">
          <Icon size={14}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>
          {error}
        </div>
      )}
    </div>
  )
}

// "Ariza topshirish" tabi: forma va muvaffaqiyat ekrani (`sent` holati orqali almashadi).
// 6.11c4: yangi forma tizimi (48 px maydon, fokus/xato halqasi, SVG chevron, 22 px checkbox), `role="alert"` xato banneri.
export default function ApplicationForm({
  form, fieldErrors, loading, error, sent,
  handleChange, handleSubmit, onNewApplication, setActiveTab,
}) {
  const { t } = useTranslation()

  // Barcha boshqariladigan maydonlar uchun umumiy xossalar (id, qiymat, a11y)
  const ctl = (name, required = true) => ({
    id: `vac-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    'aria-invalid': !!fieldErrors[name],
    'aria-required': required || undefined,
    'aria-describedby': fieldErrors[name] ? `vac-${name}-err` : undefined,
  })

  const select = (name, items, group) => (
    <div className="select-wrap">
      <select {...ctl(name)} className={inputClass}>
        <option value="">{t('vacancies.form.select')}</option>
        {items.map(o => <option key={o.value} value={o.value}>{t(`vacancies.form.options.${group}.${o.key}`)}</option>)}
      </select>
      <Icon size={18}><polyline points="6 9 12 15 18 9" /></Icon>
    </div>
  )

  return (
    <div className={`vac-form-wrap${sent ? ' vac-form-wrap--sent' : ''}`}>
      {!sent ? (
        <div className="card vac-form-card">
          <h2 className="vac-form-title">{t('vacancies.form.title')}</h2>
          <p className="vac-form-sub">{t('vacancies.form.subtitle')}</p>

          <form onSubmit={handleSubmit} noValidate className="vac-form">

            {/* Shaxsiy */}
            <div className={sectionBoxClass}>
              <div className={sectionTitleClass}>
                <Icon size={16}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>
                {t('vacancies.form.personal')}
              </div>
              <div className="vac-fields">
                <Field name="fullName" label={t('vacancies.form.fullName')} required error={fieldErrors.fullName}>
                  <input {...ctl('fullName')} placeholder={t('vacancies.form.fullNamePh')} className={inputClass} autoComplete="name" />
                </Field>
                <div className="vac-row">
                  <Field name="phone" label={t('vacancies.form.phone')} required error={fieldErrors.phone}>
                    <input {...ctl('phone')} type="tel" placeholder="+998 90 123 45 67" className={inputClass} autoComplete="tel" />
                  </Field>
                  <Field name="email" label="Email" error={fieldErrors.email}>
                    <input {...ctl('email', false)} type="email" placeholder="email@example.com" className={inputClass} autoComplete="email" />
                  </Field>
                </div>
              </div>
            </div>

            {/* Ish */}
            <div className={sectionBoxClass}>
              <div className={sectionTitleClass}>
                <Icon size={16}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></Icon>
                {t('vacancies.form.work')}
              </div>
              <div className="vac-fields">
                <div className="vac-row">
                  <Field name="position" label={t('vacancies.form.position')} required error={fieldErrors.position}>
                    {select('position', POSITIONS, 'position')}
                  </Field>
                  <Field name="faculty" label={t('vacancies.form.faculty')} required error={fieldErrors.faculty}>
                    {select('faculty', FACULTIES, 'faculty')}
                  </Field>
                </div>
                <div className="vac-row">
                  <Field name="education" label={t('vacancies.form.education')} required error={fieldErrors.education}>
                    {select('education', EDUCATION, 'education')}
                  </Field>
                  <Field name="experience" label={t('vacancies.form.experience')} required error={fieldErrors.experience}>
                    {select('experience', EXPERIENCE, 'experience')}
                  </Field>
                </div>
              </div>
            </div>

            {/* Qo'shimcha */}
            <div className={sectionBoxClass}>
              <div className={sectionTitleClass}>
                <Icon size={16}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></Icon>
                {t('vacancies.form.extra')}
              </div>
              <div className="vac-fields">
                <Field name="message" label={t('vacancies.form.about')}>
                  <textarea id="vac-message" name="message" value={form.message} onChange={handleChange}
                    placeholder={t('vacancies.form.aboutPh')} rows={4} className={areaClass} />
                </Field>
                <label className="vac-check-label">
                  <input type="checkbox" name="hasPortfolio" checked={form.hasPortfolio} onChange={handleChange} className="vac-checkbox" />
                  {t('vacancies.form.hasPortfolio')}
                </label>
              </div>
            </div>

            {/* Hujjatlar eslatmasi */}
            <div className="vac-docs-box">
              <div className="vac-docs-title">
                <Icon size={18}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></Icon>
                {t('vacancies.form.docsReminder', { email: config.contact.email })}
              </div>
              <ul className="vac-chips">
                {DOCS_NEEDED.map(d => (
                  <li key={d.id} className="vac-chip">
                    <span className="vac-doc__icon" aria-hidden="true">{d.icon}</span>
                    {t(`vacancies.docs.${d.id}`)}
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="vac-alert" role="alert">
                <Icon size={20}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>
                <p className="vac-alert__text"><strong>{t('vacancies.form.errorTitle')}</strong> {t('vacancies.form.error')}</p>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg vac-submit" disabled={loading} aria-busy={loading}>
              {loading ? (
                <span className="vac-submit-inner">
                  {t('vacancies.form.sending')}
                </span>
              ) : (
                <span className="vac-submit-inner">
                  <Icon size={18}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon>
                  {t('vacancies.form.submit')}
                </span>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="card vac-success" role="status">
          <div className="vac-success__icon" aria-hidden="true">
            <Icon size={40}><polyline points="20 6 9 17 4 12" /></Icon>
          </div>
          <h2 className="vac-success__title">{t('vacancies.form.successTitle')}</h2>
          <p className="vac-success__text">
            <Trans i18nKey="vacancies.form.successText" values={{ name: form.fullName }} components={{ b: <strong className="vac-strong" /> }} />
          </p>
          <div className="vac-success__actions">
            <button type="button" onClick={onNewApplication} className="btn btn-primary btn-cta">
              {t('vacancies.form.newApplication')}
            </button>
            <button type="button" onClick={() => setActiveTab('info')} className="btn btn-primary btn-cta">
              {t('vacancies.form.backToInfo')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
