const REVIEWS = [
  { id: 1, name: "Aziza Karimova", faculty: "Dasturiy injiniring", year: "3-kurs", text: "KIU da o'qish hayotimni o'zgartirdi. Zamonaviy o'qitish usullari va professional o'qituvchilar tufayli ko'p narsani o'rgandim.", avatar: "AK" },
  { id: 2, name: "Jasur Toshmatov", faculty: "Iqtisodiyot", year: "2-kurs", text: "Xalqaro hamkorlik dasturlari va stipendiya imkoniyatlari juda zo'r. Xorijiy universitetlarda o'qish imkonim bo'ldi.", avatar: "JT" },
  { id: 3, name: "Malika Yusupova", faculty: "Psixologiya", year: "4-kurs", text: "O'qituvchilar har doim yordam berishga tayyor. Kampus muhiti juda iliq va do'stona. KIU ni tanlashimdan xursandman!", avatar: "MY" },
  { id: 4, name: "Bobur Rahimov", faculty: "Moliya", year: "1-kurs", text: "Bepul avtobus, yotoqxona va zamonaviy kutubxona — bularning barchasi o'qishni qulay qilib berdi.", avatar: "BR" },
  { id: 5, name: "Nilufar Hasanova", faculty: "Filologiya", year: "3-kurs", text: "Xalqaro konferensiyalarda ishtirok etish imkoniyati ajoyib. Bu tajriba mening kelajak rejalari uchun katta ahamiyat kasb etdi.", avatar: "NH" },
  { id: 6, name: "Sardor Mirzayev", faculty: "Dasturiy injiniring", year: "Bitiruvchi", text: "KIU da olgan bilimlarim tufayli yaxshi ish topishga muvaffaq bo'ldim. Universitetimizdan faxrlanaman!", avatar: "SM" },
]

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

export default function Testimonials() {
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Talabalar sharhlari</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Talabalarimiz KIU haqida nima deydi</p>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {REVIEWS.map((r, i) => (
              <div key={r.id} className={`card reveal reveal-delay-${(i % 4) + 1}`}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {[1,2,3,4,5].map(s => <StarIcon key={s} />)}
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                    {r.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.faculty} · {r.year}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 