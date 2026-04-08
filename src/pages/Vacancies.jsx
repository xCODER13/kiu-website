import { useState } from 'react'

const BENEFITS = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: "Raqobatbardosh ish haqi", desc: "Bozor narxidan yuqori maosh" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title: "Zamonaviy infratuzilma", desc: "Akademik va texnik jihozlar" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: "Xalqaro loyihalar", desc: "Konferensiyalar va xorijiy hamkorlik" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, title: "Martaba o'sishi", desc: "Malaka oshirish imkoniyatlari" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: "Samimiy jamoa", desc: "Yangi xodimlarga moslashishda yordam" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, title: "Ilmiy izlanish", desc: "Tadqiqot va nashrlar uchun imkoniyat" },
]

const REQUIREMENTS = [
  "Oliygoh darajasidagi tegishli yo'nalishda ma'lumot (o'qituvchilar uchun kamida magistr darajasi)",
  "Zamonaviy o'qitish uslublari va axborot texnologiyalarini bilish",
  "O'z ustida ishlashga intilish va yangiliklarga ochiqlik",
  "Javobgarlik, muloqot qobiliyati va jamoada ishlash ko'nikmasi",
]

const DOCS_NEEDED = [
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, text: "Rezyume (CV)" },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, text: "Obyektivka" },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>, text: "Diplom va sertifikatlar nusxasi" },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, text: "Portfel (agar mavjud bo'lsa)" },
]

const POSITIONS = ["O'qituvchi", "Katta o'qituvchi", "Dotsent", "Professor", "Laborant", "Metodist", "Ma'muriy xodim", "IT mutaxassisi", "Boshqa"]
const FACULTIES = ["Aniq fanlar kafedrasi", "Ijtimoiy-gumanitar fanlar kafedrasi", "Tillar kafedrasi", "Iqtisodiyot va muhandislik kafedrasi", "Ma'muriyat", "IT bo'limi", "Sport bo'limi", "Boshqa"]

const iconStyle = { width: 40, height: 40, borderRadius: 10, background: 'rgba(124,58,237,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)' }
const labelStyle = { fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }
const sectionBoxStyle = { padding: '1.25rem', background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--border)' }
const sectionTitleStyle = { fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }

export default function Vacancies() {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', position: '', faculty: '', education: '', experience: '', message: '', hasPortfolio: false })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, name: form.fullName, type: 'vacancy' }),
      })
    } catch (error) {
      console.error('Error submitting application:', error);
    }
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="fade-up">
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Vakant o'rinlar mavjud
        </div>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Jamoamizga qo'shiling!</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 560, margin: '0 auto' }}>
          Qarshi xalqaro universiteti o'z jamoasiga tashabbuskor, malakali va fidokor mutaxassislarni taklif etadi.
        </p>
      </section>

      <section className="section">
        <div className="container">

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
            {[{ key: 'info', label: "Ma'lumot" }, { key: 'form', label: 'Ariza topshirish' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '10px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab.key ? '#7c3aed' : 'var(--muted)', borderBottom: activeTab === tab.key ? '2px solid #7c3aed' : '2px solid transparent', marginBottom: -1, fontFamily: 'var(--font-body)', transition: 'all .2s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div>
              {/* Banner */}
              <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: 16, padding: '2.5rem', marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1rem' }}>Nima uchun KIU?</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8 }}>
                  Bu yerda siz nafaqat ish, balki o'sish, ilmiy izlanish va o'z salohiyatingizni ro'yobga chiqarish imkoniyatiga ega bo'lasiz. Biz bilimli, yetuk va zamonaviy fikrlaydigan kadrlarni tarbiyalash yo'lida birga ishlashni xohlaymiz.
                </p>
              </div>

              {/* Benefits */}
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>Biz taklif etamiz</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
                {BENEFITS.map((b, i) => (
                  <div key={i} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div className="vacancy-icon" style={iconStyle}>{b.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{b.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Requirements */}
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>Umumiy talablar</h2>
              <div className="card" style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {REQUIREMENTS.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{r}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to apply */}
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>Qanday ariza topshirish mumkin?</h2>
              <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="vacancy-icon" style={{ ...iconStyle, width: 32, height: 32 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    Email orqali
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
                    Hujjatlarni <strong style={{ color: '#7c3aed' }}>info@kiu.uz</strong> manziliga yuboring:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {DOCS_NEEDED.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                        <span style={{ color: '#7c3aed' }}>{d.icon}</span> {d.text}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', padding: '10px 12px', background: 'rgba(124,58,237,.05)', borderRadius: 8, border: '1px solid rgba(124,58,237,.15)', fontSize: 12, color: 'var(--muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  Arizalar <strong style={{ color: 'var(--text)' }}>7 ish kuni</strong> ichida ko'rib chiqiladi
</span>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="vacancy-icon" style={{ ...iconStyle, width: 32, height: 32 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.58 4.88C1.58 3.85 2.35 3 3.39 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18v-.08z"/></svg>
                    </div>
                    Bog'lanish
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Telefon 1', value: '+998 91 961 11 00' },
                      { label: 'Telefon 2', value: '+998 91 211 54 52' },
                      { label: 'Email', value: 'info@kiu.uz' },
                    ].map((c, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>{c.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setActiveTab('form')} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 14 }}>
                  Online ariza topshirish →
                </button>
              </div>
            </div>
          )}

          {/* FORM TAB */}
          {activeTab === 'form' && (
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              {!sent ? (
                <div className="card" style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.3rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Ishga joylashish uchun so'rovnoma</h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>Barcha maydonlarni to'liq va aniq to'ldiring. Arizangiz 7 ish kuni ichida ko'rib chiqiladi.</p>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Shaxsiy */}
                    <div style={sectionBoxStyle}>
                      <div style={sectionTitleStyle}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Shaxsiy ma'lumotlar
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={labelStyle}>To'liq ism (FIO) *</label>
                          <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Familiya Ism Otasining ismi" style={inputStyle} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <label style={labelStyle}>Telefon *</label>
                            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+998 90 123 45 67" style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Email *</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" style={inputStyle} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ish */}
                    <div style={sectionBoxStyle}>
                      <div style={sectionTitleStyle}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        Ish ma'lumotlari
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <label style={labelStyle}>Lavozim *</label>
                            <select name="position" value={form.position} onChange={handleChange} required style={inputStyle}>
                              <option value="">Tanlang</option>
                              {POSITIONS.map(p => <option key={p}>{p}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Bo'lim / Kafedra *</label>
                            <select name="faculty" value={form.faculty} onChange={handleChange} required style={inputStyle}>
                              <option value="">Tanlang</option>
                              {FACULTIES.map(f => <option key={f}>{f}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <label style={labelStyle}>Ta'lim darajasi *</label>
                            <select name="education" value={form.education} onChange={handleChange} required style={inputStyle}>
                              <option value="">Tanlang</option>
                              <option>Bakalavr</option>
                              <option>Magistr</option>
                              <option>PhD</option>
                              <option>Fan doktori</option>
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Ish tajribasi *</label>
                            <select name="experience" value={form.experience} onChange={handleChange} required style={inputStyle}>
                              <option value="">Tanlang</option>
                              <option>Tajribam yo'q</option>
                              <option>1 yilgacha</option>
                              <option>1–3 yil</option>
                              <option>3–5 yil</option>
                              <option>5–10 yil</option>
                              <option>10 yildan ortiq</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Qo'shimcha */}
                    <div style={sectionBoxStyle}>
                      <div style={sectionTitleStyle}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Qo'shimcha ma'lumotlar
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={labelStyle}>O'zingiz haqingizda qisqacha</label>
                          <textarea name="message" value={form.message} onChange={handleChange}
                            placeholder="Tajribangiz, qobiliyatlaringiz va nima uchun KIU ga qo'shilmoqchi ekanlingingiz haqida yozing..."
                            rows={4} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
                          <input type="checkbox" name="hasPortfolio" checked={form.hasPortfolio} onChange={handleChange}
                            style={{ width: 16, height: 16, accentColor: '#7c3aed' }} />
                          Portfelim (portfolio) mavjud
                        </label>
                      </div>
                    </div>

                    {/* Docs reminder */}
                    <div style={{ padding: '1rem', background: 'rgba(124,58,237,.05)', borderRadius: 10, border: '1px solid rgba(124,58,237,.15)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        Hujjatlarni email orqali yuboring: info@kiu.uz
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {DOCS_NEEDED.map((d, i) => (
                          <span key={i} style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--bg)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ color: '#7c3aed' }}>{d.icon}</span> {d.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14 }} disabled={loading}>
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                          Yuborilmoqda...
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                          Ariza yuborish
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#faf5ff,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#7c3aed' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', color: '#1a1a2e', marginBottom: '.75rem' }}>Arizangiz qabul qilindi!</h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                    Hurmatli <strong style={{ color: 'var(--text)' }}>{form.fullName}</strong>, arizangiz muvaffaqiyatli yuborildi. Mutaxassislarimiz <strong style={{ color: 'var(--text)' }}>7 ish kuni</strong> ichida siz bilan bog'lanadi.
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => { setSent(false); setForm({ fullName: '', phone: '', email: '', position: '', faculty: '', education: '', experience: '', message: '', hasPortfolio: false }) }} className="btn btn-secondary" style={{ fontSize: 13 }}>
                      Yangi ariza
                    </button>
                    <button onClick={() => setActiveTab('info')} className="btn btn-primary" style={{ fontSize: 13 }}>
                      Ma'lumotlarga qaytish
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </div>
  )
}