import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { validateFullName, validatePhone, validateEmail, validateRequired } from '../utils/validation'
import InfoTab from './vacancies/InfoTab'
import ApplicationForm from './vacancies/ApplicationForm'

const EMPTY_FORM = { fullName: '', phone: '', email: '', position: '', faculty: '', education: '', experience: '', message: '', hasPortfolio: false }

// ── MAIN ── (endi yupqa orkestrator — UI blok va state, real render
// mantig'i vacancies/InfoTab.jsx va vacancies/ApplicationForm.jsx'ga bo'lingan)
export default function Vacancies() {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY_FORM)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [activeTab, setActiveTab] = useState('info')

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  function validate() {
    const errs = {
      fullName: validateFullName(form.fullName, t),
      phone: validatePhone(form.phone, t),
      email: validateEmail(form.email, false, t),
      position: validateRequired(form.position, t('vacancies.fieldNames.position'), t),
      faculty: validateRequired(form.faculty, t('vacancies.fieldNames.faculty'), t),
      education: validateRequired(form.education, t('vacancies.fieldNames.education'), t),
      experience: validateRequired(form.experience, t('vacancies.fieldNames.experience'), t),
    }
    setFieldErrors(errs)
    return Object.values(errs).every(v => !v)
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
        body: JSON.stringify({ ...form, name: form.fullName, type: 'vacancy' }),
      })
      if (!res.ok) throw new Error('Request failed')
      setSent(true)
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(true)
    }
    setLoading(false)
  }

  function handleNewApplication() {
    setSent(false)
    setForm(EMPTY_FORM)
  }

  return (
    <div className="fade-up">
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '3rem 2rem 1rem', background: 'var(--gradient-hero)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-brand)', background: 'color-mix(in srgb, var(--color-brand) 25%, transparent)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid color-mix(in srgb, var(--color-brand) 20%, transparent)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          {t('vacancies.badge')}
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-text)', marginBottom: '.5rem' }}>{t('vacancies.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 560, margin: '0 auto' }}>
          {t('vacancies.subtitle')}
        </p>
      </section>

      <section className="section">
        <div className="container">

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
            {[{ key: 'info', label: t('vacancies.tabs.info') }, { key: 'form', label: t('vacancies.tabs.form') }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '10px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab.key ? 'var(--color-brand)' : 'var(--muted)', borderBottom: activeTab === tab.key ? '2px solid var(--color-brand)' : '2px solid transparent', marginBottom: -1, fontFamily: 'var(--font-body)', transition: 'all .2s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'info' && <InfoTab setActiveTab={setActiveTab} />}

          {activeTab === 'form' && (
            <ApplicationForm
              form={form} fieldErrors={fieldErrors} loading={loading} error={error} sent={sent}
              handleChange={handleChange} handleSubmit={handleSubmit}
              onNewApplication={handleNewApplication} setActiveTab={setActiveTab}
            />
          )}

        </div>
      </section>
    </div>
  )
}