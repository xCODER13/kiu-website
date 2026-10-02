import { useRef, useState } from 'react'
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

export default function ApplyModal({ onClose }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)
  useModalA11y(dialogRef, onClose)
  const [form, setForm] = useState({ name: '', phone: '', faculty: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validate() {
    const errs = {
      name: validateFullName(form.name, t),
      phone: validatePhone(form.phone, t),
    }
    setFieldErrors(errs)
    return !errs.name && !errs.phone
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(false)
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, faculty: form.faculty, message: form.message, type: 'admission' }),
      })
      if (!res.ok) throw new Error('Request failed')
      setSent(true)
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <div onClick={onClose} className="modal-overlay">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('applyModal.title')} onClick={e => e.stopPropagation()} className="modal-dialog">
        {/* aria-label "Modalni yopish" — muvaffaqiyat ekranidagi pastki "Yopish" tugmasi bilan
            bir xil nomga ega bo'lmasligi uchun (ikkalasi bir vaqtda DOM'da bo'lishi mumkin) */}
        <button onClick={onClose} aria-label={t('applyModal.closeModal')} className="modal-close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {!sent ? (
          <>
            <h2 className="modal-title">{t('applyModal.title')}</h2>
            <p className="modal-sub">{t('applyModal.subtitle')}</p>
            <form onSubmit={handleSubmit} noValidate className="modal-form">
              <div>
                <label className="label label--form">{t('applyModal.fullName')}</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder={t('applyModal.fullNamePlaceholder')}
                  className="input input--form" aria-invalid={fieldErrors.name ? 'true' : undefined} />
                {fieldErrors.name && <div className="field-error field-error--form">{fieldErrors.name}</div>}
              </div>
              <div>
                <label className="label label--form">{t('applyModal.phone')}</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67"
                  className="input input--form" aria-invalid={fieldErrors.phone ? 'true' : undefined} />
                {fieldErrors.phone && <div className="field-error field-error--form">{fieldErrors.phone}</div>}
              </div>
              <div>
                <label className="label label--form">{t('applyModal.program')}</label>
                <select name="faculty" value={form.faculty} onChange={handleChange} className="input input--form">
                  <option value="">{t('applyModal.programPlaceholder')}</option>
                  {PROGRAMS.map(p => <option key={p.key} value={p.value}>{t(`applyModal.programs.${p.key}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="label label--form">{t('applyModal.comment')}</label>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder={t('applyModal.commentPlaceholder')} rows={3}
                  className="input input--form input--noresize" />
              </div>
              {error && (
                <div className="modal-alert">
                  {t('applyModal.error')}
                </div>
              )}
              <button type="submit" className="btn btn-primary modal-submit" disabled={loading} aria-busy={loading}>
                {loading ? t('applyModal.sending') : t('applyModal.submit')}
              </button>
            </form>
          </>
        ) : (
          <div className="modal-success">
            <div className="modal-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="modal-success-title">{t('applyModal.successTitle')}</h2>
            <p className="modal-success-text">{t('applyModal.successDesc')}</p>
            <button onClick={onClose} className="btn btn-primary">{t('applyModal.close')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
