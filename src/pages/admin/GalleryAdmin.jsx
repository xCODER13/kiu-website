import { useState, useEffect } from 'react'
import { API, H, HF, errorMessage, asArray } from './shared/api'
import { card, inp, lbl, bP, bD, bE, bG } from './shared/styles'
import { Ic } from './shared/Icons.jsx'
import { useMultiImageUpload } from './shared/useImageUpload'

export default function GalleryAdmin() {
  const [items, setItems] = useState([])
  const [form, setForm]   = useState({ title: '', desc: '' })
  const [editing, setEdit] = useState(null)
  const [open, setOpen]    = useState(false)
  const [uploading, setUploading] = useState(false)

  // News'dagi bilan bir xil ko'p-rasmli yuklash hook'i — har bir albom bir
  // nechta rasmga ega bo'lishi mumkin (News uslubi, Teachers'dagi bitta rasm
  // emas).
  const { imageFiles, imagePreviews, fileRef, handleFileSelect, removeImage, reset, clear } = useMultiImageUpload()

  useEffect(() => { fetch(`${API}/gallery`).then(r => r.json()).then(d => setItems(asArray(d))).catch(() => {}) }, [])

  async function save() {
    if (!form.title.trim()) return alert('Nom kiritilishi shart!')
    const existingUrls = imagePreviews.filter(p => !p.isNew).map(p => p.url)
    if (existingUrls.length === 0 && imageFiles.length === 0) return alert('Kamida bitta rasm tanlang!')

    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('desc', form.desc)
    fd.append('existingImages', JSON.stringify(existingUrls))
    imageFiles.forEach(f => fd.append('imageFiles', f))

    setUploading(true)
    try {
      const url = editing ? `${API}/gallery/${editing}` : `${API}/gallery`
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: HF(), body: fd })
      if (!res.ok) return alert(await errorMessage(res, 'Albom saqlanmadi.'))
      const data = await res.json()
      if (editing) setItems(p => p.map(i => i._id === editing ? data : i))
      else setItems(p => [data, ...p])

      setForm({ title: '', desc: '' })
      clear(); setEdit(null); setOpen(false)
    } catch {
      alert("Server bilan bog'lanib bo'lmadi.")
    } finally {
      // Tarmoq xatosida ham tugma qayta faollashadi
      setUploading(false)
    }
  }

  async function del(id) {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
    try {
      const res = await fetch(`${API}/gallery/${id}`, { method: 'DELETE', headers: H() })
      if (!res.ok) return alert(await errorMessage(res, "O'chirib bo'lmadi."))
      setItems(p => p.filter(i => i._id !== id))
    } catch {
      alert("Server bilan bog'lanib bo'lmadi.")
    }
  }

  function startEdit(item) {
    setEdit(item._id)
    reset(item.images || [])
    setForm({ title: item.title, desc: item.desc || '' })
    setOpen(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>Galereya ({items.length})</h2>
        <button style={bP} onClick={() => { setOpen(!open); setEdit(null); clear(); setForm({ title: '', desc: '' }) }}>{Ic.add} Yangi</button>
      </div>

      {open && (
        <div style={{ ...card, marginBottom: '1.5rem', borderColor: '#7c3aed' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: '1rem' }}>{editing ? 'Tahrirlash' : 'Yangi albom'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={lbl}>Nomi *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="1-kampus" style={inp} /></div>
              <div><label style={lbl}>Tavsif</label><input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Kampus binosi" style={inp} /></div>
            </div>

            <div>
              <label style={lbl}>Rasmlar ({imagePreviews.length} ta) *</label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: '1px dashed #7c3aed', color: '#7c3aed', background: 'rgba(124,58,237,.05)' }}>
                {Ic.photo}
                Rasm qo'shish
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
              </label>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>JPEG, PNG, WebP · maks 5 MB · bir vaqtda bir nechtasini tanlash mumkin</div>
            </div>

            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {imagePreviews.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={p.url} alt={`rasm-${i + 1}`} style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, border: '2px solid ' + (p.isNew ? '#7c3aed' : '#e5e7eb'), display: 'block' }} onError={e => e.target.style.opacity = '0.3'} />
                    {p.isNew && <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, fontWeight: 700, background: '#7c3aed', color: '#fff', padding: '1px 5px', borderRadius: 10 }}>YANGI</span>}
                    <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '18px', textAlign: 'center', padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '0.75rem', background: 'rgba(124,58,237,.05)', borderRadius: 8, border: '1px solid rgba(124,58,237,.15)', fontSize: 12, color: 'var(--muted)' }}>
              Bir albomga bir nechta rasm qo'shish mumkin — masalan bir binoning turli burchaklardan olingan suratlari.
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {items.map(item => (
          <div key={item._id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 130, background: '#f0eeff', overflow: 'hidden' }}>
              {item.images?.[0] && (
                <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.opacity = '.2'} />
              )}
            </div>
            <div style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.title}</div>
              {item.desc && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{item.desc}</div>}
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>{(item.images || []).length} ta rasm</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={bE} onClick={() => startEdit(item)}>{Ic.edit} Tahrir</button>
                <button style={bD} onClick={() => del(item._id)}>{Ic.del} O'chir</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '2rem', gridColumn: '1/-1' }}>Hali albom qo'shilmagan</p>}
      </div>
    </div>
  )
}