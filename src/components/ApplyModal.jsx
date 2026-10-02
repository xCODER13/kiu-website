import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { validateFullName, validatePhone, errorBorder } from '../utils/validation'
import useModalA11y from '../hooks/useModalA11y'

const inputBase = { width: '100%', padding: '10px 14px', border: '1px solid var(--color-border-strong)', borderRadius: 10, fontSize: 13, background: 'var(--bg)', color: 'var(--text)' }
const fieldErrStyle = { fontSize: 11.5, color: '#dc2626', marginTop: 4 }

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
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('applyModal.title')} onClick={e => e.stopPropagation()} style={{ background: 'var(--bg)', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 480, position: 'relative' }}>
        {/* aria-label "Modalni yopish" — muvaffaqiyat ekranidagi pastki "Yopish" tugmasi bilan
            bir xil nomga ega bo'lmasligi uchun (ikkalasi bir vaqtda DOM'da bo'lishi mumkin) */}
        <button onClick={onClose} aria-label={t('applyModal.closeModal')} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {!sent ? (
          <>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '.35rem', color: 'var(--text)' }}>{t('applyModal.title')}</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>{t('applyModal.subtitle')}</p>
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{t('applyModal.fullName')}</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder={t('applyModal.fullNamePlaceholder')}
                  style={errorBorder(fieldErrors.name, inputBase)} />
                {fieldErrors.name && <div style={fieldErrStyle}>{fieldErrors.name}</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{t('applyModal.phone')}</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67"
                  style={errorBorder(fieldErrors.phone, inputBase)} />
                {fieldErrors.phone && <div style={fieldErrStyle}>{fieldErrors.phone}</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{t('applyModal.program')}</label>
                <select name="faculty" value={form.faculty} onChange={handleChange}
                  style={inputBase}>
                  <option value="">{t('applyModal.programPlaceholder')}</option>
                  {PROGRAMS.map(p => <option key={p.key} value={p.value}>{t(`applyModal.programs.${p.key}`)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{t('applyModal.comment')}</label>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder={t('applyModal.commentPlaceholder')} rows={3}
                  style={{ ...inputBase, resize: 'none' }} />
              </div>
              {error && (
                <div style={{ fontSize: 12.5, color: 'var(--color-danger)', background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.25)', borderRadius: 10, padding: '10px 14px' }}>
                  {t('applyModal.error')}
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }} disabled={loading} aria-busy={loading}>
                {loading ? t('applyModal.sending') : t('applyModal.submit')}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-hero-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--color-brand)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text)', marginBottom: '.5rem' }}>{t('applyModal.successTitle')}</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>{t('applyModal.successDesc')}</p>
            <button onClick={onClose} className="btn btn-primary" style={{ margin: '0 auto' }}>{t('applyModal.close')}</button>
          </div>
        )}
      </div>
    </div>
  )
}