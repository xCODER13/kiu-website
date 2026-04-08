import { useState } from 'react'
import config from '../config'

const facultyDetails = {
  "Maktabgacha ta'lim": {
    desc: "Maktabgacha yoshdagi bolalar bilan ishlash bo'yicha yuqori malakali mutaxassislar tayyorlash.",
    subjects: ["Psixologiya", "Pedagogika", "Bolalar adabiyoti", "Matematika asoslari", "Musiqa"],
    career: ["Maktabgacha ta'lim muassasasi direktori", "Tarbiyachi", "Metodist", "Psixolog"],
    duration: "4 yil", lang: "O'zbek/Rus",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  "Boshlang'ich ta'lim": {
    desc: "Boshlang'ich sinf o'quvchilariga ta'lim beruvchi malakali o'qituvchilar tayyorlash.",
    subjects: ["Ona tili", "Matematika", "Tabiat", "Tasviriy san'at", "Musiqa"],
    career: ["Boshlang'ich sinf o'qituvchisi", "Metodist", "Maktab direktori"],
    duration: "4 yil", lang: "O'zbek",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  },
  "Milliy g'oya, ma'naviyat asoslari va huquqta'limi": {
    desc: "Milliy qadriyatlar va huquq sohasida bilimli mutaxassislar tayyorlash.",
    subjects: ["Konstitutsiyaviy huquq", "Milliy g'oya", "Falsafa", "Tarix", "Huquqshunoslik"],
    career: ["O'qituvchi", "Davlat xizmati", "Huquq maslahatchi"],
    duration: "4 yil", lang: "O'zbek",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
  "Neft va gaz ishi": {
    desc: "Neft-gaz sanoati uchun yuqori malakali muhandis va texnologlar tayyorlash.",
    subjects: ["Neft kimyosi", "Qazib olish texnologiyasi", "Ekologiya", "Iqtisodiyot", "Muhandislik"],
    career: ["Neft-gaz muhandisi", "Texnolog", "Laborant", "Loyiha menejeri"],
    duration: "4 yil", lang: "O'zbek/Ingliz",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
  },
  "Iqtisodiyot": {
    desc: "Zamonaviy bozor iqtisodiyoti sharoitida raqobatbardosh iqtisodchilar tayyorlash.",
    subjects: ["Makroiqtisodiyot", "Mikroiqtisodiyot", "Marketing", "Menejment", "Statistika"],
    career: ["Iqtisodchi", "Moliyaviy tahlilchi", "Bank xodimi", "Tadbirkor"],
    duration: "4 yil", lang: "O'zbek/Ingliz",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  },
  "Dasturiy injiniring": {
    desc: "Zamonaviy dasturiy ta'minot ishlab chiqish sohasida yuqori malakali mutaxassislar tayyorlash.",
    subjects: ["Python", "JavaScript", "Ma'lumotlar bazasi", "Sun'iy intellekt", "Mobil dasturlash"],
    career: ["Dasturchi", "Web developer", "Data scientist", "DevOps", "IT menejeri"],
    duration: "4 yil", lang: "O'zbek/Ingliz",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  },
  "Moliya va moliyaviy texnologiyalar": {
    desc: "Fintech va zamonaviy moliya sohasida innovatsion mutaxassislar tayyorlash.",
    subjects: ["Moliya nazariyasi", "Blokcheyn", "FinTech", "Risk menejment", "Investitsiya"],
    career: ["Moliyaviy maslahatchi", "FinTech mutaxassisi", "Bank xodimi", "Investitsiya menejeri"],
    duration: "4 yil", lang: "O'zbek/Ingliz",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  },
  "Buxgalteriya hisobi": {
    desc: "Moliyaviy hisobot va audit sohasida malakali buxgalterlar tayyorlash.",
    subjects: ["Buxgalteriya hisobi", "Audit", "Soliqlar", "Moliyaviy tahlil", "1C dasturi"],
    career: ["Buxgalter", "Auditor", "Moliyaviy direktor", "Soliq maslahatchi"],
    duration: "4 yil", lang: "O'zbek",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  },
  "Psixologiya": {
    desc: "Insonlar ruhiy salomatligi va ijtimoiy muammolarini hal qiluvchi psixologlar tayyorlash.",
    subjects: ["Umumiy psixologiya", "Klinik psixologiya", "Ijtimoiy psixologiya", "Psixodiagnostika"],
    career: ["Psixolog", "Psixoterapevt", "HR mutaxassisi", "Klinik psixolog"],
    duration: "4 yil", lang: "O'zbek",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
  },
  "Filologiya va tillarni o'qitish": {
    desc: "Til va adabiyot sohasida bilimli, xalqaro miqyosda faoliyat yurita oladigan mutaxassislar.",
    subjects: ["Ingliz tili", "Adabiyot", "Tilshunoslik", "Tarjima nazariyasi", "Nutq madaniyati"],
    career: ["O'qituvchi", "Tarjimon", "Muharrir", "Diplomat", "Jurnalist"],
    duration: "4 yil", lang: "O'zbek/Ingliz",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  },
}

export default function Faculty() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Yo'nalishlar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{config.faculties.length} ta yo'nalish bo'yicha xalqaro standartlarda ta'lim</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-auto">
            {config.faculties.map((f, i) => {
              const det = facultyDetails[f.name]
              return (
                <div key={f.name} className={`card reveal reveal-delay-${(i % 4) + 1}`}
                  style={{ cursor: 'pointer', borderColor: selected === f.name ? '#7c3aed' : undefined }}
                  onClick={() => setSelected(selected === f.name ? null : f.name)}>
                  <div className="fac-icon" style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: '#7c3aed' }}>
                    {det?.icon}
                  </div>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>{f.name}</h3>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{f.count} ta yo'nalish</p>
                  <span style={{ fontSize: 11, color: '#7c3aed' }}>{selected === f.name ? '▲ Yopish' : '▼ Batafsil'}</span>
                </div>
              )
            })}
          </div>

          {/* Detail panel */}
          {selected && facultyDetails[selected] && (
            <div className="card" style={{ marginTop: '1.5rem', padding: '2rem', borderColor: '#7c3aed', background: 'var(--bg)' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#1a1a2e', marginBottom: '1rem' }}>{selected}</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{facultyDetails[selected].desc}</p>
              <div className="grid-2" style={{ gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>O'qitiladigan fanlar:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {facultyDetails[selected].subjects.map(s => (
                      <span key={s} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(124,58,237,.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,.2)' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Karyera imkoniyatlari:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {facultyDetails[selected].career.map(c => (
                      <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>Davomiyligi:</span> {facultyDetails[selected].duration}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>O'qitish tili:</span> {facultyDetails[selected].lang}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}