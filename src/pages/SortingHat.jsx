import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from '../i18n/router'
import { validateFullName, validatePhone } from '../utils/validation'
import { IcHat, IcStar } from './sortinghat/Icons.jsx'
import { QUESTIONS, FACULTIES } from './sortinghat/Data.jsx'
import { postSortingHatLead } from './sortinghat/api'
import IntroStage from './sortinghat/IntroStage.jsx'
import RegisterStage from './sortinghat/RegisterStage.jsx'
import QuizStage from './sortinghat/QuizStage.jsx'
import ResultStage from './sortinghat/ResultStage.jsx'

// ── COMPONENT ───────────────────────────────────────────────
export default function SortingHat() {
  const { t } = useTranslation()
  const [stage, setStage]       = useState('intro')
  const [current, setCurrent]   = useState(0)
  const [scores, setScores]     = useState({})
  const [result, setResult]     = useState(null)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy]         = useState(false)
  const [userInfo, setUserInfo] = useState({ name: '', phone: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  function startQuiz() { setStage('register') }

  async function submitInfo() {
    const errs = { name: validateFullName(userInfo.name, t), phone: validatePhone(userInfo.phone, t) }
    setFieldErrors(errs)
    if (errs.name || errs.phone) return
    setStage('quiz'); setCurrent(0)
    setScores({}); setResult(null); setSelected(null)
  }

  async function pick(opt) {
    if (busy) return
    setSelected(opt); setBusy(true)
    setTimeout(async () => {
      const ns = { ...scores }
      Object.entries(opt.s).forEach(([k, v]) => { ns[k] = (ns[k] || 0) + v })
      setScores(ns)
      if (current + 1 >= QUESTIONS.length) {
        const top3 = Object.entries(ns).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k)
        setResult(top3); setStage('result')
        await postSortingHatLead({
          name: userInfo.name,
          phone: userInfo.phone,
          faculties: top3.map(k => FACULTIES[k]?.name || k)
        })
      } else {
        setCurrent(current + 1); setSelected(null)
      }
      setBusy(false)
    }, 480)
  }

  return (
    <div className="fade-up">
      {/* ── HERO ── */}
<section style={{ padding: '3rem 2rem 2.5rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
  {/* bg stars */}
  {[...Array(7)].map((_, i) => (
    <span key={i} style={{ position: 'absolute', opacity: .15, left: `${8 + i * 13}%`, top: `${15 + Math.sin(i) * 50}%` }}>
      <IcStar s={12 + i * 2} c="#f0ec0b" />
    </span>
  ))}

  {/* Orqaga tugma */}
  {/* Xatolik: <button> ilgari <a> (NavLink) ICHIDA joylashgan edi — HTML5
      bo'yicha <a> ichida boshqa interaktiv element (button) bo'lishi
      taqiqlangan (invalid nesting). Bu klaviatura/screen reader uchun
      chalkash va E2E testlarda ham "button" sifatida topilib, aslida
      havola ekanligi bilinmay qolishiga olib keladi. Endi NavLink o'zi
      to'g'ridan-to'g'ri pill ko'rinishida (ichida qo'shimcha button yo'q). */}
  <NavLink to="/admission" className="section-badge" style={{ textDecoration: 'none', position: 'absolute', top: '1rem', left: '1rem', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(124,58,237,.25)', color: '#7c3aed', border: '1px solid rgba(124,58,237,.2)', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
    {t('sortingHat.backToAdmission')}
  </NavLink>

  <div style={{ position: 'relative', zIndex: 1 }}>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}><IcHat /></div>
    <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.25)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
      <IcStar s={11} c="#7c3aed" /> {t('sortingHat.badge')} <IcStar s={11} c="#7c3aed" />
    </div>
    <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '0.6rem', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
      {t('sortingHat.title')}
    </h1>
    <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
      {t('sortingHat.subtitle')}
    </p>
  </div>
</section>

      <section className="section">
        <div className="container" style={{ maxWidth: 680 }}>

          {stage === 'intro' && (
            <IntroStage onStart={startQuiz} />
          )}

          {stage === 'register' && (
            <RegisterStage
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              fieldErrors={fieldErrors}
              onBack={() => setStage('intro')}
              onSubmit={submitInfo}
            />
          )}

          {stage === 'quiz' && (
            <QuizStage
              current={current}
              selected={selected}
              busy={busy}
              onPick={pick}
            />
          )}

          {stage === 'result' && result && (
            <ResultStage result={result} onRestart={startQuiz} />
          )}

        </div>
      </section>
    </div>
  )
}