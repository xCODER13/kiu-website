import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API, H } from './shared/api'
import { Ic } from './shared/Icons.jsx'

export default function ProfileAdmin() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [msg, setMsg]   = useState(null)
  const navigate = useNavigate()

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
      if (res.ok) {
        setMsg({ type: 'success', text: 'Parol muvaffaqiyatli o\'zgartirildi!' })
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        // Backend parol o'zgargach eski tokenlarni bekor qiladi (iat < passwordChangedAt),
        // shuning uchun eski token endi foydasiz — tozalab, qayta kirishni so'raymiz.
        localStorage.removeItem('kiu_token')
        setTimeout(() => navigate('/admin/login'), 1500)
      }
      else setMsg({ type: 'error', text: data.error || 'Xato yuz berdi' })
    } catch { setMsg({ type: 'error', text: 'Server bilan bog\'lanib bo\'lmadi' }) }
  }

  return (
    <div>
      <h2 className="adm-page-title adm-page-title--spaced">Profil sozlamalari</h2>
      <div className="adm-profile-grid">
        <div className="adm-card">
          <h3 className="adm-profile-title">{Ic.profile} Admin ma'lumotlari</h3>
          {[['Login','admin'],['Rol','Super Admin'],['Tizim','KIU Admin Panel'],['URL','localhost:5173/admin']].map(([l,v]) => (
            <div key={l} className="adm-info-row">
              <span className="adm-info-key">{l}</span>
              <span className="adm-info-value">{v}</span>
            </div>
          ))}
        </div>

        <div className="adm-card">
          <h3 className="adm-profile-title">{Ic.key} Parolni o'zgartirish</h3>
          <form className="adm-form-body" onSubmit={handleSubmit}>
            <div><label className="adm-label">Joriy parol *</label><input className="adm-input" type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required placeholder="••••••••" /></div>
            <div><label className="adm-label">Yangi parol *</label><input className="adm-input" type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required placeholder="Kamida 8 ta belgi" /></div>
            <div><label className="adm-label">Tasdiqlang *</label><input className="adm-input" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required placeholder="••••••••" /></div>
            {msg && (
              <div className="adm-msg" data-type={msg.type}>
                {msg.type === 'success' ? Ic.check : Ic.del} {msg.text}
              </div>
            )}
            <button type="submit" className="adm-btn adm-btn--primary">{Ic.save} Parolni saqlash</button>
          </form>
        </div>
      </div>
    </div>
  )
}
