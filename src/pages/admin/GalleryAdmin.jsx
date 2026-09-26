import { useState } from 'react'
import { card, inp, lbl, bP, bD } from './shared/styles'
import { Ic } from './shared/Icons.jsx'

export default function GalleryAdmin() {
  const [images, setImages] = useState(() => { try { return JSON.parse(localStorage.getItem('kiu_gallery') || '[]') } catch { return [] } })
  const [form, setForm]     = useState({ title: '', desc: '', src: '' })

  function save() {
    if (!form.title.trim() || !form.src.trim()) return alert('Nom va rasm yo\'li kiritilishi shart!')
    const updated = [{ id: Date.now(), ...form }, ...images]
    setImages(updated)
    localStorage.setItem('kiu_gallery', JSON.stringify(updated))
    setForm({ title: '', desc: '', src: '' })
  }

  function del(id) {
    const updated = images.filter(i => i.id !== id)
    setImages(updated)
    localStorage.setItem('kiu_gallery', JSON.stringify(updated))
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>Galereya ({images.length})</h2>

      <div style={{ ...card, marginBottom: '1.5rem', borderColor: '#059669' }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#059669', marginBottom: '1rem' }}>Rasm qo'shish</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Nomi *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="1-kampus" style={inp} /></div>
            <div><label style={lbl}>Tavsif</label><input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Kampus binosi" style={inp} /></div>
          </div>
          <div><label style={lbl}>Rasm yo'li yoki URL *</label><input value={form.src} onChange={e => setForm({ ...form, src: e.target.value })} placeholder="/gallery/kampus.jpg yoki https://..." style={inp} /></div>
          {form.src && <img src={form.src} alt="preview" style={{ height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} onError={e => e.target.style.display='none'} />}
          <button style={bP} onClick={save}>{Ic.add} Qo'shish</button>
        </div>
      </div>

      <div style={{ padding: '0.75rem', background: 'rgba(124,58,237,.05)', borderRadius: 8, border: '1px solid rgba(124,58,237,.15)', marginBottom: '1.5rem', fontSize: 12, color: 'var(--muted)' }}>
         Rasmlarni <code style={{ color: '#7c3aed' }}>public/gallery/</code> papkasiga joylab, <code style={{ color: '#7c3aed' }}>/gallery/fayl.jpg</code> yo'lini yozing
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {images.map(img => (
          <div key={img.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 130, background: '#f0eeff', overflow: 'hidden' }}>
              <img src={img.src} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.opacity='.2'} />
            </div>
            <div style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{img.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{img.desc}</div>
              <button style={bD} onClick={() => del(img.id)}>{Ic.del} O'chir</button>
            </div>
          </div>
        ))}
        {images.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '2rem', gridColumn: '1/-1' }}>Hali rasm qo'shilmagan</p>}
      </div>
    </div>
  )
}
