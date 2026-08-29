import { useState } from 'react'
import { validateFullName, validatePhone, errorBorder } from '../utils/validation'

const inputBase = { width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }
const fieldErrStyle = { fontSize: 11.5, color: '#dc2626', marginTop: 4 }

export default function ApplyModal({ onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', faculty: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validate() {
    const errs = {
      name: validateFullName(form.name),
      phone: validatePhone(form.phone),
    }
    setFieldErrors(errs)
    return !errs.name && !errs.phone
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(false)
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, faculty: form.faculty, message: form.message, type: 'admission' }),
      })
      if (!res.ok) throw new Error('Request failed')
      setSent(true)
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg)', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 480, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {!sent ? (
          <>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '.35rem', color: 'var(--text)' }}>Ariza topshirish</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>Ma'lumotlaringizni kiriting — biz siz bilan bog'lanamiz</p>
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>To'liq ism *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Ism Familiya"
                  style={errorBorder(fieldErrors.name, inputBase)} />
                {fieldErrors.name && <div style={fieldErrStyle}>{fieldErrors.name}</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Telefon raqam *</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67"
                  style={errorBorder(fieldErrors.phone, inputBase)} />
                {fieldErrors.phone && <div style={fieldErrStyle}>{fieldErrors.phone}</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Yo'nalish</label>
                <select name="faculty" value={form.faculty} onChange={handleChange}
                  style={inputBase}>
                  <option value="">Yo'nalishni tanlang</option>
                  <option>Maktabgacha ta'lim</option>
                  <option>Boshlang'ich ta'lim</option>
                  <option>Dasturiy injiniring</option>
                  <option>Iqtisodiyot</option>
                  <option>Moliya va moliyaviy texnologiyalar</option>
                  <option>Buxgalteriya hisobi</option>
                  <option>Psixologiya</option>
                  <option>Filologiya va tillarni o'qitish</option>
                  <option>Neft va gaz ishi</option>
                  <option>Milliy g'oya va huquq ta'limi</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Qo'shimcha izoh</label>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Savollaringiz bo'lsa yozing..." rows={3}
                  style={{ ...inputBase, resize: 'none' }} />
              </div>
              {error && (
                <div style={{ fontSize: 12.5, color: '#dc2626', background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.25)', borderRadius: 10, padding: '10px 14px' }}>
                  Arizani yuborishda xatolik yuz berdi. Internet aloqasini tekshirib, qayta urinib ko'ring.
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }} disabled={loading}>
                {loading ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple-pale), var(--purple-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#7c3aed' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text)', marginBottom: '.5rem' }}>Ariza yuborildi!</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>Tez orada siz bilan bog'lanamiz.</p>
            <button onClick={onClose} className="btn btn-primary" style={{ margin: '0 auto' }}>Yopish</button>
          </div>
        )}
      </div>
    </div>
  )
}