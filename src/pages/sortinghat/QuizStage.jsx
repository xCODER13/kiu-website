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
          <span style={{ fontWeight: 600, color: '#7c3aed' }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 7, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', borderRadius: 10, transition: 'width .4s ease' }} />
        </div>
        {/* step dots */}
        <div style={{ display: 'flex', gap: 5, marginTop: 8, justifyContent: 'center' }}>
          {QUESTIONS.map((_, i) => (
            <div key={i} style={{ width: i === current ? 18 : 7, height: 7, borderRadius: 10, background: i < current ? '#7c3aed' : i === current ? 'linear-gradient(90deg,#7c3aed,#4f46e5)' : 'var(--border)', transition: 'all .3s' }} />
          ))}
        </div>
      </div>

      {/* question */}
      <div className="card" style={{ marginBottom: '1.15rem', textAlign: 'center', padding: '1.75rem', borderColor: 'rgba(124,58,237,.2)' }}>
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
              style={{
                width: '100%', padding: '0.9rem 1.1rem', textAlign: 'left',
                cursor: busy ? 'default' : 'pointer',
                background: isSel ? 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(79,70,229,.12))' : 'var(--bg)',
                border: `2px solid ${isSel ? '#7c3aed' : 'var(--border)'}`,
                borderRadius: 12, fontSize: 13.5, color: 'var(--text)',
                fontFamily: 'var(--font-body)', transition: 'all .18s',
                display: 'flex', alignItems: 'center', gap: 12,
                transform: isSel ? 'scale(1.01)' : 'scale(1)',
              }}
              onMouseEnter={e => { if (!isSel && !busy) { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = 'rgba(124,58,237,.05)' }}}
              onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)' }}}>
              {/* letter/check */}
              <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s', background: isSel ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'var(--bg-2)', border: `2px solid ${isSel ? '#7c3aed' : 'var(--border)'}`, color: isSel ? '#fff' : 'var(--muted)', fontSize: 12, fontWeight: 700 }}>
                {isSel ? <IcCheck s={13} c="#fff" /> : ['A','B','C','D'][i]}
              </div>
              <span style={{ lineHeight: 1.5 }}>{t(`sortingHat.questions.${QUESTIONS[current].id}.opts.${opt.id}`)}</span>
              {isSel && <span style={{ marginLeft: 'auto', flexShrink: 0, color: '#7c3aed' }}><IcArrow /></span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
