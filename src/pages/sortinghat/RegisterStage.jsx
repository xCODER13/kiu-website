import { useTranslation } from 'react-i18next'
import Icon from '../../components/Icon'

// Tarjima matnlarida majburiylik belgisi `*` matnning ichida ("Ism Familiya *"). Uni dekorativ qilib ajratamiz:
// ekran o'quvchiga majburiylikni `aria-required` aytadi (Vakansiyalar formasi bilan bir xil yondashuv).
const stripReq = s => s.replace(/\s*\*\s*$/, '')

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label label--lg">
        {stripReq(label)}<span className="label__req" aria-hidden="true"> *</span>
      </label>
      {children}
      {error && (
        <div id={`${id}-err`} role="alert" className="field-error field-error--lg">
          <Icon size={15}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>
          {error}
        </div>
      )}
    </div>
  )
}

/* ── Register Stage ───────────────────────────────────────────
   Ism/telefon kiritish shakli. Validatsiya xatolari (fieldErrors)
   va input qiymatlari yuqori komponentdan (SortingHat.jsx) props
   orqali keladi — yagona haqiqat manbai u yerda saqlanadi. */
export default function RegisterStage({ userInfo, setUserInfo, fieldErrors, onBack, onSubmit }) {
  const { t } = useTranslation()
  const empty = !userInfo.name.trim() || !userInfo.phone.trim()
  return (
    <div className="sh-register">
      <div className="card sh-register__head">
        <span className="sh-register__icon">
          <Icon size={30}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>
        </span>
        <h2 className="sh-register__title">{t('sortingHat.register.title')}</h2>
        <p className="sh-register__desc">{t('sortingHat.register.desc')}</p>
      </div>

      <div className="sh-register__fields">
        <Field id="sh-name" label={t('sortingHat.register.name')} error={fieldErrors.name}>
          <input id="sh-name" type="text" autoComplete="name" value={userInfo.name}
            onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
            placeholder={t('sortingHat.register.namePlaceholder')}
            className="input input--lg"
            aria-required="true"
            aria-invalid={fieldErrors.name ? 'true' : undefined}
            aria-describedby={fieldErrors.name ? 'sh-name-err' : undefined} />
        </Field>
        <Field id="sh-phone" label={t('sortingHat.register.phone')} error={fieldErrors.phone}>
          <input id="sh-phone" type="tel" autoComplete="tel" value={userInfo.phone}
            onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
            placeholder="+998 90 123 45 67"
            className="input input--lg"
            aria-required="true"
            aria-invalid={fieldErrors.phone ? 'true' : undefined}
            aria-describedby={fieldErrors.phone ? 'sh-phone-err' : undefined}
            onKeyDown={e => { if (e.key === 'Enter') onSubmit() }} />
        </Field>
      </div>

      <div className="sh-register__actions">
        {/* "Orqaga" asosiy amal emas — kontur (secondary); binafsha gradient olib tashlandi */}
        <button type="button" onClick={onBack} className="btn btn-secondary sh-register__btn">
          <Icon size={16}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>
          {t('sortingHat.register.back')}
        </button>
        <button type="button" onClick={onSubmit} disabled={empty} className="btn btn-primary sh-register__btn sh-register__submit">
          {t('sortingHat.register.start')}
        </button>
      </div>

      <p className="sh-register__privacy">
        <Icon size={14}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>
        {t('sortingHat.register.privacy')}
      </p>
    </div>
  )
}
