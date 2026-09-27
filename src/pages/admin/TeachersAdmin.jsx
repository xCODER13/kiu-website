import { useState, useEffect } from 'react'
import { API, H, HF, errorMessage, asArray } from './shared/api.js'
import { card, inp, lbl, bP, bD, bE, bG } from './shared/styles.js'
import { Ic } from './shared/Icons.jsx'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>O'qituvchilar ({teachers.length})</h2>
        <button style={bP} onClick={() => {
          setOpen(!open); setEdit(null)
          setForm({ name: '', role: '', dept: '', email: '', avatar: '', image: '' })
          setImageFile(null); setImagePreview(null)
        }}>{Ic.add} Yangi</button>
      </div>

      {open && (
        <div style={{ ...card, marginBottom: '1.5rem', borderColor: '#7c3aed' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: '1rem' }}>{editing ? 'Tahrirlash' : "Yangi o'qituvchi"}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={lbl}>To'liq ism *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Familiya Ism Sharif" style={inp} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={lbl}>Lavozim *</label><input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="O'qituvchi / Dotsent" style={inp} /></div>
              <div><label style={lbl}>Avatar (2 harf)</label><input value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="AB" maxLength={2} style={inp} /></div>
            </div>

            <div>
              <label style={lbl}>Foto (ixtiyoriy)</label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: '1px dashed #7c3aed', color: '#7c3aed', background: 'rgba(124,58,237,.05)' }}>
                {Ic.photo}
                {imagePreview ? 'Fotoni almashtirish' : "Foto qo'shish"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} style={{ display: 'none' }} />
              </label>
              {imagePreview && (
                <div style={{ position: 'relative', display: 'inline-block', marginLeft: 10, verticalAlign: 'middle' }}>
                  <img src={imagePreview} alt="foto" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%', border: '2px solid #7c3aed', display: 'block' }} onError={e => e.target.style.opacity = '0.3'} />
                  <button onClick={removeImage} style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '18px', padding: 0 }}>×</button>
                </div>
              )}
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>JPEG, PNG, WebP · maks 5 MB · rasm bo'lmasa 2-harfli avatar ko'rsatiladi</div>
            </div>

            <div><label style={lbl}>Kafedra *</label>
              <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} style={inp}>
                <option value="">— Kafedrni tanlang —</option>
                {KAFEDRALAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            {uploading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#7c3aed' }}>
                <div style={{ width: 14, height: 14, border: '2px solid #ede9fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Saqlanmoqda...
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...bP, opacity: uploading ? .6 : 1 }} onClick={save} disabled={uploading}>{Ic.save} {editing ? 'Saqlash' : "Qo'shish"}</button>
              <button style={bG} onClick={() => { setOpen(false); setEdit(null) }}>Bekor</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
        {teachers.map((t, i) => (
          <div key={t._id} style={card}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {t.image
                  ? <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={ev => { ev.target.style.display = 'none' }} />
                  : (t.avatar || t.name?.slice(0,2).toUpperCase())}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#7c3aed' }}>{t.role}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{t.dept}</div>
            {t.email && <div style={{ fontSize: 11, color: '#7c3aed', marginBottom: '0.75rem' }}>{t.email}</div>}
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={bE} onClick={() => {
                setEdit(t._id)
                setForm({ name: t.name, role: t.role, dept: t.dept, email: t.email || '', avatar: t.avatar || '', image: t.image || '' })
                setImageFile(null)
                setImagePreview(t.image || null)
                setOpen(true)
              }}>{Ic.edit} Tahrir</button>
              <button style={bD} onClick={() => del(t._id)}>{Ic.del}</button>
            </div>
          </div>
        ))}
        {teachers.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '2rem', gridColumn: '1/-1' }}>Hali o'qituvchi qo'shilmagan</p>}
      </div>
    </div>
  )
}