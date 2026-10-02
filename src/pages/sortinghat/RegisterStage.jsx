import { useTranslation } from 'react-i18next'
import { errorBorder } from '../../utils/validation'

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
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-brand),var(--color-brand-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{t('sortingHat.register.name')}</label>
          <input type="text" value={userInfo.name} onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
            placeholder={t('sortingHat.register.namePlaceholder')}
            style={errorBorder(fieldErrors.name, { width: '100%', padding: '12px 14px', border: '2px solid var(--border)', borderRadius: 12, fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', transition: 'border-color .2s' })}
            onFocus={e => e.target.style.borderColor = 'var(--color-brand)'}
            onBlur={e => e.target.style.borderColor = fieldErrors.name ? '#dc2626' : 'var(--border)'} />
          {fieldErrors.name && <div style={{ fontSize: 11.5, color: 'var(--color-danger)', marginTop: 5 }}>{fieldErrors.name}</div>}
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{t('sortingHat.register.phone')}</label>
          <input type="tel" value={userInfo.phone} onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
            placeholder="+998 90 123 45 67"
            style={errorBorder(fieldErrors.phone, { width: '100%', padding: '12px 14px', border: '2px solid var(--border)', borderRadius: 12, fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', transition: 'border-color .2s' })}
            onFocus={e => e.target.style.borderColor = 'var(--color-brand)'}
            onBlur={e => e.target.style.borderColor = fieldErrors.phone ? '#dc2626' : 'var(--border)'}
            onKeyDown={e => { if (e.key === 'Enter') onSubmit() }} />
          {fieldErrors.phone && <div style={{ fontSize: 11.5, color: 'var(--color-danger)', marginTop: 5 }}>{fieldErrors.phone}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack}
          style={{ padding: '12px 20px', background: 'linear-gradient(135deg,var(--color-brand),var(--color-brand-hover))', color: 'var(--color-on-brand)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          {t('sortingHat.register.back')}
        </button>
        <button onClick={onSubmit} disabled={!userInfo.name.trim() || !userInfo.phone.trim()}
          style={{ flex: 1, padding: '12px 20px', background: !userInfo.name.trim() || !userInfo.phone.trim() ? 'var(--border)' : 'linear-gradient(135deg,var(--color-brand),var(--color-brand-hover))', color: 'var(--color-on-brand)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: !userInfo.name.trim() || !userInfo.phone.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all .2s' }}>
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
