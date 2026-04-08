import { useState, useRef, useEffect } from 'react'

const RESPONSES = {
  'qabul': "Qabul 1 iyuldan 20 avgustgacha davom etadi. Kerakli hujjatlar: pasport, attestat, 3x4 surat. Ariza topshirish uchun saytdagi 'Ariza topshirish' tugmasini bosing.",
  'hujjat': "Qabul uchun kerakli hujjatlar: 1) Pasport, 2) Attestat, 3) 3x4 o'lchamli 2 ta surat, 4) Tibbiy ma'lumotnoma (086-shakl).",
  'narx': "To'lov miqdori yo'nalishga qarab farqlanadi. Batafsil ma'lumot uchun: +998 55 500 99 44 ga qo'ng'iroq qiling.",
  'grant': "Ha! KIU da rektor va ta'sischilar stipendiyasi mavjud. Yuqori ball to'plagan abituriyentlar grant asosida o'qish imkoniyatiga ega.",
  'yo\'nalish': "KIU da 10 ta yo'nalish mavjud: Dasturiy injiniring, Iqtisodiyot, Psixologiya, Filologiya, Moliya, Buxgalteriya, Neft va gaz, Maktabgacha ta'lim, Boshlang'ich ta'lim, Milliy g'oya.",
  'manzil': "1-kampus: Qarshi sh., Bahodir Sherqulov ko'chasi, 7-uy. 2-kampus: Mustaqillik ko'chasi, 71-uy.",
  'telefon': "Telefon: +998 55 500 99 44. Ish vaqti: Du-Shan 09:00-20:00.",
  'telegram': "Rasmiy Telegram kanal: @KarshistateU. Kanalga obuna bo'ling!",
  'yotoqxona': "Ha, universitetimizda zamonaviy yotoqxona mavjud. Joylar cheklangan, erta murojaat qiling.",
  'avtobus': "Ha! KIU talabalar uchun bepul avtobus xizmatini yo'lga qo'ygan.",
  'salom': "Salom! Men KIU AI yordamchisiman. Sizga qanday yordam bera olaman? 😊",
  'rahmat': "Iltimos! Boshqa savollaringiz bo'lsa bering 😊",
}

function getResponse(msg) {
  const lower = msg.toLowerCase()
  for (const [key, val] of Object.entries(RESPONSES)) {
    if (lower.includes(key)) return val
  }
  return "Kechirasiz, bu savolga javob topa olmadim. Qo'shimcha ma'lumot uchun: +998 55 500 99 44 ga murojaat qiling yoki @KarshistateU Telegram kanalimizga yozing."
}

const SUGGESTIONS = ["Qabul haqida", "Yo'nalishlar", "To'lov narxi", "Grant bormi?", "Manzil", "Telefon"]

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: "Salom! Men KIU AI yordamchisiman 🎓\nSavollaringizga javob berishga tayyorman!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send(text) {
    const msg = text || input.trim()
    if (!msg) return
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: msg }])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: getResponse(msg) }])
      setLoading(false)
    }, 800)
  }

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>AI Yordamchi</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU haqida savollaringizni bering</p>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 680 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>KIU AI Yordamchi</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Doim onlayn</div>
              </div>
              <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
            </div>

            {/* Messages */}
            <div style={{ height: 380, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-2)' }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: m.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: m.from === 'user' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'var(--bg)',
                    color: m.from === 'user' ? '#fff' : 'var(--text)',
                    fontSize: 13, lineHeight: 1.6,
                    border: m.from === 'bot' ? '1px solid var(--border)' : 'none',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--bg)', borderRadius: '14px 14px 14px 4px', width: 'fit-content', border: '1px solid var(--border)' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', animation: `bounce 1s infinite ${i * 0.2}s` }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.05)', color: '#7c3aed', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .2s' }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Savolingizni yozing..."
                style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)' }}
              />
              <button onClick={() => send()} style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
        </div>
      </section>
    </div>
  )
}