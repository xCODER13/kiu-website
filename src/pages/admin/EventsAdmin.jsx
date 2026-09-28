import { useState, useEffect } from 'react'
import { API, H, HF, errorMessage, asArray } from './shared/api'
import { card, inp, lbl, bP, bD, bE, bG } from './shared/styles'
import { Ic } from './shared/Icons.jsx'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>Tadbirlar ({events.length})</h2>
        <button style={bP} onClick={() => {
          setOpen(!open); setEdit(null)
          setForm({ title: '', desc: '', eventDate: '', type: 'general', image: '' })
          setImageFile(null); setImagePreview(null)
        }}>{Ic.add} Yangi</button>
      </div>

      {open && (
        <div style={{ ...card, marginBottom: '1.5rem', borderColor: '#7c3aed' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: '1rem' }}>{editing ? 'Tahrirlash' : 'Yangi tadbir'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={lbl}>Sarlavha *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tadbir nomi" style={inp} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lbl}>Sana *</label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Turi</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inp}>
                  {types.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={lbl}>Poster rasm</label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: '1px dashed #7c3aed', color: '#7c3aed', background: 'rgba(124,58,237,.05)' }}>
                {Ic.photo}
                {imagePreview ? 'Rasmni almashtirish' : "Rasm qo'shish"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} style={{ display: 'none' }} />
              </label>
              {imagePreview && (
                <div style={{ position: 'relative', display: 'inline-block', marginLeft: 10, verticalAlign: 'middle' }}>
                  <img src={imagePreview} alt="poster" loading="lazy" style={{ width: 70, height: 50, objectFit: 'cover', borderRadius: 8, border: '2px solid #7c3aed', display: 'block' }} onError={e => e.target.style.opacity = '0.3'} />
                  <button onClick={removeImage} aria-label="Rasmni olib tashlash" style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '18px', padding: 0 }}>×</button>
                </div>
              )}
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>JPEG, PNG, WebP · maks 5 MB · ixtiyoriy — bo'lmasa sana-badge ko'rsatiladi</div>
            </div>

            <div><label style={lbl}>Tavsif</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map(e => (
          <div key={e._id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
              {e.image ? (
                <img
                  src={e.image} alt={e.title}
                  loading="lazy"
                  style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                  onError={ev => { ev.target.style.opacity = '0.2' }}
                />
              ) : (
                <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{dayMonthBadge(e.eventDate).day}</div>
                  <div style={{ fontSize: 9, opacity: .75 }}>{dayMonthBadge(e.eventDate).month}</div>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button style={bE} aria-label="Tahrirlash" onClick={() => {
                setEdit(e._id)
                // <input type="date"> aniq "YYYY-MM-DD" formatini talab qiladi —
                // backend to'liq ISO datetime qaytaradi, shuning uchun kesib olamiz
                setForm({ title: e.title, desc: e.desc || '', eventDate: (e.eventDate || '').slice(0, 10), type: e.type || 'general', image: e.image || '' })
                setImageFile(null)
                setImagePreview(e.image || null)
                setOpen(true)
              }}>{Ic.edit}</button>
              <button style={bD} aria-label="O'chirish" onClick={() => del(e._id)}>{Ic.del}</button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Hali tadbir yo'q</p>}
      </div>
    </div>
  )
}