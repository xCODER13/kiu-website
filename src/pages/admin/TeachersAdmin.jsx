import { useState, useEffect } from 'react'
import { API, H, HF, errorMessage, asArray } from './shared/api.js'
import { Ic } from './shared/Icons.jsx'
import { markBroken } from './shared/helpers.js'
import { useSingleImageUpload } from './shared/useImageUpload.js'

const KAFEDRALAR = [
  "Iqtisodiyot va muhandislik kafedrasi",
  "Aniq fanlar kafedrasi",
  "Filologiya va tillarni o'qitish kafedrasi",
  "Ijtimoiy-gumanitar fanlar kafedrasi",
  "Ijtimoiy fanlar kafedrasi",
]

export default function TeachersAdmin() {
  const [teachers, setTeachers] = useState([])
  const [form, setForm]         = useState({ name: '', role: '', dept: '', email: '', avatar: '', image: '' })
  const [editing, setEdit]      = useState(null)
  const [open, setOpen]         = useState(false)
  const [uploading, setUploading] = useState(false)
  const colors = ['#7c3aed','#4f46e5','#0088cc','#059669','#d97706','#db2777']

  const { imageFile, imagePreview, setImageFile, setImagePreview, handleImageSelect, clearImage } = useSingleImageUpload()

  useEffect(() => { fetch(`${API}/teachers`).then(r => r.json()).then(d => setTeachers(asArray(d))).catch(() => {}) }, [])

  function removeImage() {
    clearImage()
    setForm(f => ({ ...f, image: '' }))
  }

  async function save() {
    if (!form.name.trim() || !form.role.trim()) return alert('Ism va lavozim kiritilishi shart!')

    // Rasm — bor bo'lsa haqiqiy fayl sifatida, bo'lmasa mavjud/olib
    // tashlangan holatini bildiruvchi `existingImage` sifatida yuboriladi.
    // Yuklashning o'zi backendda (service_role kalit bilan) amalga oshadi.
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('role', form.role)
    fd.append('dept', form.dept)
    fd.append('email', form.email)
    fd.append('avatar', form.avatar)
    fd.append('existingImage', form.image || '')
    if (imageFile) fd.append('imageFile', imageFile)

    setUploading(true)
    try {
      const url = editing ? `${API}/teachers/${editing}` : `${API}/teachers`
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: HF(), body: fd })
      if (!res.ok) return alert(await errorMessage(res, "O'qituvchi saqlanmadi."))
      const data = await res.json()
      if (editing) setTeachers(p => p.map(t => t._id === editing ? data : t))
      else setTeachers(p => [data, ...p])

      setForm({ name: '', role: '', dept: '', email: '', avatar: '', image: '' })
      setImageFile(null); setImagePreview(null)
      setEdit(null); setOpen(false)
    } catch {
      alert("Server bilan bog'lanib bo'lmadi.")
    } finally {
      setUploading(false)
    }
  }

  async function del(id) {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
    try {
      const res = await fetch(`${API}/teachers/${id}`, { method: 'DELETE', headers: H() })
      if (!res.ok) return alert(await errorMessage(res, "O'chirib bo'lmadi."))
      setTeachers(p => p.filter(t => t._id !== id))
    } catch {
      alert("Server bilan bog'lanib bo'lmadi.")
    }
  }

  return (
    <div>
      <div className="adm-crud-head">
        <h2 className="adm-page-title">O'qituvchilar ({teachers.length})</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => {
          setOpen(!open); setEdit(null)
          setForm({ name: '', role: '', dept: '', email: '', avatar: '', image: '' })
          setImageFile(null); setImagePreview(null)
        }}>{Ic.add} Yangi</button>
      </div>

      {open && (
        <div className="adm-card adm-form">
          <h3 className="adm-form-title">{editing ? 'Tahrirlash' : "Yangi o'qituvchi"}</h3>
          <div className="adm-form-body">
            <div><label className="adm-label">To'liq ism *</label><input className="adm-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Familiya Ism Sharif" /></div>
            <div className="adm-form-grid">
              <div><label className="adm-label">Lavozim *</label><input className="adm-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="O'qituvchi / Dotsent" /></div>
              <div><label className="adm-label">Avatar (2 harf)</label><input className="adm-input" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="AB" maxLength={2} /></div>
            </div>

            <div>
              <label className="adm-label">Foto (ixtiyoriy)</label>
              <label className="adm-upload">
                {Ic.photo}
                {imagePreview ? 'Fotoni almashtirish' : "Foto qo'shish"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} hidden />
              </label>
              {imagePreview && (
                <div className="adm-preview">
                  <img className="adm-preview-img adm-preview-img--avatar" src={imagePreview} alt="foto" loading="lazy" onError={markBroken} />
                  <button className="adm-thumb-x adm-thumb-x--sm" onClick={removeImage} aria-label="Rasmni olib tashlash">×</button>
                </div>
              )}
              <div className="adm-hint">JPEG, PNG, WebP · maks 5 MB · rasm bo'lmasa 2-harfli avatar ko'rsatiladi</div>
            </div>

            <div><label className="adm-label">Kafedra *</label>
              <select className="adm-input" value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })}>
                <option value="">— Kafedrni tanlang —</option>
                {KAFEDRALAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            {uploading && (
              <div className="adm-saving">
                <div className="adm-spinner" />
                Saqlanmoqda...
              </div>
            )}

            <div className="adm-form-actions">
              <button className="adm-btn adm-btn--primary" onClick={save} disabled={uploading}>{Ic.save} {editing ? 'Saqlash' : "Qo'shish"}</button>
              <button className="adm-btn" onClick={() => { setOpen(false); setEdit(null) }}>Bekor</button>
            </div>
          </div>
        </div>
      )}

      <div className="adm-grid adm-grid--teachers">
        {teachers.map((t, i) => (
          <div key={t._id} className="adm-card">
            <div className="adm-teacher-head">
              {/* Avatar foni — ma'lumot indeksidan (spec 7.5: dinamik qiymat); palitra 6.11 da */}
              <div className="adm-avatar" style={{ background: colors[i % colors.length] }}>
                {t.image
                  ? <img src={t.image} alt={t.name} loading="lazy" onError={markBroken} />
                  : (t.avatar || t.name?.slice(0,2).toUpperCase())}
              </div>
              <div className="adm-row-main">
                <div className="adm-teacher-name">{t.name}</div>
                <div className="adm-teacher-role">{t.role}</div>
              </div>
            </div>
            <div className="adm-teacher-dept">{t.dept}</div>
            {t.email && <div className="adm-teacher-email">{t.email}</div>}
            <div className="adm-actions">
              <button className="adm-btn adm-btn--edit" onClick={() => {
                setEdit(t._id)
                setForm({ name: t.name, role: t.role, dept: t.dept, email: t.email || '', avatar: t.avatar || '', image: t.image || '' })
                setImageFile(null)
                setImagePreview(t.image || null)
                setOpen(true)
              }}>{Ic.edit} Tahrir</button>
              <button className="adm-btn adm-btn--danger" aria-label="O'chirish" onClick={() => del(t._id)}>{Ic.del}</button>
            </div>
          </div>
        ))}
        {teachers.length === 0 && <p className="adm-blank adm-blank--grid">Hali o'qituvchi qo'shilmagan</p>}
      </div>
    </div>
  )
}
