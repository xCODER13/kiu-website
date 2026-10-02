import { useTranslation } from 'react-i18next'

/* ── Register Stage ───────────────────────────────────────────
   Ism/telefon kiritish shakli. Validatsiya xatolari (fieldErrors)
   va input qiymatlari yuqori komponentdan (SortingHat.jsx) props
   orqali keladi — yagona haqiqat manbai u yerda saqlanadi. */
export default function RegisterStage({ userInfo, setUserInfo, fieldErrors, onBack, onSubmit }) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="card" style={{ marginBottom: '1.25rem', textAlign: 'center', padding: '1.75rem', borderColor: 'color-mix(in srgb, var(--color-brand) 20%, transparent)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{t('sortingHat.register.title')}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{t('sortingHat.register.desc')}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: '1.5rem' }}>
        <div>
          <label className="label label--lg">{t('sortingHat.register.name')}</label>
          <input type="text" value={userInfo.name} onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
            placeholder={t('sortingHat.register.namePlaceholder')}
            className="input input--lg" aria-invalid={fieldErrors.name ? 'true' : undefined} />
          {fieldErrors.name && <div className="field-error field-error--lg">{fieldErrors.name}</div>}
        </div>
        <div>
          <label className="label label--lg">{t('sortingHat.register.phone')}</label>
          <input type="tel" value={userInfo.phone} onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
            placeholder="+998 90 123 45 67"
            className="input input--lg" aria-invalid={fieldErrors.phone ? 'true' : undefined}
            onKeyDown={e => { if (e.key === 'Enter') onSubmit() }} />
          {fieldErrors.phone && <div className="field-error field-error--lg">{fieldErrors.phone}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack}
          style={{ padding: '12px 20px', background: 'var(--gradient-brand)', color: 'var(--color-on-brand)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          {t('sortingHat.register.back')}
        </button>
        <button onClick={onSubmit} disabled={!userInfo.name.trim() || !userInfo.phone.trim()}
          style={{ flex: 1, padding: '12px 20px', background: !userInfo.name.trim() || !userInfo.phone.trim() ? 'var(--border)' : 'var(--gradient-brand)', color: 'var(--color-on-brand)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: !userInfo.name.trim() || !userInfo.phone.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all .2s' }}>
          {t('sortingHat.register.start')}
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 12, lineHeight: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        {t('sortingHat.register.privacy')}
      </p>
    </div>
  )
}
