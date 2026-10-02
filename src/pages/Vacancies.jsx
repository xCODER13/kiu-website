import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { validateFullName, validatePhone, validateEmail, validateRequired } from '../utils/validation'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
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

  const tabs = [
    { key: 'info', label: t('vacancies.tabs.info'), icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></> },
    { key: 'form', label: t('vacancies.tabs.form'), icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></> },
  ]

  return (
    <div className="fade-up">
      <PageHero badge={t('vacancies.badge')} title={t('vacancies.title')} sub={t('vacancies.subtitle')}>
        {/* Tab almashtirgich (pill): rol `button` saqlangan, holat — `data-active` + `aria-pressed` */}
        <div className="kiu-tab-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              className="kiu-tab-btn"
              data-active={activeTab === tab.key}
              aria-pressed={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="kiu-tab-icon"><Icon size={16}>{tab.icon}</Icon></span>
              {tab.label}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="page-body">
        <div className="container-wide">
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
