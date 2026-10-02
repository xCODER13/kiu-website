import { useState, useEffect } from 'react'
import { API, H, errorMessage } from './shared/api'
import { card, bD } from './shared/styles'
import { STATUS_COLORS, STATUS_LABELS } from './shared/constants'
import { Ic } from './shared/Icons.jsx'

export default function ApplicationsAdmin({ type = 'admission' }) {
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
    try {
      const res = await fetch(`${API}/applications/${id}`, { method: 'PUT', headers: H(), body: JSON.stringify({ status }) })
      if (!res.ok) return alert(await errorMessage(res, "Statusni o'zgartirib bo'lmadi."))
      const data = await res.json()
      setApps(p => p.map(a => a._id === id ? data : a))
    } catch {
      alert("Server bilan bog'lanib bo'lmadi.")
    }
  }

  async function del(id) {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
    try {
      const res = await fetch(`${API}/applications/${id}`, { method: 'DELETE', headers: H() })
      if (!res.ok) return alert(await errorMessage(res, "O'chirib bo'lmadi."))
      setApps(p => p.filter(a => a._id !== id))
    } catch {
      alert("Server bilan bog'lanib bo'lmadi.")
    }
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
              style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${filter === val ? 'var(--color-brand)' : 'var(--border)'}`, background: filter === val ? 'var(--color-brand)' : 'var(--bg)', color: filter === val ? '#fff' : 'var(--muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
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
                      {a.position && <span style={{ fontSize: 11, background: 'color-mix(in srgb, var(--color-brand) 8%, transparent)', color: 'var(--color-brand)', padding: '2px 8px', borderRadius: 20 }}>{a.position}</span>}
                      {a.faculty && <span style={{ fontSize: 11, background: 'rgba(79,70,229,.08)', color: 'var(--color-brand-hover)', padding: '2px 8px', borderRadius: 20 }}>{a.faculty}</span>}
                      {a.education && <span style={{ fontSize: 11, background: 'rgba(5,150,105,.08)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: 20 }}>{a.education}</span>}
                      {a.experience && <span style={{ fontSize: 11, background: 'rgba(217,119,6,.08)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: 20 }}>{a.experience}</span>}
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
