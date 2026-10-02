import { useState, useEffect } from 'react'
import { API, H, HF, errorMessage, asArray } from './shared/api'
import { Ic } from './shared/Icons.jsx'
import { markBroken } from './shared/helpers'
import { useSingleImageUpload } from './shared/useImageUpload'

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']

// Ro'yxatdagi kun/oy nishonchasi uchun — eventDate'dan (ISO string) kun va
// oy nomini ajratib oladi. UTC bilan o'qiladi, chunki backend ham sanani
// vaqt mintaqasiz, sof kalendar sana sifatida saqlaydi (00:00 UTC).
function dayMonthBadge(iso) {
  if (!iso) return { day: '', month: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '', month: '' }
  return { day: String(d.getUTCDate()), month: UZ_MONTHS[d.getUTCMonth()] || '' }
}

export default function EventsAdmin() {
  const [events, setEvents] = useState([])
  const [form, setForm]     = useState({ title: '', desc: '', eventDate: '', type: 'general', image: '' })
  const [editing, setEdit]  = useState(null)
  const [open, setOpen]     = useState(false)
  const [uploading, setUploading] = useState(false)

  const { imageFile, imagePreview, setImageFile, setImagePreview, handleImageSelect, clearImage } = useSingleImageUpload()

  const types = [['general','Umumiy'],['open','Ochiq kun'],['culture','Madaniy'],['science','Ilmiy'],['sport','Sport'],['graduation','Bitiruvchilar'],['admission','Qabul']]

  useEffect(() => { fetch(`${API}/events`).then(r => r.json()).then(d => setEvents(asArray(d))).catch(() => {}) }, [])

  function removeImage() {
    clearImage()
    setForm(f => ({ ...f, image: '' }))
  }

  async function save() {
    if (!form.title.trim() || !form.eventDate.trim()) return alert('Sarlavha va sana kiritilishi shart!')

    // Rasm — bor bo'lsa haqiqiy fayl sifatida, bo'lmasa mavjud/olib
    // tashlangan holatini bildiruvchi `existingImage` sifatida yuboriladi.
    // Yuklashning o'zi backendda (service_role kalit bilan) amalga oshadi.
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('desc', form.desc)
    fd.append('eventDate', form.eventDate)
    fd.append('type', form.type)
    fd.append('existingImage', form.image || '')
    if (imageFile) fd.append('imageFile', imageFile)

    setUploading(true)
    try {
      const url = editing ? `${API}/events/${editing}` : `${API}/events`
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: HF(), body: fd })
      if (!res.ok) return alert(await errorMessage(res, 'Tadbir saqlanmadi.'))
      const data = await res.json()
      if (editing) setEvents(p => p.map(e => e._id === editing ? data : e))
      else setEvents(p => [data, ...p])

      setForm({ title: '', desc: '', eventDate: '', type: 'general', image: '' })
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
      const res = await fetch(`${API}/events/${id}`, { method: 'DELETE', headers: H() })
      if (!res.ok) return alert(await errorMessage(res, "O'chirib bo'lmadi."))
      setEvents(p => p.filter(e => e._id !== id))
    } catch {
      alert("Server bilan bog'lanib bo'lmadi.")
    }
  }

  return (
    <div>
      <div className="adm-crud-head">
        <h2 className="adm-page-title">Tadbirlar ({events.length})</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => {
          setOpen(!open); setEdit(null)
          setForm({ title: '', desc: '', eventDate: '', type: 'general', image: '' })
          setImageFile(null); setImagePreview(null)
        }}>{Ic.add} Yangi</button>
      </div>

      {open && (
        <div className="adm-card adm-form">
          <h3 className="adm-form-title">{editing ? 'Tahrirlash' : 'Yangi tadbir'}</h3>
          <div className="adm-form-body">
            <div><label className="adm-label">Sarlavha *</label><input className="adm-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tadbir nomi" /></div>
            <div className="adm-form-grid">
              <div>
                <label className="adm-label">Sana *</label>
                <input
                  className="adm-input"
                  type="date"
                  value={form.eventDate}
                  onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="adm-label">Turi</label>
                <select className="adm-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {types.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="adm-label">Poster rasm</label>
              <label className="adm-upload">
                {Ic.photo}
                {imagePreview ? 'Rasmni almashtirish' : "Rasm qo'shish"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} hidden />
              </label>
              {imagePreview && (
                <div className="adm-preview">
                  <img className="adm-preview-img adm-preview-img--poster" src={imagePreview} alt="poster" loading="lazy" onError={markBroken} />
                  <button className="adm-thumb-x" onClick={removeImage} aria-label="Rasmni olib tashlash">×</button>
                </div>
              )}
              <div className="adm-hint">JPEG, PNG, WebP · maks 5 MB · ixtiyoriy — bo'lmasa sana-badge ko'rsatiladi</div>
            </div>

            <div><label className="adm-label">Tavsif</label><textarea className="adm-input adm-input--area" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3} /></div>

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

      <div className="adm-list">
        {events.map(e => (
          <div key={e._id} className="adm-card adm-row adm-row--center">
            <div className="adm-row-left">
              {e.image ? (
                <img className="adm-row-thumb" src={e.image} alt={e.title} loading="lazy" onError={markBroken} />
              ) : (
                <div className="adm-event-date">
                  <div className="adm-event-day">{dayMonthBadge(e.eventDate).day}</div>
                  <div className="adm-event-month">{dayMonthBadge(e.eventDate).month}</div>
                </div>
              )}
              <div className="adm-row-main">
                <div className="adm-row-title adm-row-title--tight">{e.title}</div>
                <div className="adm-row-text">{e.desc}</div>
              </div>
            </div>
            <div className="adm-actions adm-actions--fixed">
              <button className="adm-btn adm-btn--edit" aria-label="Tahrirlash" onClick={() => {
                setEdit(e._id)
                // <input type="date"> aniq "YYYY-MM-DD" formatini talab qiladi —
                // backend to'liq ISO datetime qaytaradi, shuning uchun kesib olamiz
                setForm({ title: e.title, desc: e.desc || '', eventDate: (e.eventDate || '').slice(0, 10), type: e.type || 'general', image: e.image || '' })
                setImageFile(null)
                setImagePreview(e.image || null)
                setOpen(true)
              }}>{Ic.edit}</button>
              <button className="adm-btn adm-btn--danger" aria-label="O'chirish" onClick={() => del(e._id)}>{Ic.del}</button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="adm-blank">Hali tadbir yo'q</p>}
      </div>
    </div>
  )
}
