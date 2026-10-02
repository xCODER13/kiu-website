import { useState, useEffect } from 'react'
import { API, H, HF, errorMessage, asArray } from './shared/api'
import { Ic } from './shared/Icons.jsx'
import { extractYouTubeShortsId, parseImages, markBroken } from './shared/helpers'
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

  const regular = news.filter(n => !n.videoId)
  const shorts  = news.filter(n => n.videoId)

  // Yangilik va Shorts qatorlari bir xil tuzilishda — faqat belgi (pill) farq qiladi
  const renderRow = (n, pill) => (
    <div key={n._id} className="adm-card adm-row">
      <div className="adm-row-main">
        <div className="adm-row-meta">
          {pill}
          <span className="adm-row-date">{new Date(n.createdAt).toLocaleDateString('uz-UZ')}</span>
        </div>
        <div className="adm-row-title">{n.title}</div>
        {n.content && <div className="adm-row-text adm-row-text--news">{n.content}</div>}
      </div>
      <div className="adm-actions adm-actions--fixed">
        <button className="adm-btn adm-btn--edit" onClick={() => startEdit(n)}>{Ic.edit} Tahrir</button>
        <button className="adm-btn adm-btn--danger" aria-label="O'chirish" onClick={() => del(n._id)}>{Ic.del}</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="adm-crud-head">
        <h2 className="adm-page-title">Yangiliklar ({news.length})</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => { setOpen(!open); setEdit(null); clear(); setForm({ title: '', content: '', category: 'Umumiy', image: '', shortsUrl: '' }) }}>{Ic.add} Yangi</button>
      </div>
      {open && (
        <div className="adm-card adm-form">
          <h3 className="adm-form-title">{editing ? 'Tahrirlash' : 'Yangi yangilik'}</h3>
          <div className="adm-form-body">
            <div><label className="adm-label">Sarlavha *</label><input className="adm-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Yangilik sarlavhasi" /></div>
            <div className="adm-form-grid">
              <div>
                <label className="adm-label">Kategoriya</label>
                <select className="adm-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {["Umumiy","Ta'lim","Sport","Madaniyat","Xalqaro","Fan"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="adm-label">Rasmlar ({imagePreviews.length} ta)</label>
                <label className="adm-upload">
                  {Ic.photo}
                  Rasm qo'shish
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleFileSelect} hidden />
                </label>
                <div className="adm-hint">JPEG, PNG, WebP · maks 5 MB · bir vaqtda bir nechta tanlash mumkin</div>
              </div>
            </div>
            {imagePreviews.length > 0 && (
              <div className="adm-thumbs adm-thumbs--spaced">
                {imagePreviews.map((p, i) => (
                  <div key={i} className="adm-thumb">
                    <img className="adm-thumb-img" data-new={p.isNew ? 'true' : 'false'} src={p.url} alt={`rasm-${i+1}`} loading="lazy" onError={markBroken} />
                    {p.isNew && <span className="adm-thumb-new">YANGI</span>}
                    <button className="adm-thumb-x" onClick={() => removeImage(i)} aria-label="Rasmni olib tashlash">×</button>
                  </div>
                ))}
              </div>
            )}
            <div><label className="adm-label">YouTube Shorts URL</label><input className="adm-input" value={form.shortsUrl} onChange={e => setForm({ ...form, shortsUrl: e.target.value })} placeholder="https://youtube.com/shorts/VIDEO_ID" /></div>
            <div><label className="adm-label">Matn</label><textarea className="adm-input adm-input--area" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} /></div>
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

      {/* Yangiliklar */}
      {regular.length > 0 && (
        <>
          <h3 className="adm-section-title">Yangiliklar ({regular.length})</h3>
          <div className="adm-list adm-list--spaced">
            {regular.map(n => renderRow(n, <span className="adm-pill">{n.category || 'Umumiy'}</span>))}
          </div>
        </>
      )}

      {/* Shorts */}
      {shorts.length > 0 && (
        <>
          <h3 className="adm-section-title">YouTube Shorts ({shorts.length})</h3>
          <div className="adm-list">
            {shorts.map(n => renderRow(n, <span className="adm-pill adm-pill--youtube">Shorts</span>))}
          </div>
        </>
      )}

      {news.length === 0 && <p className="adm-blank">Hali yangilik yo'q</p>}
    </div>
  )
}
