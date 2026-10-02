import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      // JSON bo'lmagan javob (429/502 HTML va h.k.) ham to'g'ri xabar berishi uchun
      const data = await res.json().catch(() => null)
      if (data?.token) {
        localStorage.setItem('kiu_token', data.token)
        navigate('/admin')
      } else if (res.status === 429) {
        setError(data?.error || "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring")
      } else if (data === null) {
        setError('Server bilan bog\'lanib bo\'lmadi')
      } else {
        setError(data.error || 'Xato yuz berdi')
      }
    } catch {
      setError('Server bilan bog\'lanib bo\'lmadi')
    }
    setLoading(false)
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="auth-title">Admin Panel</h2>
          <p className="auth-sub">KIU boshqaruv tizimi</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="input auth-input"
            placeholder="Login"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
          <div className="auth-pass">
            <input
             className="input auth-input auth-input--pass"
             type={showPass ? 'text' : 'password'}
             placeholder="Parol"
             value={form.password}
             onChange={e => setForm({ ...form, password: e.target.value })}
             />
             <button type="button" className="auth-eye" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Parolni berkitish" : "Parolni ko'rsatish"}>
              {showPass ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
               )}
             </button>
           </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading} aria-busy={loading}>
            {loading ? 'Kirmoqda...' : 'Kirish'}
          </button>
        </form>
      </div>
    </main>
  )
}