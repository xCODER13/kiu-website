import { useState } from 'react'
import { API, H } from './shared/api'
import { card, inp, lbl, bP } from './shared/styles'
import { Ic } from './shared/Icons.jsx'

export default function ProfileAdmin() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [msg, setMsg]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) return setMsg({ type: 'error', text: 'Yangi parollar mos kelmadi!' })
    // TUZATISH: backend (/api/admin/change-password) parolni kamida 8
    // belgi deb talab qiladi (authController.js) — oldin bu yerda "< 6"
    // tekshirilib, lekin xabar "8 ta belgi" deb yozilgan edi. Endi ikkalasi
    // ham backend bilan mos: 8 belgidan qisqa parol backendga yubormasdan
    // shu yerda to'xtatiladi.
    if (form.newPassword.length < 8) return setMsg({ type: 'error', text: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak!' })
    try {
      const res = await fetch(`${API}/admin/change-password`, { method: 'POST', headers: H(), body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) })
      const data = await res.json()
      if (res.ok) { setMsg({ type: 'success', text: 'Parol muvaffaqiyatli o\'zgartirildi!' }); setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
      else setMsg({ type: 'error', text: data.error || 'Xato yuz berdi' })
    } catch { setMsg({ type: 'error', text: 'Server bilan bog\'lanib bo\'lmadi' }) }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>Profil sozlamalari</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>{Ic.profile} Admin ma'lumotlari</h3>
          {[['Login','admin'],['Rol','Super Admin'],['Tizim','KIU Admin Panel'],['URL','localhost:5173/admin']].map(([l,v]) => (
            <div key={l} style={{ padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{l}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>{Ic.key} Parolni o'zgartirish</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={lbl}>Joriy parol *</label><input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required placeholder="••••••••" style={inp} /></div>
            <div><label style={lbl}>Yangi parol *</label><input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required placeholder="Kamida 8 ta belgi" style={inp} /></div>
            <div><label style={lbl}>Tasdiqlang *</label><input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required placeholder="••••••••" style={inp} /></div>
            {msg && (
              <div style={{ padding: '10px 12px', borderRadius: 8, background: msg.type === 'success' ? 'rgba(5,150,105,.1)' : 'rgba(220,38,38,.1)', border: `1px solid ${msg.type === 'success' ? '#059669' : '#dc2626'}`, fontSize: 12, color: msg.type === 'success' ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                {msg.type === 'success' ? Ic.check : Ic.del} {msg.text}
              </div>
            )}
            <button type="submit" style={bP}>{Ic.save} Parolni saqlash</button>
          </form>
        </div>
      </div>
    </div>
  )
}
