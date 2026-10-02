import { useState, useEffect } from 'react'
import { API, H, errorMessage } from './shared/api'
import { STATUS_BADGE, STATUS_LABELS } from './shared/constants'
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
      <div className="adm-page-head">
        <h2 className="adm-page-title">
          {type === 'vacancy' ? 'Vakansiya arizalari' : 'Qabul arizalari'} ({apps.length})
        </h2>
        <div className="adm-filters">
          {[['all','Barchasi'],['new','Yangi'],['reviewed',"Ko'rildi"],['accepted','Qabul'],['rejected','Rad']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilt(val)} className="adm-chip" data-active={filter === val}>
              {lbl} ({val === 'all' ? apps.length : apps.filter(a => a.status === val).length})
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="adm-state">Yuklanmoqda...</div>}

      {!loading && filtered.length === 0 && (
        <div className="adm-state adm-state--dashed">
          Ariza yo'q
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="adm-list">
          {filtered.map(a => (
            <div key={a._id} className="adm-card">
              <div className="adm-app-row">
                <div className="adm-app-main">
                  <div className="adm-app-head">
                    <span className="adm-app-name">{a.name}</span>
                    <span className={`badge ${STATUS_BADGE[a.status] ?? ""}`}>{STATUS_LABELS[a.status]}</span>
                  </div>
                  <div className="adm-app-meta">
                    <span className="adm-app-meta-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5"/></svg>
                      {a.phone}
                    </span>
                    {a.email && <span>{a.email}</span>}
                  </div>
                  {type === 'admission' && a.faculty && (
                    <div className="adm-app-line">
                      Yo'nalish: <strong>{a.faculty}</strong>
                    </div>
                  )}
                  {type === 'vacancy' && (
                    <div className="adm-tags">
                      {a.position && <span className="adm-tag adm-tag--brand">{a.position}</span>}
                      {a.faculty && <span className="adm-tag adm-tag--strong">{a.faculty}</span>}
                      {a.education && <span className="adm-tag adm-tag--success">{a.education}</span>}
                      {a.experience && <span className="adm-tag adm-tag--warning">{a.experience}</span>}
                    </div>
                  )}
                  {a.message && (
                    <div className="adm-app-msg">
                      "{a.message?.slice(0, 120)}{a.message?.length > 120 ? '...' : ''}"
                    </div>
                  )}
                  <div className="adm-app-date">{new Date(a.createdAt).toLocaleString('uz-UZ')}</div>
                </div>
                <div className="adm-app-actions">
                  <select className="adm-status-select" data-status={a.status} value={a.status} aria-label={`${a.name}: ariza holati`} onChange={e => updateStatus(a._id, e.target.value)}>
                    <option value="new">Yangi</option>
                    <option value="reviewed">Ko'rildi</option>
                    <option value="accepted">Qabul</option>
                    <option value="rejected">Rad</option>
                  </select>
                  <button className="adm-btn adm-btn--danger" onClick={() => del(a._id)}>{Ic.del} O'chir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
