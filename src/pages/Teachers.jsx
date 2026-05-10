import { useState } from 'react'
import useApi from '../hooks/useApi'

const KAFEDRALAR = [
  "Aniq fanlar kafedrasi",
  "Filologiya va tillarni o'qitish kafedrasi",
  "Ijtimoiy fanlar kafedrasi",
  "Ijtimoiy-gumanitar fanlar kafedrasi",
  "Iqtisodiyot va muhandislik kafedrasi",
  "Maktabgacha va boshlang'ich ta'lim kafedrasi",
]

const FALLBACK_TEACHERS = [
  { id: 1,  name: "Panjiyev Ulug'bek Rustamovich",      role: "Rektor",           dept: "Iqtisodiyot va muhandislik kafedrasi",      avatar: "PU" },
  { id: 2,  name: "Norinov Faxriyor Kurbonovich",       role: "Prorektor",        dept: "Iqtisodiyot va muhandislik kafedrasi",      avatar: "NF" },
  { id: 3,  name: "Ibragimov Suxrob",                   role: "Kafedra mudiri",   dept: "Iqtisodiyot va muhandislik kafedrasi",      avatar: "IS" },
  { id: 4,  name: "Ochilov Anvar Maxamad o'g'li",       role: "O'qituvchi",       dept: "Filologiya va tillarni o'qitish kafedrasi", avatar: "OA" },
  { id: 5,  name: "Shukurova Nargiza Ikramovna",        role: "O'qituvchi",       dept: "Ijtimoiy-gumanitar fanlar kafedrasi",       avatar: "SN" },
  { id: 6,  name: "Murodov Shukrilla Abdusaid o'g'li",  role: "Vb. dotsent",      dept: "Aniq fanlar kafedrasi",                     avatar: "MS" },
  { id: 7,  name: "Mardonova Go'zal Mamatqul qizi",     role: "O'qituvchi",       dept: "Aniq fanlar kafedrasi",                     avatar: "MG" },
  { id: 8,  name: "Nomozova Nargiza Turayevna",         role: "O'qituvchi",       dept: "Filologiya va tillarni o'qitish kafedrasi", avatar: "NN" },
  { id: 9,  name: "Jo'rayev Sulton Murodullo o'g'li",   role: "O'qituvchi",       dept: "Ijtimoiy-gumanitar fanlar kafedrasi",       avatar: "JS" },
  { id: 10, name: "Yakubova Gulchehra Ziyatovna",       role: "Katta o'qituvchi", dept: "Ijtimoiy-gumanitar fanlar kafedrasi",       avatar: "YG" },
  { id: 11, name: "Xidoyatova Nigora Shorakibovna",     role: "Katta o'qituvchi", dept: "Aniq fanlar kafedrasi",                     avatar: "XN" },
  { id: 12, name: "Rustamov Mirzoxid Mansur o'g'li",    role: "O'qituvchi",       dept: "Iqtisodiyot va muhandislik kafedrasi",      avatar: "RM" },
  { id: 13, name: "G'afforov Javohir Farhodjon o'g'li", role: "O'qituvchi",       dept: "Iqtisodiyot va muhandislik kafedrasi",      avatar: "GJ" },
  { id: 14, name: "Abdushukurova Sevara Shavkatovna",   role: "O'qituvchi",       dept: "Filologiya va tillarni o'qitish kafedrasi", avatar: "AS" },
  { id: 15, name: "To'rayev Dostonjon Erkin o'g'li",    role: "O'qituvchi",       dept: "Iqtisodiyot va muhandislik kafedrasi",      avatar: "TD" },
  { id: 16, name: "Tursunov Mirolim",                   role: "O'qituvchi",       dept: "Iqtisodiyot va muhandislik kafedrasi",      avatar: "TM" },
  { id: 17, name: "Rashidov Azizjon",                   role: "O'qituvchi",       dept: "Iqtisodiyot va muhandislik kafedrasi",      avatar: "RA" },
  { id: 18, name: "Gulzoda Muhiddinova",                role: "O'qituvchi",       dept: "Iqtisodiyot va muhandislik kafedrasi",      avatar: "GM" },
  { id: 19, name: "Faxriddin Samarov",                  role: "O'qituvchi",       dept: "Ijtimoiy-gumanitar fanlar kafedrasi",       avatar: "FS" },
  { id: 20, name: "Malohat Rahimova",                   role: "O'qituvchi",       dept: "Filologiya va tillarni o'qitish kafedrasi", avatar: "MR" },
]

const colors = ['#7c3aed','#4f46e5','#0088cc','#059669','#d97706','#db2777']

function KafedraSidebar({ teachers, activeKafedra, onSelect }) {
  const [open, setOpen] = useState(true)

  // Dinamik kafedra ro'yxati — teachers dan olinadi
  const kafedralar = [...new Set(teachers.map(t => t.dept).filter(Boolean))].sort()

  return (
    <div className="card" style={{ padding: '1rem', position: 'sticky', top: '5rem' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: open ? '0.75rem' : 0 }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Kafedralar</span>
        <svg style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div>
          <KafedraBtn label="Barcha o'qituvchilar" count={teachers.length} active={!activeKafedra} onClick={() => onSelect(null)} />
          {kafedralar.map(k => {
            const count = teachers.filter(t => t.dept === k).length
            return <KafedraBtn key={k} label={k} count={count} active={activeKafedra === k} onClick={() => onSelect(k)} />
          })}
        </div>
      )}
    </div>
  )
}

function KafedraBtn({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 4, background: active ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'transparent', color: active ? '#fff' : 'var(--text)', fontSize: 12, fontWeight: 500, textAlign: 'left', lineHeight: 1.4 }}
    >
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 6, background: active ? 'rgba(255,255,255,.25)' : 'rgba(124,58,237,.1)', color: active ? '#fff' : '#7c3aed', padding: '1px 7px', borderRadius: 20 }}>{count}</span>
    </button>
  )
}

export default function Teachers() {
  const { data: teachers, loading, error } = useApi(
    `${import.meta.env.VITE_API_URL}/api/teachers`,
    FALLBACK_TEACHERS
  )
  const [activeKafedra, setActiveKafedra] = useState(null)

  const filtered = activeKafedra ? teachers.filter(t => t.dept === activeKafedra) : teachers

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1.5rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Professor-o'qituvchilar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU ning malakali o'qituvchilar jamoasi</p>
      </section>

      <section className="section">
        <div className="container">
          {error && (
            <div style={{ textAlign: 'center', padding: '0.75rem', marginBottom: '1rem', background: 'rgba(124,58,237,.06)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', border: '1px solid var(--border)' }}>
              Serverga ulanib bo'lmadi — saqlangan ma'lumotlar ko'rsatilmoqda
            </div>
          )}

          <div className="teachers-layout" style={{ display: 'grid', gridTemplateColumns: 'clamp(160px, 22%, 220px) 1fr', gap: '1.5rem', alignItems: 'start' }}>

            <KafedraSidebar teachers={teachers} activeKafedra={activeKafedra} onSelect={setActiveKafedra} />

            <div>
              {activeKafedra && (
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', padding: '8px 12px', background: 'rgba(124,58,237,.08)', borderRadius: 8, border: '1px solid rgba(124,58,237,.2)' }}>
                  {activeKafedra} — {filtered.length} nafar
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                  Yuklanmoqda...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                  {filtered.map((t, i) => (
                    <div key={t._id || t.id} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff', fontSize: 18, fontWeight: 700 }}>
                        {t.avatar || t.name?.slice(0,2).toUpperCase()}
                      </div>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{t.name}</h3>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 6 }}>{t.role}</div>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{t.dept}</p>
                      {t.email && <p style={{ fontSize: 11, color: '#7c3aed', marginTop: 4 }}>{t.email}</p>}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: 13 }}>
                      Bu kafedraga biriktirilgan o'qituvchi topilmadi
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}