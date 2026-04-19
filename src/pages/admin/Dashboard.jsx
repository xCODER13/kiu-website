import { useState, useEffect } from 'react'
import { useNavigate, NavLink, Routes, Route } from 'react-router-dom'


const API = import.meta.env.VITE_API_URL + '/api'
const H = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('kiu_token')}` })

// ── ICONS ──
const Ic = {
  stats:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  news:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  events:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  teach:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  gallery: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  apps:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  vacancy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  profile: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  edit:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  del:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
  add:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  save:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  home:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  logout:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  key:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  search:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  sun:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  menu:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
}

// ── STYLES ──
const card  = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }
const inp   = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }
const lbl   = { fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }
const bP    = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const bD    = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'none', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }
const bE    = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'none', color: '#7c3aed', border: '1px solid #7c3aed', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }
const bG    = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'none', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }

const STATUS_COLORS = { new: '#7c3aed', reviewed: '#d97706', accepted: '#059669', rejected: '#dc2626' }
const STATUS_LABELS = { new: 'Yangi', reviewed: "Ko'rildi", accepted: 'Qabul qilindi', rejected: 'Rad etildi' }

const NAV = [
  { to: '/admin',              label: 'Statistika',       icon: Ic.stats   },
  { to: '/admin/news',         label: 'Yangiliklar',      icon: Ic.news    },
  { to: '/admin/events',       label: 'Tadbirlar',        icon: Ic.events  },
  { to: '/admin/teachers',     label: "O'qituvchilar",    icon: Ic.teach   },
  { to: '/admin/gallery',      label: 'Galereya',         icon: Ic.gallery },
  { to: '/admin/applications', label: 'Qabul arizalari',  icon: Ic.apps    },
  { to: '/admin/vacancies',    label: 'Vakansiyalar',     icon: Ic.vacancy },
  { to: '/admin/profile',      label: 'Profil',           icon: Ic.profile },
]

// ── STATS ──
function Stats() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    fetch(`${API}/stats`, { headers: H() }).then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  if (!stats) return <p style={{ color: 'var(--muted)', fontSize: 13 }}>Yuklanmoqda...</p>

  const cards = [
    { label: 'Yangiliklar',        value: stats.newsCount,     color: '#7c3aed', icon: Ic.news,    to: '/admin/news'         },
    { label: 'Tadbirlar',          value: stats.eventsCount,   color: '#e546e5', icon: Ic.events,  to: '/admin/events'       },
    { label: "O'qituvchilar",      value: stats.teachersCount, color: '#0088cc', icon: Ic.teach,   to: '/admin/teachers'     },
    { label: 'Yangi arizalar',       value: stats.newApps,     color: '#ff0015', icon: Ic.apps,    to: '/admin/applications' },
    { label: 'Qabul arizalari',    value: stats.appsCount,     color: '#059669', icon: Ic.apps,    to: '/admin/applications' },
    { label: 'Vakansiya arizalari',value: stats.vacancyApps,   color: '#d97706', icon: Ic.vacancy, to: '/admin/vacancies'    },
  ]

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>Statistika</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12, marginBottom: '2rem' }}>
        {cards.map(c => (
          <NavLink key={c.label} to={c.to} style={{ textDecoration: 'none' }}>
            <div style={{ ...card, borderLeft: `3px solid ${c.color}`, cursor: 'pointer', transition: 'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c.color }}>{c.value ?? 0}</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.label}</div>
            </div>
          </NavLink>
        ))}
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem' }}>Tezkor havolalar</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
        {NAV.slice(1).map(l => (
          <NavLink key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ color: '#7c3aed' }}>{l.icon}</div>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{l.label}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

// ── HELPERS ──
function extractYouTubeShortsId(url) {
  if (!url) return ''
  try {
    const normalized = url.trim()
    const parsed = new URL(normalized)
    const hostname = parsed.hostname.replace('www.', '')
    if (hostname === 'youtu.be') return parsed.pathname.slice(1).split(/[^A-Za-z0-9_-]/)[0]
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/')[2]?.slice(0, 11) || ''
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v') || ''
      if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/v/')) return parsed.pathname.split('/')[2]?.slice(0, 11) || ''
    }
  } catch {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/))([\w-]{11})/)
    return match ? match[1] : ''
  }
  return ''
}

// ── NEWS ──
function NewsAdmin() {
  const [news, setNews]     = useState([])
  const [form, setForm]     = useState({ title: '', content: '', category: 'umumiy', image: '', shortsUrl: '' })
  const [editing, setEdit]  = useState(null)
  const [open, setOpen]     = useState(false)

  useEffect(() => { fetch(`${API}/news`).then(r => r.json()).then(setNews).catch(() => {}) }, [])

  async function save() {
    if (!form.title.trim()) return alert('Sarlavha kiritilishi shart!')
    const videoId = form.shortsUrl.trim() ? extractYouTubeShortsId(form.shortsUrl.trim()) : ''
    if (form.shortsUrl.trim() && !videoId) return alert('Iltimos, toʻgʻri YouTube Shorts URL kiriting!')

    const body = {
      title: form.title,
      content: form.content,
      category: form.category,
      image: form.image,
      shortsUrl: form.shortsUrl.trim(),
      videoId,
    }

    const url = editing ? `${API}/news/${editing}` : `${API}/news`
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: H(), body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) return alert(data.error || 'Yangilik saqlanmadi. Iltimos, qayta urinib ko‘ring.')
    if (editing) setNews(p => p.map(n => n._id === editing ? data : n))
    else setNews(p => [data, ...p])
    setForm({ title: '', content: '', category: 'umumiy', image: '', shortsUrl: '' })
    setEdit(null); setOpen(false)
  }

  async function del(id) {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`${API}/news/${id}`, { method: 'DELETE', headers: H() })
    setNews(p => p.filter(n => n._id !== id))
  }

  function startEdit(n) {
    setEdit(n._id)
    setForm({
      title: n.title,
      content: n.content || '',
      category: n.category || 'umumiy',
      image: n.image || '',
      shortsUrl: n.shortsUrl || (n.videoId ? `https://youtube.com/shorts/${n.videoId}` : ''),
    })
    setOpen(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>Yangiliklar ({news.length})</h2>
        <button style={bP} onClick={() => { setOpen(!open); setEdit(null); setForm({ title: '', content: '', category: 'umumiy', image: '', shortsUrl: '' }) }}>{Ic.add} Yangi</button>
      </div>
      {open && (
        <div style={{ ...card, marginBottom: '1.5rem', borderColor: '#7c3aed' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: '1rem' }}>{editing ? 'Tahrirlash' : 'Yangi yangilik'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={lbl}>Sarlavha *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Yangilik sarlavhasi" style={inp} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lbl}>Kategoriya</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                  {["umumiy","ta'lim","sport","madaniyat","xalqaro","fan"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Rasm URL</label><input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." style={inp} /></div>
            </div>
            <div><label style={lbl}>YouTube Shorts URL</label><input value={form.shortsUrl} onChange={e => setForm({ ...form, shortsUrl: e.target.value })} placeholder="https://youtube.com/shorts/VIDEO_ID" style={inp} /></div>
            <div><label style={lbl}>Matn</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} style={{ ...inp, resize: 'vertical' }} /></div>
            {form.image && <img src={form.image} alt="preview" style={{ height: 100, objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display='none'} />}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={bP} onClick={save}>{Ic.save} {editing ? 'Saqlash' : "Qo'shish"}</button>
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
              <span style={{ fontSize: 10, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 8px', borderRadius: 20 }}>{n.category || 'umumiy'}</span>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(n.createdAt).toLocaleDateString('uz-UZ')}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{n.title}</div>
            {n.content && <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 450 }}>{n.content}</div>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button style={bE} onClick={() => startEdit(n)}>{Ic.edit} Tahrir</button>
            <button style={bD} onClick={() => del(n._id)}>{Ic.del}</button>
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
            <button style={bD} onClick={() => del(n._id)}>{Ic.del}</button>
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

// ── EVENTS ──
function EventsAdmin() {
  const [events, setEvents] = useState([])
  const [form, setForm]     = useState({ title: '', desc: '', date: '', month: '', type: 'general' })
  const [editing, setEdit]  = useState(null)
  const [open, setOpen]     = useState(false)

  const types = [['general','Umumiy'],['open','Ochiq kun'],['culture','Madaniy'],['science','Ilmiy'],['sport','Sport'],['graduation','Bitiruvchilar'],['admission','Qabul']]

  useEffect(() => { fetch(`${API}/events`).then(r => r.json()).then(setEvents).catch(() => {}) }, [])

  async function save() {
    if (!form.title.trim() || !form.date.trim()) return alert('Sarlavha va sana kiritilishi shart!')
    const url = editing ? `${API}/events/${editing}` : `${API}/events`
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: H(), body: JSON.stringify(form) })
    const data = await res.json()
    if (editing) setEvents(p => p.map(e => e._id === editing ? data : e))
    else setEvents(p => [data, ...p])
    setForm({ title: '', desc: '', date: '', month: '', type: 'general' })
    setEdit(null); setOpen(false)
  }

  async function del(id) {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`${API}/events/${id}`, { method: 'DELETE', headers: H() })
    setEvents(p => p.filter(e => e._id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>Tadbirlar ({events.length})</h2>
        <button style={bP} onClick={() => { setOpen(!open); setEdit(null); setForm({ title: '', desc: '', date: '', month: '', type: 'general' }) }}>{Ic.add} Yangi</button>
      </div>

      {open && (
        <div style={{ ...card, marginBottom: '1.5rem', borderColor: '#4f46e5' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5', marginBottom: '1rem' }}>{editing ? 'Tahrirlash' : 'Yangi tadbir'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={lbl}>Sarlavha *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tadbir nomi" style={inp} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div><label style={lbl}>Sana *</label><input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="28 mart" style={inp} /></div>
              <div><label style={lbl}>Oy</label><input value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} placeholder="mart" style={inp} /></div>
              <div>
                <label style={lbl}>Turi</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inp}>
                  {types.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div><label style={lbl}>Tavsif</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={bP} onClick={save}>{Ic.save} {editing ? 'Saqlash' : "Qo'shish"}</button>
              <button style={bG} onClick={() => { setOpen(false); setEdit(null) }}>Bekor</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map(e => (
          <div key={e._id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, flex: 1 }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{e.date?.split(' ')[0]}</div>
                <div style={{ fontSize: 9, opacity: .75 }}>{e.month}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button style={bE} onClick={() => { setEdit(e._id); setForm({ title: e.title, desc: e.desc || '', date: e.date, month: e.month || '', type: e.type || 'general' }); setOpen(true) }}>{Ic.edit}</button>
              <button style={bD} onClick={() => del(e._id)}>{Ic.del}</button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Hali tadbir yo'q</p>}
      </div>
    </div>
  )
}

// ── TEACHERS ──
function TeachersAdmin() {
  const [teachers, setTeachers] = useState([])
  const [form, setForm]         = useState({ name: '', role: '', dept: '', email: '', avatar: '' })
  const [editing, setEdit]      = useState(null)
  const [open, setOpen]         = useState(false)
  const colors = ['#7c3aed','#4f46e5','#0088cc','#059669','#d97706','#db2777']

  useEffect(() => { fetch(`${API}/teachers`).then(r => r.json()).then(setTeachers).catch(() => {}) }, [])

  async function save() {
    if (!form.name.trim() || !form.role.trim()) return alert('Ism va lavozim kiritilishi shart!')
    const url = editing ? `${API}/teachers/${editing}` : `${API}/teachers`
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: H(), body: JSON.stringify(form) })
    const data = await res.json()
    if (editing) setTeachers(p => p.map(t => t._id === editing ? data : t))
    else setTeachers(p => [data, ...p])
    setForm({ name: '', role: '', dept: '', email: '', avatar: '' })
    setEdit(null); setOpen(false)
  }

  async function del(id) {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`${API}/teachers/${id}`, { method: 'DELETE', headers: H() })
    setTeachers(p => p.filter(t => t._id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>O'qituvchilar ({teachers.length})</h2>
        <button style={bP} onClick={() => { setOpen(!open); setEdit(null); setForm({ name: '', role: '', dept: '', email: '', avatar: '' }) }}>{Ic.add} Yangi</button>
      </div>

      {open && (
        <div style={{ ...card, marginBottom: '1.5rem', borderColor: '#0088cc' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#0088cc', marginBottom: '1rem' }}>{editing ? 'Tahrirlash' : "Yangi o'qituvchi"}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={lbl}>To'liq ism *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Familiya Ism Sharif" style={inp} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={lbl}>Lavozim *</label><input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="O'qituvchi / Dotsent" style={inp} /></div>
              <div><label style={lbl}>Avatar (2 harf)</label><input value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="AB" maxLength={2} style={inp} /></div>
            </div>
            <div><label style={lbl}>Kafedra *</label><input value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} placeholder="Aniq fanlar kafedrasi" style={inp} /></div>
            <div><label style={lbl}>Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="teacher@kiu.uz" style={inp} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={bP} onClick={save}>{Ic.save} {editing ? 'Saqlash' : "Qo'shish"}</button>
              <button style={bG} onClick={() => { setOpen(false); setEdit(null) }}>Bekor</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
        {teachers.map((t, i) => (
          <div key={t._id} style={card}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {t.avatar || t.name?.slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#7c3aed' }}>{t.role}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{t.dept}</div>
            {t.email && <div style={{ fontSize: 11, color: '#7c3aed', marginBottom: '0.75rem' }}>{t.email}</div>}
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={bE} onClick={() => { setEdit(t._id); setForm({ name: t.name, role: t.role, dept: t.dept, email: t.email || '', avatar: t.avatar || '' }); setOpen(true) }}>{Ic.edit} Tahrir</button>
              <button style={bD} onClick={() => del(t._id)}>{Ic.del}</button>
            </div>
          </div>
        ))}
        {teachers.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '2rem', gridColumn: '1/-1' }}>Hali o'qituvchi qo'shilmagan</p>}
      </div>
    </div>
  )
}

// ── GALLERY ──
function GalleryAdmin() {
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

// ── APPLICATIONS ──
function ApplicationsAdmin({ type = 'admission' }) {
  const [apps, setApps]   = useState([])
  const [filter, setFilt] = useState('all')
  const [loading, setLoad] = useState(true)

  useEffect(() => {
    fetch(`${API}/applications`, { headers: H() })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) { setApps([]); setLoad(false); return }
        const f = data.filter(a => type === 'vacancy' ? a.type === 'vacancy' : (!a.type || a.type === 'admission'))
        setApps(f); setLoad(false)
      })
      .catch(() => { setApps([]); setLoad(false) })
  }, [type])

  async function updateStatus(id, status) {
    const res = await fetch(`${API}/applications/${id}`, { method: 'PUT', headers: H(), body: JSON.stringify({ status }) })
    const data = await res.json()
    setApps(p => p.map(a => a._id === id ? data : a))
  }

  async function del(id) {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`${API}/applications/${id}`, { method: 'DELETE', headers: H() })
    setApps(p => p.filter(a => a._id !== id))
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
          {type === 'vacancy' ? 'Vakansiya arizalari' : 'Qabul arizalari'} ({apps.length})
        </h2>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[['all','Barchasi'],['new','Yangi'],['reviewed',"Ko'rildi"],['accepted','Qabul'],['rejected','Rad']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilt(val)}
              style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${filter === val ? '#7c3aed' : 'var(--border)'}`, background: filter === val ? '#7c3aed' : 'var(--bg)', color: filter === val ? '#fff' : 'var(--muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
              {lbl} ({val === 'all' ? apps.length : apps.filter(a => a.status === val).length})
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: 13 }}>Yuklanmoqda...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 12 }}>
          Ariza yo'q
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(a => (
            <div key={a._id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{a.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLORS[a.status], background: `${STATUS_COLORS[a.status]}18`, padding: '2px 9px', borderRadius: 20 }}>{STATUS_LABELS[a.status]}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5"/></svg>
                      {a.phone}
                    </span>
                    {a.email && <span>{a.email}</span>}
                  </div>
                  {type === 'admission' && a.faculty && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                      Yo'nalish: <strong style={{ color: 'var(--text)' }}>{a.faculty}</strong>
                    </div>
                  )}
                  {type === 'vacancy' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                      {a.position && <span style={{ fontSize: 11, background: 'rgba(124,58,237,.08)', color: '#7c3aed', padding: '2px 8px', borderRadius: 20 }}>{a.position}</span>}
                      {a.faculty && <span style={{ fontSize: 11, background: 'rgba(79,70,229,.08)', color: '#4f46e5', padding: '2px 8px', borderRadius: 20 }}>{a.faculty}</span>}
                      {a.education && <span style={{ fontSize: 11, background: 'rgba(5,150,105,.08)', color: '#059669', padding: '2px 8px', borderRadius: 20 }}>{a.education}</span>}
                      {a.experience && <span style={{ fontSize: 11, background: 'rgba(217,119,6,.08)', color: '#d97706', padding: '2px 8px', borderRadius: 20 }}>{a.experience}</span>}
                    </div>
                  )}
                  {a.message && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', padding: '6px 10px', background: 'var(--bg-2)', borderRadius: 6, borderLeft: '2px solid var(--border)', marginTop: 4 }}>
                      "{a.message?.slice(0, 120)}{a.message?.length > 120 ? '...' : ''}"
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>{new Date(a.createdAt).toLocaleString('uz-UZ')}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
                  <select value={a.status} onChange={e => updateStatus(a._id, e.target.value)}
                    style={{ fontSize: 11, padding: '6px 8px', borderRadius: 7, border: `1px solid ${STATUS_COLORS[a.status]}`, background: 'var(--bg)', color: STATUS_COLORS[a.status], cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    <option value="new">Yangi</option>
                    <option value="reviewed">Ko'rildi</option>
                    <option value="accepted">Qabul</option>
                    <option value="rejected">Rad</option>
                  </select>
                  <button style={bD} onClick={() => del(a._id)}>{Ic.del} O'chir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── PROFILE ──
function ProfileAdmin() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [msg, setMsg]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) return setMsg({ type: 'error', text: 'Yangi parollar mos kelmadi!' })
    if (form.newPassword.length < 6) return setMsg({ type: 'error', text: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!' })
    try {
      const res = await fetch(`${API}/admin/change-password`, { method: 'POST', headers: H(), body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) })
      const data = await res.json()
      if (res.ok) { setMsg({ type: 'success', text: 'Parol muvaffaqiyatli o\'zgartirildi!' }); setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
      else setMsg({ type: 'error', text: data.error || 'Xato yuz berdi' })
    } catch { setMsg({ type: 'error', text: 'Server bilan bog\'lanib bo\'lmadi' }) }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>Profil sozlamalari</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>{Ic.profile} Admin ma'lumotlari</h3>
          {[['Login','admin'],['Rol','Super Admin'],['Tizim','KIU Admin Panel'],['URL','localhost:5173/admin']].map(([l,v]) => (
            <div key={l} style={{ padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{l}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>{Ic.key} Parolni o'zgartirish</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={lbl}>Joriy parol *</label><input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required placeholder="••••••••" style={inp} /></div>
            <div><label style={lbl}>Yangi parol *</label><input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required placeholder="Kamida 6 ta belgi" style={inp} /></div>
            <div><label style={lbl}>Tasdiqlang *</label><input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required placeholder="••••••••" style={inp} /></div>
            {msg && (
              <div style={{ padding: '10px 12px', borderRadius: 8, background: msg.type === 'success' ? 'rgba(5,150,105,.1)' : 'rgba(220,38,38,.1)', border: `1px solid ${msg.type === 'success' ? '#059669' : '#dc2626'}`, fontSize: 12, color: msg.type === 'success' ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                {msg.type === 'success' ? Ic.check : Ic.del} {msg.text}
              </div>
            )}
            <button type="submit" style={bP}>{Ic.save} Parolni saqlash</button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── MAIN ──
export default function Dashboard() {
  const navigate    = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(document.documentElement.getAttribute('data-theme') === 'dark')
  const [search, setSearch] = useState('')
  const tk = localStorage.getItem('kiu_token')

  useEffect(() => { if (!tk) navigate('/admin/login') }, [tk, navigate])
  useEffect(() => { document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light') }, [dark])

  const filteredNav = NAV.filter(n => search === '' || n.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-2)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width: collapsed ? 60 : 230, background: 'linear-gradient(180deg,#1a1a2e 0%,#16213e 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width .25s', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '1rem 0' : '1.1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 8 }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '.01em' }}>KIU Admin</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>Boshqaruv paneli</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {collapsed ? Ic.menu : Ic.close}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div style={{ padding: '0.7rem 1rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)', display: 'flex' }}>{Ic.search}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bo'lim qidirish..."
                style={{ width: '100%', padding: '7px 10px 7px 28px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, fontSize: 12, color: '#fff', outline: 'none', fontFamily: 'inherit' }} />
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.4rem 0', overflowY: 'auto' }}>
          {filteredNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '11px 0' : '9px 1.25rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
                background: isActive ? 'rgba(124,58,237,.3)' : 'none',
                textDecoration: 'none', transition: 'all .15s',
                borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
              })}>
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </NavLink>
          ))}
          {filteredNav.length === 0 && !collapsed && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', padding: '1rem 1.25rem', textAlign: 'center' }}>Topilmadi</p>
          )}
        </nav>

        {/* Bottom */}
        <div style={{ padding: collapsed ? '0.5rem 0' : '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => setDark(!dark)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,.45)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', justifyContent: collapsed ? 'center' : 'flex-start', fontFamily: 'inherit', width: '100%' }}>
            {dark ? Ic.sun : Ic.moon}
            {!collapsed && (dark ? 'Yorug\' rejim' : 'Qorong\'u rejim')}
          </button>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,.4)', textDecoration: 'none', padding: '6px 0', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            {Ic.home}{!collapsed && 'Saytga qaytish'}
          </NavLink>
          <button onClick={() => { localStorage.removeItem('kiu_token'); navigate('/admin/login') }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', justifyContent: collapsed ? 'center' : 'flex-start', fontFamily: 'inherit', width: '100%' }}>
            {Ic.logout}{!collapsed && 'Chiqish'}
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ padding: '0.85rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            KIU Boshqaruv tizimi · <span style={{ color: '#7c3aed', fontWeight: 600 }}>admin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>{Ic.search}</span>
              <input
  value={search}
  onChange={e => setSearch(e.target.value)}
  placeholder="Bo'lim qidirish..."
  style={{ padding: '7px 12px 7px 30px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, background: 'var(--bg)', color: 'var(--text)', outline: 'none', width: 180, fontFamily: 'inherit' }}
/>
            </div>
            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
              {dark ? Ic.sun : Ic.moon}
            </button>
          </div>
        </div>

        {/* Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Routes>
            <Route index element={<Stats />} />
            <Route path="news"         element={<NewsAdmin />} />
            <Route path="events"       element={<EventsAdmin />} />
            <Route path="teachers"     element={<TeachersAdmin />} />
            <Route path="gallery"      element={<GalleryAdmin />} />
            <Route path="applications" element={<ApplicationsAdmin type="admission" />} />
            <Route path="vacancies"    element={<ApplicationsAdmin type="vacancy" />} />
            <Route path="profile"      element={<ProfileAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}