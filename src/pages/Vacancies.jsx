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
      {/* Hero */}
      <section className="page-hero">
        <div className="section-badge section-badge--hero">
          <span className="section-badge-dot" />
          {t('vacancies.badge')}
        </div>
        <h1 className="page-hero-title">{t('vacancies.title')}</h1>
        <p className="page-hero-sub page-hero-sub--narrow">
          {t('vacancies.subtitle')}
        </p>
      </section>

      <section className="section">
        <div className="container">

          {/* Tabs */}
          <div className="tabs tabs--line">
            {[{ key: 'info', label: t('vacancies.tabs.info') }, { key: 'form', label: t('vacancies.tabs.form') }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="tab" data-active={activeTab === tab.key}>
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