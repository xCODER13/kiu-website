import { useState, useEffect } from 'react'
import { API, H, HF, errorMessage, asArray } from './shared/api'
import { card, inp, lbl, bP, bD, bE, bG } from './shared/styles'
import { Ic } from './shared/Icons.jsx'
import { extractYouTubeShortsId, parseImages } from './shared/helpers'
import { useMultiImageUpload } from './shared/useImageUpload'

export default function NewsAdmin() {
  const [news, setNews]    = useState([])
  const [form, setForm]    = useState({ title: '', content: '', category: 'Umumiy', image: '', shortsUrl: '' })
  const [editing, setEdit] = useState(null)
  const [open, setOpen]    = useState(false)
  const [uploading, setUploading] = useState(false)

  const { imageFiles, imagePreviews, fileRef, handleFileSelect, removeImage, reset, clear } = useMultiImageUpload()

  useEffect(() => { fetch(`${API}/news`).then(r => r.json()).then(d => setNews(asArray(d))).catch(() => {}) }, [])

  async function save() {
    if (!form.title.trim()) return alert('Sarlavha kiritilishi shart!')
    const videoId = form.shortsUrl.trim() ? extractYouTubeShortsId(form.shortsUrl.trim()) : ''
    if (form.shortsUrl.trim() && !videoId) return alert('Iltimos, toʻgʻri YouTube Shorts URL kiriting!')

    // Rasm yuklash endi backend orqali (Supabase service_role kaliti bilan,
    // MIME/hajm tekshiruvi bilan) amalga oshadi — brauzer to'g'ridan-to'g'ri
    // Supabase'ga yozmaydi. Mavjud (o'zgartirilmagan) URL'lar `existingImages`
    // sifatida, yangi tanlangan fayllar esa haqiqiy fayl sifatida yuboriladi.
    const existingUrls = imagePreviews.filter(p => !p.isNew).map(p => p.url)

    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('content', form.content)
    fd.append('category', form.category)
    fd.append('shortsUrl', form.shortsUrl.trim())
    fd.append('videoId', videoId)
    fd.append('existingImages', JSON.stringify(existingUrls))
    imageFiles.forEach(f => fd.append('imageFiles', f))

    setUploading(true)
    try {
      const url = editing ? `${API}/news/${editing}` : `${API}/news`
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: HF(), body: fd })
      if (!res.ok) return alert(await errorMessage(res, "Yangilik saqlanmadi."))
      const data = await res.json()
      if (editing) setNews(p => p.map(n => n._id === editing ? data : n))
      else setNews(p => [data, ...p])

      setForm({ title: '', content: '', category: 'Umumiy', image: '', shortsUrl: '' })
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
      const res = await fetch(`${API}/news/${id}`, { method: 'DELETE', headers: H() })
      if (!res.ok) return alert(await errorMessage(res, "O'chirib bo'lmadi."))
      setNews(p => p.filter(n => n._id !== id))
    } catch {
      alert("Server bilan bog'lanib bo'lmadi.")
    }
  }

  function startEdit(n) {
    setEdit(n._id)
    // Mavjud rasmlarni preview sifatida ko'rsatish
    reset(parseImages(n.image))
    setForm({ title: n.title, content: n.content || '', category: n.category || 'Umumiy', image: n.image || '', shortsUrl: n.shortsUrl || (n.videoId ? `https://youtube.com/shorts/${n.videoId}` : '') })
    setOpen(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>Yangiliklar ({news.length})</h2>
        <button style={bP} onClick={() => { setOpen(!open); setEdit(null); clear(); setForm({ title: '', content: '', category: 'Umumiy', image: '', shortsUrl: '' }) }}>{Ic.add} Yangi</button>
      </div>
      {open && (
        <div style={{ ...card, marginBottom: '1.5rem', borderColor: 'var(--color-brand)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand)', marginBottom: '1rem' }}>{editing ? 'Tahrirlash' : 'Yangi yangilik'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={lbl}>Sarlavha *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Yangilik sarlavhasi" style={inp} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lbl}>Kategoriya</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                  {["Umumiy","Ta'lim","Sport","Madaniyat","Xalqaro","Fan"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Rasmlar ({imagePreviews.length} ta)</label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: '1px dashed var(--color-brand)', color: 'var(--color-brand)', background: 'color-mix(in srgb, var(--color-brand) 5%, transparent)' }}>
                  {Ic.photo}
                  Rasm qo'shish
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                </label>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>JPEG, PNG, WebP · maks 5 MB · bir vaqtda bir nechta tanlash mumkin</div>
              </div>
            </div>
            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {imagePreviews.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={p.url} alt={`rasm-${i+1}`} loading="lazy" style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, border: '2px solid ' + (p.isNew ? '#7c3aed' : '#e5e7eb'), display: 'block' }} onError={e => e.target.style.opacity='0.3'} />
                    {p.isNew && <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, fontWeight: 700, background: 'var(--color-brand)', color: 'var(--color-on-brand)', padding: '1px 5px', borderRadius: 10 }}>YANGI</span>}
                    <button onClick={() => removeImage(i)} aria-label="Rasmni olib tashlash" style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-danger)', color: 'var(--color-on-brand)', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '18px', textAlign: 'center', padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div><label style={lbl}>YouTube Shorts URL</label><input value={form.shortsUrl} onChange={e => setForm({ ...form, shortsUrl: e.target.value })} placeholder="https://youtube.com/shorts/VIDEO_ID" style={inp} /></div>
            <div><label style={lbl}>Matn</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} style={{ ...inp, resize: 'vertical' }} /></div>
            {uploading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-brand)' }}>
                <div style={{ width: 14, height: 14, border: '2px solid #ede9fe', borderTopColor: 'var(--color-brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
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

      {/* Yangiliklar */}
      {news.filter(n => !n.videoId).length > 0 && (
        <>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
            Yangiliklar ({news.filter(n => !n.videoId).length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
            {news.filter(n => !n.videoId).map(n => (
              <div key={n._id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: 'var(--color-brand)', background: 'color-mix(in srgb, var(--color-brand) 10%, transparent)', padding: '2px 8px', borderRadius: 20 }}>{n.category || 'Umumiy'}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(n.createdAt).toLocaleDateString('uz-UZ')}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{n.title}</div>
                  {n.content && <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 450 }}>{n.content}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button style={bE} onClick={() => startEdit(n)}>{Ic.edit} Tahrir</button>
                  <button style={bD} aria-label="O'chirish" onClick={() => del(n._id)}>{Ic.del}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Shorts */}
      {news.filter(n => n.videoId).length > 0 && (
        <>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
            YouTube Shorts ({news.filter(n => n.videoId).length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {news.filter(n => n.videoId).map(n => (
              <div key={n._id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: '#ff0000', background: 'rgba(255,0,0,.1)', padding: '2px 8px', borderRadius: 20 }}>Shorts</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(n.createdAt).toLocaleDateString('uz-UZ')}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{n.title}</div>
                  {n.content && <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 450 }}>{n.content}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button style={bE} onClick={() => startEdit(n)}>{Ic.edit} Tahrir</button>
                  <button style={bD} aria-label="O'chirish" onClick={() => del(n._id)}>{Ic.del}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {news.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Hali yangilik yo'q</p>}
    </div>
  )
}