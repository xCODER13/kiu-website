import { useTranslation, Trans } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import { IcStar, IcHat, IcGrad, IcArrow, IcFile, IcBulb, IcRefresh } from './Icons.jsx'
import { FACULTIES, MEDALS, RANKS } from './Data'

/* ── Result Stage ──────────────────────────────────────────── */
export default function ResultStage({ result, onRestart }) {
  const { t } = useTranslation()
  return (
    <div>
      {/* result header */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1.75rem', background: 'linear-gradient(135deg,rgba(124,58,237,.08),rgba(79,70,229,.08))', borderColor: 'rgba(124,58,237,.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '0.75rem' }}>
          <IcStar s={20} />
          <IcHat />
          <IcStar s={20} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem', fontFamily: 'var(--font-body)' }}>
          {t('sortingHat.result.title')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          {t('sortingHat.result.desc')}
        </p>
      </div>

      {/* faculty cards */}
      {result.map((key, idx) => {
        const fac = FACULTIES[key]
        if (!fac) return null
        return (
         <div key={key} className="card" style={{ marginBottom: '1.1rem', overflow: 'hidden', borderColor: fac.color + '50', position: 'relative' }}>
            {/* top stripe */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: fac.grad }} />
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingTop: 6 }}>
              {/* icon */}
              <div style={{ width: 50, height: 50, borderRadius: 13, background: fac.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: `0 4px 14px ${fac.color}40` }}>
                {fac.icon}
              </div>
              <div style={{ flex: 1 }}>
                {/* rank badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: fac.color }}>
                    {MEDALS[idx]} {t(`sortingHat.result.ranks.${RANKS[idx]}`)}
                  </span>
                  {idx === 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, background: fac.color + '18', color: fac.color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                      <IcStar s={9} c={fac.color} /> {t('sortingHat.result.best')}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{t(`sortingHat.faculties.${key}.name`)}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.65, marginBottom: '0.75rem' }}>{t(`sortingHat.faculties.${key}.desc`)}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: fac.color, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IcGrad s={12} /> {t('sortingHat.result.careers')}
                    </div>
                    {t(`sortingHat.faculties.${key}.career`, { returnObjects: true }).map((c, i) => (
                      <div key={i} style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <IcArrow s={11} /> {c}
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: fac.color, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IcFile s={12} /> {t('sortingHat.result.subjects')}
                    </div>
                    {t(`sortingHat.faculties.${key}.subjects`, { returnObjects: true }).map((s, i) => (
                      <div key={i} style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <IcArrow s={11} /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* bottom CTA */}
      <div className="card" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.06),rgba(79,70,229,.06))', borderColor: 'rgba(124,58,237,.2)', textAlign: 'center', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><IcBulb s={26} /></div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
          <Trans i18nKey="sortingHat.result.cta" components={{ b: <strong style={{ color: '#7c3aed' }} /> }} />
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <NavLink to="/faculty" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              <IcGrad s={15} /> {t('sortingHat.result.viewPrograms')}
            </button>
          </NavLink>
          <NavLink to="/admission" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              <IcFile s={15} /> {t('sortingHat.result.apply')}
            </button>
          </NavLink>
          <button onClick={onRestart}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            <IcRefresh s={14} /> {t('sortingHat.result.restart')}
          </button>
        </div>
      </div>
    </div>
  )
}
