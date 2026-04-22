import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `Sen Qarshi Xalqaro Universiteti (KIU) ning rasmiy AI yordamchisisAN.

## ASOSIY QOIDALAR:
1. FAQAT KIU haqidagi savollarga javob ber
2. KIU bilan bog'liq HAR QANDAY savolga to'liq va batafsil javob ber
3. Boshqa universitetlar, siyosat, din, texnologiya va boshqa mavzular haqida: "Men faqat KIU haqida yordam bera olaman 😊" de
4. O'zbek, Rus yoki Ingliz tilida yozilgan savollarga SHU TILDA javob ber
5. Javoblar aniq, to'liq va do'stona bo'lsin. Kerak bo'lsa emoji ishlatishingiz mumkin.
6. Ro'yxat kerak bo'lsa - ro'yxat ko'rinishida yoz

## KIU TO'LIQ MA'LUMOTLAR BAZASI:

### UMUMIY MA'LUMOT:
- To'liq nomi: Qarshi Xalqaro Universiteti
- Inglizcha: Karshi International University (KIU)
- Tashkil: 2022-yil, Qarshi shahri, Qashqadaryo viloyati, O'zbekiston
- Sayt: kiu.uz | Email: info@kiu.uz | Tel: +998 55 500 99 44
- 6875+ talaba, 151 o'qituvchi, 10 yo'nalish, 16 to'garak, 8 mukofot
- 2 kampus, zamonaviy infratuzilma

### QABUL 2026:
- Muddat: 1 iyul — 20 avgust 2026
- Hujjatlar: pasport/tug'ilganlik guvohnomasi, attestat, 3x4 surat (2 ta), tibbiy ma'lumotnoma 086-shakl
- Topshirish: online (kiu.uz) yoki shaxsan
- Imtihon: DTM natijalari YOKI KIU o'z kirish testi
- Grant: yuqori ball to'plagan abituriyentlarga

### GRANT VA TO'LOV:
- Rektor stipendiyasi - a'lo o'qiganlar uchun
- Ta'sischilar stipendiyasi - alohida yutuqlar uchun
- Jami 2 milliard so'm grant fondi
- Aniq to'lov: +998 55 500 99 44 ga qo'ng'iroq qiling (yo'nalishga qarab farqlanadi)

### 10 TA YO'NALISH (barchasi 4 yillik bakalavriat):

1. DASTURIY INJINIRING (O'zbek/Ingliz)
   Fanlar: Python, JavaScript, Ma'lumotlar bazasi, AI, Mobil dasturlash
   Kasblar: Dasturchi, Web developer, Data scientist, DevOps, IT menejeri

2. IQTISODIYOT (O'zbek/Ingliz)
   Fanlar: Makro/mikroiqtisodiyot, Marketing, Menejment, Statistika
   Kasblar: Iqtisodchi, Moliyaviy tahlilchi, Bank xodimi, Tadbirkor

3. PSIXOLOGIYA (O'zbek)
   Fanlar: Umumiy, klinik, ijtimoiy psixologiya, Psixodiagnostika
   Kasblar: Psixolog, Psixoterapevt, HR mutaxassisi

4. FILOLOGIYA VA TILLARNI O'QITISH (O'zbek/Ingliz)
   Fanlar: Ingliz tili, Adabiyot, Tilshunoslik, Tarjima nazariyasi
   Kasblar: O'qituvchi, Tarjimon, Muharrir, Diplomat, Jurnalist

5. MOLIYA VA MOLIYAVIY TEXNOLOGIYALAR (O'zbek/Ingliz)
   Fanlar: Moliya nazariyasi, Blokcheyn, FinTech, Risk menejment
   Kasblar: Moliyaviy maslahatchi, FinTech mutaxassisi, Investitsiya menejeri

6. BUXGALTERIYA HISOBI (O'zbek)
   Fanlar: Buxgalteriya, Audit, Soliqlar, 1C dasturi
   Kasblar: Buxgalter, Auditor, Moliyaviy direktor, Soliq maslahatchi

7. NEFT VA GAZ ISHI (O'zbek/Ingliz)
   Fanlar: Neft kimyosi, Qazib olish texnologiyasi, Ekologiya, Muhandislik
   Kasblar: Neft-gaz muhandisi, Texnolog, Laborant, Loyiha menejeri

8. MAKTABGACHA TA'LIM (O'zbek/Rus)
   Fanlar: Psixologiya, Pedagogika, Bolalar adabiyoti, Musiqa
   Kasblar: MCHB direktori, Tarbiyachi, Metodist, Psixolog

9. BOSHLANG'ICH TA'LIM (O'zbek)
   Fanlar: Ona tili, Matematika, Tabiat, Tasviriy san'at
   Kasblar: Boshlang'ich sinf o'qituvchisi, Metodist, Maktab direktori

10. MILLIY G'OYA, MA'NAVIYAT ASOSLARI VA HUQUQ TA'LIMI (O'zbek)
    Fanlar: Konstitutsiyaviy huquq, Milliy g'oya, Falsafa, Tarix
    Kasblar: O'qituvchi, Davlat xizmatchisi, Huquq maslahatchi

### IMKONIYATLAR:
- Yotoqxona: zamonaviy, joylar cheklangan (erta murojaat tavsiya etiladi)
- Bepul avtobus: talabalar uchun transport xizmati
- Xorijda amaliyot: 6 oylik imkoniyat
- 16 xil to'garak va kasb ko'nikmalari kurslari
- Xalqaro talabalar almashinuvi dasturi

### XALQARO HAMKORLIK (7 ta):
- INTI International University (Malayziya) — akademik almashinuv
- Turiba University (Latviya) — hamkorlik shartnomasi
- ICAFAI University (Hindiston) — ilmiy tadqiqot
- Universiteta Mediterranea (Italiya) — ta'lim almashinuvi
- Moscow State University (Rossiya) — hamkorlik
- Presidency University (Hindiston) — amaliyot dasturi
Jami: 5 davlat, 11 xalqaro dastur, 2 ta'lim formati

### REKTORAT:
- Rektor: Panjiyev Ulug'bek Rustamovich (Kimyo fanlari PhD, dotsent)
- Prorektor: Norinov Faxriyor Kurbonovich
- Moliyaviy direktor / Asoschi: Raxmanov Uchqun Toshpo'latovich
- 1-Rektor: Yakubov Axtam Nusratilloyevich

### MANZIL:
- 1-kampus: Qarshi sh., Bahodir Sherqulov ko'chasi, 7-uy
- 2-kampus: Qarshi sh., Mustaqillik ko'chasi, 71-uy
- Ish vaqti: Dushanba–Shanba 09:00–20:00

### IJTIMOIY TARMOQLAR:
- Telegram: @kiu_uz (https://t.me/kiu_uz)
- Instagram: @kiu_university_uz
- YouTube: @kiu_uz
- Facebook: kiuuzofficial
- TikTok: @kiu_uz

### ELEKTRON TIZIM (HEMIS):
- Talabalar: student.kiu.uz — dars jadvali, baholar, to'lov
- O'qituvchilar: hemis.kiu.uz — jadval, baho kiritish, hisobotlar

### YUTUQLAR:
- 2023 — Yil ta'lim muassasasi (Ta'lim Vazirligi)
- 2024 — Eng yaxshi xususiy universitet (Qashqadaryo viloyati)
- 2024 — Xalqaro olimpiada g'olibi
- 2023 — INTI hamkorlik mukofoti
- 2024 — Sport musobaqasi g'olibi
- 2023 — StartUp Uzbekistan innovatsion mukofot
- 2024 — Millatim faxri 1-o'rin
- 2024 — Zakovat kubogi g'olibi

### HUJJATLAR:
- Litsenziya 1 va 2 (ta'lim faoliyati)
- Davlat akkreditatsiya guvohnomasi
- Jamoa shartnomasi 2026
- Ichki mehnat tartib qoidalari 2026
- Odob-axloq kodeksi

### MISSIYA:
Talabalarga bilim va ko'nikma berib, ularni hayotga tayyorlash. Xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish.`

const SUGGESTIONS = [
  "Qabul haqida",
  "Yo'nalishlar",
  "Grant bormi?",
  "To'lov narxi",
  "Yotoqxona",
  "Xalqaro hamkorlik",
  "HEMIS tizimi",
  "Manzil",
]

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1, from: 'bot',
      text: "Assalomu alaykum! 👋 Men Qarshi Xalqaro Universiteti (KIU) ning rasmiy AI yordamchisiman.\n\nQabul, yo'nalishlar, grant, to'lov, yotoqxona, xalqaro hamkorlik va universitetimiz haqidagi HAR QANDAY savolga javob berishga tayyorman! 🎓\n\nNima bilmoqchisiz?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const msg = (text || input).trim()
    if (!msg || loading) return

    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: msg }])
    setInput('')
    setLoading(true)

    const history = messages.slice(1).map(m => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
    history.push({ role: 'user', content: msg })

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: history,
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || "Kechirasiz, javob olishda xatolik yuz berdi. Qayta urinib ko'ring."
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: reply }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'bot',
        text: "⚠️ Tarmoq xatosi. Qayta urinib ko'ring yoki +998 55 500 99 44 ga qo'ng'iroq qiling."
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>AI Yordamchi</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU haqida har qanday savolingizga javob beramiz</p>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg)', boxShadow: '0 4px 24px rgba(124,58,237,0.08)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🤖</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>KIU AI Yordamchi</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>Qarshi Xalqaro Universiteti • Claude AI</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                <span style={{ fontSize: 11, opacity: 0.85 }}>Onlayn</span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ height: 440, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-2, var(--bg))' }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                  {m.from === 'bot' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: '78%', padding: '10px 14px',
                    borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.from === 'user' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'var(--bg)',
                    color: m.from === 'user' ? '#fff' : 'var(--text)',
                    fontSize: 13, lineHeight: 1.7,
                    border: m.from === 'bot' ? '1px solid var(--border)' : 'none',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {m.text}
                  </div>
                  {m.from === 'user' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>👤</div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '16px 16px 16px 4px', border: '1px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', animation: `kiu-bounce 1.2s infinite ${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap', background: 'var(--bg)' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} disabled={loading}
                  style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)', color: '#7c3aed', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all .15s', opacity: loading ? 0.5 : 1 }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="KIU haqida savolingizni yozing..."
                disabled={loading}
                style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)' }}
              />
              <button onClick={() => send()} disabled={loading || !input.trim()}
                style={{ width: 44, height: 44, borderRadius: 10, background: input.trim() && !loading ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#e5e7eb', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: input.trim() && !loading ? '#fff' : '#9ca3af', flexShrink: 0, transition: 'all .15s' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
            🤖 Claude AI • Faqat KIU haqida ma'lumot beradi
          </p>
        </div>
      </section>

      <style>{`
        @keyframes kiu-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
