import { useState } from 'react'

const FAQS = [
  { q: "Qabul qachon boshlanadi?", a: "Qabul har yili 1-iyuldan 20-avgustgacha davom etadi. Hujjatlar qabul komissiyasiga shaxsan yoki online topshiriladi." },
  { q: "Qanday hujjatlar kerak?", a: "Pasport yoki tug'ilganlik guvohnomasi, attestat, 3x4 o'lchamdagi 2 ta surat, tibbiy ma'lumotnoma (086-shakl)." },
  { q: "Grant asosida o'qish mumkinmi?", a: "Ha! KIU da rektor va ta'sischilar stipendiyasi mavjud. Yuqori ball to'plagan abituriyentlar grant asosida o'qish imkoniyatiga ega." },
  { q: "Yotoqxona bormi?", a: "Ha, universitetimizda talabalar uchun zamonaviy yotoqxona mavjud. Joylar cheklangan, shuning uchun erta murojaat qilish tavsiya etiladi." },
  { q: "Qaysi yo'nalishlar eng ko'p talab qilinadi?", a: "Dasturiy injiniring, Iqtisodiyot va Psixologiya yo'nalishlari eng ko'p talab qilinadigan yo'nalishlar hisoblanadi." },
  { q: "To'lov qancha?", a: "To'lov miqdori yo'nalishga qarab farqlanadi. Batafsil ma'lumot uchun qabul komissiyasiga murojaat qiling: +998 55 500 99 44." },
  { q: "Xorijiy universitetlar bilan hamkorlik bormi?", a: "Ha! KIU Malayziya, Germaniya, Polsha va boshqa mamlakatlarning nufuzli universitetlari bilan hamkorlik shartnomasi imzolagan." },
  { q: "Bepul avtobus xizmati bormi?", a: "Ha, universitetimiz talabalar uchun bepul avtobus xizmatini yo'lga qo'ygan. Marshrut va jadval haqida ma'lumot olish uchun murojaat qiling." },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Ko'p so'raladigan savollar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Tez-tez beriladigan savollarga javoblar</p>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="reveal" style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: open === i ? '#7c3aed' : 'var(--text)' }}>{faq.q}</span>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: open === i ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={open === i ? '#fff' : '#7c3aed'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {open === i ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                  </svg>
                </div>
              </button>
              {open === i && (
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, paddingBottom: '1rem' }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}