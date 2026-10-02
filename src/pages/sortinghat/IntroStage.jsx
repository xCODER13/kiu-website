import { useTranslation } from 'react-i18next'
import { IcQuestion, IcBolt, IcTarget, IcSparkle, IcBulb, IcPlay } from './Icons.jsx'
import { QUESTIONS } from './Data.jsx'

/* ── Intro Stage ───────────────────────────────────────────── */
export const INFO_CARD_MIN_WIDTH = 128
export const INFO_CARD_GAP = 12

export default function IntroStage({ onStart }) {
  const { t } = useTranslation()
  return (
    <div>
      {/* info cards — 4 tasi bitta qatorda. Sahifa konteyneri 680px (ichki kenglik ~615px), shuning
          uchun minimal ustun kengligi INFO_CARD_MIN_WIDTH: 4*128 + 3*12 = 548px sig'adi. Avval 148px edi
          (4*148 + 36 = 628px > 615px) va 4-karta pastki qatorga tushib qolardi. Telefonda o'zi 2x2 bo'ladi. */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${INFO_CARD_MIN_WIDTH}px,1fr))`, gap: INFO_CARD_GAP, marginBottom: '1.75rem' }}>
        {[
          { icon: <IcQuestion />,   title: t('sortingHat.intro.cards.questions.title', { n: QUESTIONS.length }), desc: t('sortingHat.intro.cards.questions.desc') },
          { icon: <IcBolt />,        title: t('sortingHat.intro.cards.time.title'),     desc: t('sortingHat.intro.cards.time.desc') },
          { icon: <IcTarget />,      title: t('sortingHat.intro.cards.top3.title'),     desc: t('sortingHat.intro.cards.top3.desc') },
          { icon: <IcSparkle />,     title: t('sortingHat.intro.cards.personal.title'), desc: t('sortingHat.intro.cards.personal.desc') },
        ].map((c, i) => (
          <div key={i} className="card" style={{ padding: '1.15rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{c.title}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* how it works */}
      <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'color-mix(in srgb, var(--color-brand) 25%, transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
          <IcBulb s={20} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{t('sortingHat.intro.howTitle')}</h3>
        </div>
        {[
          { n: '1', t: t('sortingHat.intro.steps.1.title'), d: t('sortingHat.intro.steps.1.desc') },
          { n: '2', t: t('sortingHat.intro.steps.2.title'), d: t('sortingHat.intro.steps.2.desc') },
          { n: '3', t: t('sortingHat.intro.steps.3.title'), d: t('sortingHat.intro.steps.3.desc') },
          { n: '4', t: t('sortingHat.intro.steps.4.title'), d: t('sortingHat.intro.steps.4.desc') },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 3 ? '0.7rem' : 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-brand)', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.t}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={onStart} className="sh-start">
          <IcPlay s={18} /> {t('sortingHat.intro.start')}
        </button>
      </div>
    </div>
  )
}
