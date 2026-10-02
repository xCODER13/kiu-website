import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from '../i18n/router'
import { validateFullName, validatePhone } from '../utils/validation'
import Icon from '../components/Icon'
import { IcHat, IcStar } from './sortinghat/Icons.jsx'
import { QUESTIONS, FACULTIES } from './sortinghat/Data.jsx'
import { postSortingHatLead } from './sortinghat/api'
import IntroStage from './sortinghat/IntroStage.jsx'
import RegisterStage from './sortinghat/RegisterStage.jsx'
import QuizStage from './sortinghat/QuizStage.jsx'
import ResultStage from './sortinghat/ResultStage.jsx'

// Hero fonidagi 7 ta xira oltin yulduz: o'rni va o'lchami doimiy (avval har render'da `Math.sin` bilan hisoblanardi)
const BG_STARS = Array.from({ length: 7 }, (_, i) => ({ s: 12 + i * 2, x: 8 + i * 13, y: +(12 + (Math.sin(i * 1.7) + 1) * 34).toFixed(1) }))

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
      {/* ── HERO (hamma bosqichda bir xil) ── */}
      <section className="inner-hero sh-hero">
        {/* Fon yulduzlari: dekorativ, o'rni — `--x`/`--y` (faqat dinamik qiymat inline) */}
        {BG_STARS.map((st, i) => (
          <span key={i} className="sh-hero__star" aria-hidden="true" style={{ '--x': `${st.x}%`, '--y': `${st.y}%` }}>
            <IcStar s={st.s} />
          </span>
        ))}

        {/* Orqaga: <a> ichida <button> yo'q — NavLink o'zi pill (HTML5: ichma-ich interaktiv element taqiqlangan) */}
        <NavLink to="/admission" className="sh-back">
          <Icon size={16}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>
          {t('sortingHat.backToAdmission')}
        </NavLink>

        <div className="container inner-hero__inner">
          <div className="sh-hero__hat"><IcHat s={76} /></div>
          <span className="hero-badge sh-badge">
            <span className="sh-badge__star"><IcStar s={12} c="currentColor" /></span>
            {t('sortingHat.badge')}
            <span className="sh-badge__star"><IcStar s={12} c="currentColor" /></span>
          </span>
          <h1 className="inner-hero__title">{t('sortingHat.title')}</h1>
          <p className="inner-hero__sub">{t('sortingHat.subtitle')}</p>
        </div>
      </section>

      <section className="sh-body">
        <div className="container sh-wrap">

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
