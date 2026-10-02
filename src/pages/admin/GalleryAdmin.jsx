import { useState, useEffect } from 'react'
import { API, H, HF, errorMessage, asArray } from './shared/api'
import { Ic } from './shared/Icons.jsx'
import { markBroken } from './shared/helpers'
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
      <div className="adm-crud-head">
        <h2 className="adm-page-title">Galereya ({items.length})</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => { setOpen(!open); setEdit(null); clear(); setForm({ title: '', desc: '' }) }}>{Ic.add} Yangi</button>
      </div>

      {open && (
        <div className="adm-card adm-form">
          <h3 className="adm-form-title">{editing ? 'Tahrirlash' : 'Yangi albom'}</h3>
          <div className="adm-form-body">
            <div className="adm-form-grid">
              <div><label className="adm-label">Nomi *</label><input className="adm-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="1-kampus" /></div>
              <div><label className="adm-label">Tavsif</label><input className="adm-input" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Kampus binosi" /></div>
            </div>

            <div>
              <label className="adm-label">Rasmlar ({imagePreviews.length} ta) *</label>
              <label className="adm-upload">
                {Ic.photo}
                Rasm qo'shish
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleFileSelect} hidden />
              </label>
              <div className="adm-hint">JPEG, PNG, WebP · maks 5 MB · bir vaqtda bir nechtasini tanlash mumkin</div>
            </div>

            {imagePreviews.length > 0 && (
              <div className="adm-thumbs">
                {imagePreviews.map((p, i) => (
                  <div key={i} className="adm-thumb">
                    <img className="adm-thumb-img" data-new={p.isNew ? 'true' : 'false'} src={p.url} alt={`rasm-${i + 1}`} loading="lazy" onError={markBroken} />
                    {p.isNew && <span className="adm-thumb-new">YANGI</span>}
                    <button className="adm-thumb-x" onClick={() => removeImage(i)} aria-label="Rasmni olib tashlash">×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="adm-note">
              Bir albomga bir nechta rasm qo'shish mumkin — masalan bir binoning turli burchaklardan olingan suratlari.
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

      <div className="adm-grid adm-grid--albums">
        {items.map(item => (
          <div key={item._id} className="adm-card adm-album">
            <div className="adm-album-cover">
              {item.images?.[0] && (
                <img src={item.images[0]} alt={item.title} loading="lazy" onError={markBroken} />
              )}
            </div>
            <div className="adm-album-body">
              <div className="adm-album-title">{item.title}</div>
              {item.desc && <div className="adm-album-desc">{item.desc}</div>}
              <div className="adm-album-count">{(item.images || []).length} ta rasm</div>
              <div className="adm-actions">
                <button className="adm-btn adm-btn--edit" onClick={() => startEdit(item)}>{Ic.edit} Tahrir</button>
                <button className="adm-btn adm-btn--danger" onClick={() => del(item._id)}>{Ic.del} O'chir</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="adm-blank adm-blank--grid">Hali albom qo'shilmagan</p>}
      </div>
    </div>
  )
}
