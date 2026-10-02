import { useTranslation } from 'react-i18next'
import { IcQuestion, IcCheck, IcArrow } from './Icons.jsx'
import { QUESTIONS } from './Data'

/* ── Quiz Stage ────────────────────────────────────────────── */
export default function QuizStage({ current, selected, busy, onPick }) {
  const { t } = useTranslation()
  const pct = (current / QUESTIONS.length) * 100

  return (
    <div>
      {/* progress */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: 'var(--muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IcQuestion />
            <span style={{ marginLeft: 2 }}>{t('sortingHat.quiz.progress', { current: current + 1, total: QUESTIONS.length })}</span>
          </span>
          <span style={{ fontWeight: 600, color: 'var(--color-brand)' }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 7, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-brand-fill), var(--color-brand-hover))', borderRadius: 10, transition: 'width .4s ease' }} />
        </div>
        {/* step dots */}
        <div style={{ display: 'flex', gap: 5, marginTop: 8, justifyContent: 'center' }}>
          {QUESTIONS.map((_, i) => (
            <div key={i} style={{ width: i === current ? 18 : 7, height: 7, borderRadius: 10, background: i < current ? 'var(--color-brand)' : i === current ? 'linear-gradient(90deg, var(--color-brand-fill), var(--color-brand-hover))' : 'var(--border)', transition: 'all .3s' }} />
          ))}
        </div>
      </div>

      {/* question */}
      <div className="card" style={{ marginBottom: '1.15rem', textAlign: 'center', padding: '1.75rem', borderColor: 'color-mix(in srgb, var(--color-brand) 20%, transparent)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          {QUESTIONS[current].icon}
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.55, fontFamily: 'var(--font-body)' }}>
          {t(`sortingHat.questions.${QUESTIONS[current].id}.q`)}
        </h2>
      </div>

      {/* options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {QUESTIONS[current].opts.map((opt, i) => {
          const isSel = selected === opt
          return (
            <button key={i} onClick={() => onPick(opt)} disabled={busy}
              className="sh-opt" data-selected={isSel}>
              {/* letter/check */}
              <div className="sh-opt-letter">
                {isSel ? <IcCheck s={13} c="#fff" /> : ['A','B','C','D'][i]}
              </div>
              <span className="sh-opt-text">{t(`sortingHat.questions.${QUESTIONS[current].id}.opts.${opt.id}`)}</span>
              {isSel && <span className="sh-opt-arrow"><IcArrow /></span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
