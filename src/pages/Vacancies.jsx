import { useState } from 'react'
import { validateFullName, validatePhone, validateEmail, validateRequired } from '../utils/validation'
import InfoTab from './vacancies/InfoTab'
import ApplicationForm from './vacancies/ApplicationForm'

const EMPTY_FORM = { fullName: '', phone: '', email: '', position: '', faculty: '', education: '', experience: '', message: '', hasPortfolio: false }

// ── MAIN ── (endi yupqa orkestrator — UI blok va state, real render
// mantig'i vacancies/InfoTab.jsx va vacancies/ApplicationForm.jsx'ga bo'lingan)
export default function Vacancies() {
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
      fullName: validateFullName(form.fullName),
      phone: validatePhone(form.phone),
      email: validateEmail(form.email, false),
      position: validateRequired(form.position, 'Lavozim'),
      faculty: validateRequired(form.faculty, "Bo'lim/Kafedra"),
      education: validateRequired(form.education, "Ta'lim darajasi"),
      experience: validateRequired(form.experience, 'Ish tajribasi'),
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
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.25)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Vakant o'rinlar mavjud
        </div>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Jamoamizga qo'shiling!</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 560, margin: '0 auto' }}>
          Qarshi xalqaro universiteti o'z jamoasiga tashabbuskor, malakali va fidokor mutaxassislarni taklif etadi.
        </p>
      </section>

      <section className="section">
        <div className="container">

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
            {[{ key: 'info', label: "Ma'lumot" }, { key: 'form', label: 'Ariza topshirish' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '10px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab.key ? '#7c3aed' : 'var(--muted)', borderBottom: activeTab === tab.key ? '2px solid #7c3aed' : '2px solid transparent', marginBottom: -1, fontFamily: 'var(--font-body)', transition: 'all .2s' }}>
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