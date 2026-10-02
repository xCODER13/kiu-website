import { useTranslation } from 'react-i18next'
import { IcQuestion, IcCheck, IcArrow } from './Icons.jsx'
import { QUESTIONS } from './Data'

/* ── Quiz Stage ────────────────────────────────────────────────
   6.11d: progress chizig'i `role="progressbar"` (qiymat — javob berilgan savollar ulushi), nuqtalar dekorativ.
   Holatlar CSS da: `.sh-dot[data-state=done|current]`, `.sh-opt[data-selected]`. Inline stil yo'q — faqat `--pct`. */
export default function QuizStage({ current, selected, busy, onPick }) {
  const { t } = useTranslation()
  const pct = Math.round((current / QUESTIONS.length) * 100)
  const progress = t('sortingHat.quiz.progress', { current: current + 1, total: QUESTIONS.length })

  return (
    <div>
      <div className="sh-progress">
        <div className="sh-progress__row">
          <span className="sh-progress__label"><IcQuestion s={18} />{progress}</span>
          <span className="sh-progress__pct">{pct}%</span>
        </div>
        <div className="sh-progress__bar" role="progressbar" aria-label={progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="sh-progress__fill" style={{ '--pct': `${pct}%` }} />
        </div>
        <div className="sh-dots" aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span key={i} className="sh-dot" data-state={i < current ? 'done' : i === current ? 'current' : 'todo'} />
          ))}
        </div>
      </div>

      <div className="card sh-question">
        <span className="tile tile--56 sh-question__tile">{QUESTIONS[current].icon}</span>
        <h2 className="sh-question__text">{t(`sortingHat.questions.${QUESTIONS[current].id}.q`)}</h2>
      </div>

      <div className="sh-opts">
        {QUESTIONS[current].opts.map((opt, i) => {
          const isSel = selected === opt
          return (
            <button key={i} type="button" onClick={() => onPick(opt)} disabled={busy}
              className="sh-opt" data-selected={isSel}>
              <span className="sh-opt-letter" aria-hidden="true">
                {isSel ? <IcCheck s={16} /> : ['A', 'B', 'C', 'D'][i]}
              </span>
              <span className="sh-opt-text">{t(`sortingHat.questions.${QUESTIONS[current].id}.opts.${opt.id}`)}</span>
              {isSel && <span className="sh-opt-arrow"><IcArrow s={18} /></span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
