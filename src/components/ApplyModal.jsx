import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { validateFullName, validatePhone } from '../utils/validation'
import useModalA11y from '../hooks/useModalA11y'

// value — backend'ga yuboriladigan o'zbekcha nom (admin panel shunga tayanadi); key — ko'rsatiladigan nom kaliti
const PROGRAMS = [
  { value: "Maktabgacha ta'lim", key: 'preschool' },
  { value: "Boshlang'ich ta'lim", key: 'primary' },
  { value: "Dasturiy injiniring", key: 'softwareEng' },
  { value: "Iqtisodiyot", key: 'economics' },
  { value: "Moliya va moliyaviy texnologiyalar", key: 'finance' },
  { value: "Buxgalteriya hisobi", key: 'accounting' },
  { value: "Psixologiya", key: 'psychology' },
  { value: "Filologiya va tillarni o'qitish", key: 'philology' },
  { value: "Neft va gaz ishi", key: 'oilGas' },
  { value: "Milliy g'oya va huquq ta'limi", key: 'nationalIdea' },
]

// Maydon xatosi: ogohlantirish SVG + matn; `role="alert"` — ekran o'quvchi darhol o'qiydi
function FieldError({ id, children }) {
  return (
    <div id={id} role="alert" className="field-error field-error--lg">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{children}</span>
    </div>
  )
}

export default function ApplyModal({ onClose }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)
  useModalA11y(dialogRef, onClose)
  const uid = useId()
  const ids = { name: `${uid}-name`, phone: `${uid}-phone`, faculty: `${uid}-faculty`, message: `${uid}-message` }
  // i18n yorlig'idagi oxirgi " *" qoldirilgan (kalitlar o'zgarmaydi) — belgi alohida, danger rangida chiziladi
  const labelText = key => t(key).replace(/\s*\*$/, '')
  const isRequired = key => /\*$/.test(t(key))
  const [form, setForm] = useState({ name: '', phone: '', faculty: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  // null | 'failed' (tarmoq/server) | 'rateLimited' (429 — internet aloqasi bilan bog'liq emas, boshqa xabar kerak)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const submitRef = useRef(null)
  const doneRef = useRef(null)

  // Yuborildi ekraniga o'tilganda fokus "Yopish" tugmasiga — forma olib tashlangani uchun fokus <body>ga tushib ketmasin
  useEffect(() => { if (sent) doneRef.current?.focus() }, [sent])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validate() {
    const errs = {
      name: validateFullName(form.name, t),
      phone: validatePhone(form.phone, t),
    }
    setFieldErrors(errs)
    // Birinchi xatoli maydonga fokus — klaviatura va ekran o'quvchi foydalanuvchisi xatoga darhol tushadi
    const firstInvalid = errs.name ? nameRef.current : errs.phone ? phoneRef.current : null
    firstInvalid?.focus()
    return !firstInvalid
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return // ikki marta bosish / Enter'dan takroriy ariza ketmasin
    setError(null)
    if (!validate()) return
    setLoading(true)
    // Maydonlar `disabled` bo'lganda fokus <body>ga tushib, modal tuzog'idan chiqib ketmasin
    dialogRef.current?.focus()
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, faculty: form.faculty, message: form.message, type: 'admission' }),
      })
      if (res.status === 429) {
        setError('rateLimited')
        setTimeout(() => submitRef.current?.focus(), 0)
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error('Request failed')
      setSent(true)
    } catch {
      setError('failed')
      // Qayta urinish uchun fokus yana tugmada (u endi faol)
      setTimeout(() => submitRef.current?.focus(), 0)
    }
    setLoading(false)
  }

  return (
    <div onClick={onClose} className="modal-overlay">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('applyModal.title')} tabIndex={-1} onClick={e => e.stopPropagation()} className="modal-dialog">
        {/* aria-label "Modalni yopish" — muvaffaqiyat ekranidagi pastki "Yopish" tugmasi bilan
            bir xil nomga ega bo'lmasligi uchun (ikkalasi bir vaqtda DOM'da bo'lishi mumkin) */}
        <button onClick={onClose} aria-label={t('applyModal.closeModal')} className="modal-close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {!sent ? (
          <>
            <h2 className="modal-title">{t('applyModal.title')}</h2>
            <p className="modal-sub">{t('applyModal.subtitle')}</p>
            <form onSubmit={handleSubmit} noValidate className="modal-form" aria-busy={loading}>
              {/* Yuborilayotganda maydonlar tahrirlanmaydi (`disabled`) — yuborilgan va ekrandagi qiymat farq qilmasin */}
              <fieldset className="modal-fields" disabled={loading}>
              <div>
                <label htmlFor={ids.name} className="label label--lg">{labelText('applyModal.fullName')}{isRequired('applyModal.fullName') && <span className="req" aria-hidden="true">*</span>}</label>
                <input ref={nameRef} id={ids.name} name="name" value={form.name} onChange={handleChange} placeholder={t('applyModal.fullNamePlaceholder')}
                  className="input input--lg" aria-invalid={fieldErrors.name ? 'true' : undefined}
                  aria-describedby={fieldErrors.name ? `${ids.name}-err` : undefined} />
                {fieldErrors.name && <FieldError id={`${ids.name}-err`}>{fieldErrors.name}</FieldError>}
              </div>
              <div>
                <label htmlFor={ids.phone} className="label label--lg">{labelText('applyModal.phone')}{isRequired('applyModal.phone') && <span className="req" aria-hidden="true">*</span>}</label>
                <input ref={phoneRef} id={ids.phone} name="phone" value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67"
                  className="input input--lg" aria-invalid={fieldErrors.phone ? 'true' : undefined}
                  aria-describedby={fieldErrors.phone ? `${ids.phone}-err` : undefined} />
                {fieldErrors.phone && <FieldError id={`${ids.phone}-err`}>{fieldErrors.phone}</FieldError>}
              </div>
              <div>
                <label htmlFor={ids.faculty} className="label label--lg">{t('applyModal.program')}</label>
                <div className="select-wrap">
                  <select id={ids.faculty} name="faculty" value={form.faculty} onChange={handleChange} className="input input--lg">
                    <option value="">{t('applyModal.programPlaceholder')}</option>
                    {PROGRAMS.map(p => <option key={p.key} value={p.value}>{t(`applyModal.programs.${p.key}`)}</option>)}
                  </select>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <div>
                <label htmlFor={ids.message} className="label label--lg">{t('applyModal.comment')}</label>
                <textarea id={ids.message} name="message" value={form.message} onChange={handleChange} placeholder={t('applyModal.commentPlaceholder')} rows={2}
                  className="input input--lg input--area" />
              </div>
              </fieldset>
              {error && (
                <div className="modal-alert" role="alert">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div><b>{t('applyModal.failedTitle')}</b> {t(error === 'rateLimited' ? 'applyModal.rateLimited' : 'applyModal.error')}</div>
                </div>
              )}
              <button ref={submitRef} type="submit" className="btn btn-primary modal-submit" disabled={loading} aria-busy={loading}>
                {loading ? t('applyModal.sending') : t('applyModal.submit')}
              </button>
              <p className="modal-privacy">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {t('sortingHat.register.privacy')}
              </p>
            </form>
          </>
        ) : (
          <div className="modal-success">
            <div className="modal-success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="modal-success-title">{t('applyModal.successTitle')}</h2>
            <p className="modal-success-text">{t('applyModal.successDesc')}</p>
            <button ref={doneRef} onClick={onClose} className="btn btn-primary">{t('applyModal.close')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
