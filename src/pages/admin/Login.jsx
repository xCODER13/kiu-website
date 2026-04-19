import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dark = localStorage.getItem('theme') === 'dark'
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
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('kiu_token', data.token)
        navigate('/admin')
      } else {
        setError(data.error || 'Xato yuz berdi')
      }
    } catch {
      setError('Server bilan bog\'lanib bo\'lmadi')
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? '#0f0f1a' : 'linear-gradient(135deg, #faf5ff, #ede9fe)' }}>
      <div style={{ background: dark ? '#1a1a2e' : '#fff', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400, border: dark ? '1px solid rgba(255,255,255,.1)' : '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style={{ fontSize: '1.3rem', color: dark ? '#fff' : '#1a1a2e', marginBottom: 4 }}>Admin Panel</h2> 
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>KIU boshqaruv tizimi</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            placeholder="Login"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none' }}
          />
          <div style={{ position: 'relative' }}>
            <input
             type={showPass ? 'text' : 'password'}
             placeholder="Parol"
             value={form.password}
             onChange={e => setForm({ ...form, password: e.target.value })}
             style={{ width: '100%', padding: '10px 40px 10px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
             />
             <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
              {showPass ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
               )}
             </button>
           </div>
          {error && <p style={{ fontSize: 12, color: '#dc2626', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? 'Kirmoqda...' : 'Kirish'}
          </button>
        </form>
      </div>
    </main>
  )
}