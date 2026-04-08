import { useEffect, useState } from 'react'

const FALLBACK_TEACHERS = [
  { id: 1, name: "Panjiyev Ulug'bek Rustamovich", role: "Rektor", dept: "Kimyo fanlari PhD, dotsent", avatar: "PU" },
  { id: 2, name: "Norinov Faxriyor Kurbonovich", role: "Prorektor", dept: "faxriyor.norinov@karshitestcenter.org", avatar: "NF" },
  { id: 3, name: "Ibragimov Suxrob ",role: "iqtisodiyot va muhandislik kafedrasi mudiri", dept: "Iqtisodiyot va muhandislik", avatar: "IS" },
  { id: 4, name: "Ochilov Anvar Maxamad o'g'li", role: "O'qituvchi", dept: "Filologiya va tillarni o'qitish", avatar: "OA" },
  { id: 5, name: "Shukurova Nargiza Ikramovna", role: "O'qituvchi", dept: "Ijtimoiy-gumanitar fanlar", avatar: "SN" },
  { id: 6, name: "Murodov Shukrilla Abdusaid o'g'li", role: "Vb. dotsent", dept: "Aniq fanlar kafedrasi", avatar: "MS" },
  { id: 7, name: "Mardonova Go'zal Mamatqul qizi", role: "O'qituvchi", dept: "Aniq fanlar kafedrasi", avatar: "MG" },
  { id: 8, name: "Nomozova Nargiza Turayevna", role: "O'qituvchi", dept: "Ingliz tili", avatar: "NN" },
  { id: 9, name: "Jo'rayev Sulton Murodullo o'g'li", role: "O'qituvchi", dept: "Ijtimoiy-gumanitar fanlar", avatar: "JS" },
  { id: 10, name: "Yakubova Gulchehra Ziyatovna", role: "Katta o'qituvchi", dept: "Ijtimoiy-gumanitar fanlar", avatar: "YG" },
  { id: 11, name: "Xidoyatova Nigora Shorakibovna", role: "Katta o'qituvchi", dept: "Aniq fanlar kafedrasi", avatar: "XN" },
  { id: 12, name: "Rustamov Mirzoxid Mansur o'g'li", role: "O'qituvchi", dept: "Iqtisodiyot va muhandislik", avatar: "RM" },
  { id: 13, name: "G'afforov Javohir Farhodjon o'g'li", role: "O'qituvchi", dept: "Iqtisodiyot va muhandislik", avatar: "GJ" },
  { id: 14, name: "Abdushukurova Sevara Shavkatovna", role: "Oqituvchi", dept: "Ingliz tili", avatar: "AS" },
  { id: 15, name: "To'rayev Dostonjon Erkin o'g'li", role: "O'qituvchi", dept: "Iqtisodiyot va muhandislik", avatar: "TD" },
  {id: 16, name: "Tursunov Mirolim ", role: "O'qituvchi", dept: "Iqtisodiyot va muhandislik", avatar: "TM" },
  {id: 17, name: "Rashidov Azizjon ", role: "O'qituvchi", dept: "Iqtisodiyot va muhandislik", avatar: "RA" },
  {id: 18, name: "Gulzoda Muhiddinova", role: "O'qituvchi", dept: "Iqtisodiyot va muhandislik", avatar: "GM" },
  {id: 19, name: "Faxriddin Samarov", role: "O'qituvchi", dept: "Ijtimoiy-gumanitar fanlar", avatar: "FS" },
  {id: 20, name: "Malohat Rahimova", role: "O'qituvchi", dept: "Filologiya va tillarni o'qitish", avatar: "MR" },
]

const colors = ['#7c3aed','#4f46e5','#0088cc','#059669','#d97706','#db2777']

export default function Teachers() {
  const [teachers, setTeachers] = useState(FALLBACK_TEACHERS)

  useEffect(() => {
    fetch('http://localhost:5000/api/teachers')
      .then(r => r.json())
      .then(data => { if (data.length > 0) setTeachers(data) })
      .catch(() => {})
  }, [])

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Professor-o'qituvchilar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU ning malakali o'qituvchilar jamoasi ({teachers.length} nafar)</p>
      </section>
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {teachers.map((t, i) => (
              <div key={t._id} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff', fontSize: 18, fontWeight: 700 }}>
                  {t.avatar || t.name?.slice(0,2).toUpperCase()}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{t.name}</h3>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 6 }}>{t.role}</div>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{t.dept}</p>
                {t.email && <p style={{ fontSize: 11, color: '#7c3aed', marginTop: 4 }}>{t.email}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}