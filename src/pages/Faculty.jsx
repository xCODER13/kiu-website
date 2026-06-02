 import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

/* ── Price formatter: 12850000 -> "12 850 000" ─────────────── */
const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/* ── SVG Icon functions: IC[name](size) ────────────────────── */
const IC = {
  /* --- faculty card icons --- */
  users: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  book: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  home: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  map: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  dollar: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  code: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  briefcase: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  file: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  hex: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  globe: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  /* --- ui icons --- */
  sun: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  clock: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  tag: (s = 30) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  info: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="8"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
    </svg>
  ),
  bookOpen: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  pen: (s = 15) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  phone: (s = 15) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.15a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  calendar: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  graduation: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  building: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="18" height="13"/>
      <path d="M8 22V12h8v10"/>
      <path d="M3 9L12 2l9 7"/>
    </svg>
  ),
  arrowRight: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  close: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

/* ── BAKALAVR data ─────────────────────────────────────────── */
const BAKALAVR = [
  {
    name: "Maktabgacha ta'lim",
    price: 12850000,
    duration: '4 yil',
    lang: "O'zbek / Rus",
    studyForm: 'Kunduzgi',
    icon: 'users',
    color: '#1c2cb9',
    desc: `Maktabgacha yoshdagi bolalar bilan ishlash bo'yicha yuqori malakali mutaxassislar tayyorlash. Bolalar psixologiyasi va pedagogikasi asosida professional kadrlar.`,
    subjects: ['Psixologiya', 'Pedagogika', 'Bolalar adabiyoti', 'Matematika asoslari', 'Musiqa', 'Jismoniy tarbiya'],
    career: ["Maktabgacha ta'lim muassasasi direktori", 'Tarbiyachi', 'Metodist', 'Psixolog', "Bolalar bog'chasi rahbari"],
  },
  {
    name: "Boshlang'ich ta'lim",
    price: 12850000,
    duration: '4 yil',
    lang: "O'zbek",
    studyForm: 'Kunduzgi',
    icon: 'book',
    color: '#3abd31fa',
    desc: "Boshlang'ich sinf o'quvchilariga ta'lim beruvchi malakali o'qituvchilar tayyorlash. Zamonaviy pedagogik usullar va innovatsion ta'lim texnologiyalari.",
    subjects: ['Ona tili', 'Matematika', 'Tabiat', "Tasviriy san'at", 'Musiqa', 'Pedagogika asoslari'],
    career: ["Boshlang'ich sinf o'qituvchisi", 'Metodist', 'Maktab direktori', "Ta'lim menejeri"],
  },
  {
    name: "Milliy g'oya, ma'naviyat asoslari va huquqta'limi",
    price: 12850000,
    duration: '4 yil',
    lang: "O'zbek",
    studyForm: 'Kunduzgi',
    icon: 'home',
    color: '#d7690f',
    desc: "Milliy qadriyatlar, huquq va ma'naviyat sohasida bilimli, vatanparvar mutaxassislar tayyorlash. Huquqiy ong va fuqarolik tarbiyasiga yo'naltirilgan dastur.",
    subjects: ['Konstitutsiyaviy huquq', "Milliy g'oya", 'Falsafa', 'Tarix', 'Huquqshunoslik', "Ma'naviyat asoslari"],
    career: ["O'qituvchi", 'Davlat xizmati mutaxassisi', 'Huquqiy maslahatchi', "Ma'naviyat targ'ibotchisi"],
  },
  {
    name: 'Neft va gaz ishi',
    price: 12850000,
    duration: '4 yil',
    lang: "O'zbek / Ingliz",
    studyForm: 'Kunduzgi',
    icon: 'map',
    color: '#c8cf3a',
    desc: "Neft-gaz sanoati uchun yuqori malakali muhandis va texnologlar tayyorlash. Faoliyat turlari bo'yicha ixtisoslashish imkoniyati mavjud.",
    subjects: ['Neft kimyosi', 'Qazib olish texnologiyasi', 'Ekologiya', 'Iqtisodiyot', 'Muhandislik', 'Geologiya'],
    career: ['Neft-gaz muhandisi', 'Texnolog', 'Laborant', 'Loyiha menejeri', 'Ekolog-mutaxassis'],
    note: "Faoliyat turlari bo'yicha ixtisoslashish mavjud",
  },
  {
    name: 'Iqtisodiyot',
    price: 14900000,
    duration: '4 yil',
    lang: "O'zbek / Ingliz",
    studyForm: 'Kunduzgi',
    icon: 'dollar',
    color: '#059669',
    desc: "Zamonaviy bozor iqtisodiyoti sharoitida raqobatbardosh iqtisodchilar tayyorlash. Tarmoqlar va sohalar bo'yicha ixtisoslashish imkoniyati mavjud.",
    subjects: ['Makroiqtisodiyot', 'Mikroiqtisodiyot', 'Marketing', 'Menejment', 'Statistika', 'Raqamli iqtisodiyot'],
    career: ['Iqtisodchi', 'Moliyaviy tahlilchi', 'Bank xodimi', 'Tadbirkor', 'Davlat boshqaruvi mutaxassisi'],
    note: "Tarmoqlar va sohalar bo'yicha ixtisoslashish mavjud",
  },
  {
    name: 'Dasturiy injiniring',
    price: 12850000,
    duration: '4 yil',
    lang: "O'zbek / Ingliz",
    studyForm: 'Kunduzgi',
    icon: 'code',
    color: '#06bdc7',
    desc: "Zamonaviy dasturiy ta'minot ishlab chiqish sohasida yuqori malakali mutaxassislar tayyorlash. Sun'iy intellekt, veb va mobil dasturlash.",
    subjects: ['Python', 'JavaScript', "Ma'lumotlar bazasi", "Sun'iy intellekt", 'Mobil dasturlash', 'Kiberxavfsizlik'],
    career: ['Dasturchi', 'Web developer', 'Data scientist', 'DevOps', 'IT menejeri', 'Kiberxavfsizlik mutaxassisi'],
  },
  {
    name: 'Moliya va moliyaviy texnologiyalar',
    price: 14900000,
    duration: '4 yil',
    lang: "O'zbek / Ingliz",
    studyForm: 'Kunduzgi',
    icon: 'briefcase',
    color: '#793bac',
    desc: "FinTech va zamonaviy moliya sohasida innovatsion mutaxassislar tayyorlash. Blokcheyn, raqamli bankchilik va investitsiya texnologiyalari.",
    subjects: ['Moliya nazariyasi', 'Blokcheyn', 'FinTech', 'Risk menejment', 'Investitsiya', 'Kriptovalyuta'],
    career: ['Moliyaviy maslahatchi', 'FinTech mutaxassisi', 'Bank xodimi', 'Investitsiya menejeri', 'Risk-menejer'],
  },
  {
    name: 'Buxgalteriya hisobi',
    price: 14900000,
    duration: '4 yil',
    lang: "O'zbek",
    studyForm: 'Kunduzgi',
    icon: 'file',
    color: '#f33218',
    desc: "Moliyaviy hisobot, audit va soliq sohasida malakali buxgalterlar tayyorlash. IFRS xalqaro standartlari asosida o'qitish.",
    subjects: ['Buxgalteriya hisobi', 'Audit', 'Soliqlar', 'Moliyaviy tahlil', '1C dasturi', 'IFRS standartlari'],
    career: ['Buxgalter', 'Auditor', 'Moliyaviy direktor', 'Soliq maslahatchi', 'IFRS mutaxassisi'],
  },
  {
    name: 'Psixologiya',
    price: 12850000,
    duration: '4 yil',
    lang: "O'zbek",
    studyForm: 'Kunduzgi',
    icon: 'hex',
    color: '#db2777',
    desc: "Insonlar ruhiy salomatligi va ijtimoiy muammolarini hal qiluvchi psixologlar tayyorlash. Faoliyat turlari bo'yicha ixtisoslashish imkoniyati mavjud.",
    subjects: ['Umumiy psixologiya', 'Klinik psixologiya', 'Ijtimoiy psixologiya', 'Psixodiagnostika', 'Nevrologiya asoslari'],
    career: ['Psixolog', 'Psixoterapevt', 'HR mutaxassisi', 'Klinik psixolog', 'Ijtimoiy ishchi'],
    note: "Faoliyat turlari bo'yicha ixtisoslashish mavjud",
  },
  {
    name: "Filologiya va tillarni o'qitish",
    price: 12850000,
    duration: '4 yil',
    lang: "O'zbek / Ingliz / Rus",
    studyForm: 'Kunduzgi',
    icon: 'globe',
    color: '#29a6f8',
    desc: "Til va adabiyot sohasida bilimli, xalqaro miqyosda faoliyat yurita oladigan mutaxassislar tayyorlash. Uch yo'nalish: Ingliz, O'zbek va Rus tili.",
    subjects: ['Ingliz tili', 'Adabiyot', 'Tilshunoslik', 'Tarjima nazariyasi', 'Nutq madaniyati', "O'zbek tili"],
    career: ["O'qituvchi", 'Tarjimon', 'Muharrir', 'Diplomat', 'Jurnalist'],
    note: "Yo'nalishlar: Ingliz tili | O'zbek tili | Rus tili",
  },
]

/* ── MAGISTRATURA data ─────────────────────────────────────── */
const MAGISTRATURA = [
  {
    name: 'Lingvistika (Ingliz tili)',
    price: 18000000,
    duration: '2 yil',
    lang: "O'zbek / Ingliz",
    studyForm: 'Kunduzgi',
    icon: 'globe',
    color: '#2563eb',
    desc: "Ingliz tili lingvistikasi sohasida ilmiy-tadqiqot va pedagogik faoliyat olib boruvchi yuqori malakali mutaxassislar tayyorlash. Xalqaro ilmiy hamkorlik imkoniyatlari.",
    subjects: ['Ingliz tilshunoslik nazariyasi', 'Qiyosiy tilshunoslik', 'Ilmiy tadqiqot metodologiyasi', 'Tarjima nazariyasi', 'Lingvokulturologiya', 'Diskurs tahlili'],
    career: ["Oliy o'quv yurti o'qituvchisi", 'Ilmiy tadqiqotchi', 'Tarjimon', 'Lingvistika mutaxassisi', 'Xalqaro tashkilot mutaxassisi'],
  },
  {
    name: 'Lingvistika (Rus tili)',
    price: 18000000,
    duration: '2 yil',
    lang: "O'zbek / Rus",
    studyForm: 'Kunduzgi',
    icon: 'book',
    color: '#ae0895',
    desc: "Rus tili lingvistikasi sohasida ilmiy-tadqiqot va pedagogik faoliyatga tayyorlangan chuqur bilimli mutaxassislar yetishtirish. Kognitiv va qiyosiy tilshunoslik.",
    subjects: ['Rus tilshunoslik nazariyasi', 'Qiyosiy grammatika', 'Ilmiy tadqiqot metodologiyasi', 'Nutq madaniyati', 'Stilistika', 'Kognitiv tilshunoslik'],
    career: ["Oliy o'quv yurti o'qituvchisi", 'Tarjimon', 'Ilmiy tadqiqotchi', 'Muharrir', 'Diplomat'],
  },
  {
    name: 'Iqtisodiyot',
    price: 18000000,
    duration: '2 yil',
    lang: "O'zbek / Ingliz",
    studyForm: 'Kunduzgi',
    icon: 'dollar',
    color: '#416c2a',
    desc: "Iqtisodiy siyosat, tahlil va boshqaruv sohasida chuqur ilmiy bilimga ega mutaxassislar tayyorlash. Xalqaro iqtisodiyot va raqamli iqtisod ixtisoslashuvi.",
    subjects: ['Makroiqtisodiy tahlil', 'Tadqiqot metodologiyasi', 'Raqamli iqtisodiyot', 'Xalqaro iqtisodiyot', 'Iqtisodiy siyosat', 'Ekonometrika'],
    career: ['Iqtisodchi-tahlilchi', 'Davlat boshqaruv mutaxassisi', 'Konsultant', 'Ilmiy tadqiqotchi', 'Xalqaro tashkilotlar mutaxassisi'],
  },
]

/* ── Faculty Card ──────────────────────────────────────────── */
function FacultyCard({ f, index, onClick }) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className="card"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        padding: '1.25rem',
        animation: 'cardFadeIn .35s ease both',
        animationDelay: `${index * 0.05}s`,
        transition: 'transform .2s, box-shadow .2s, border-color .2s',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,.12)' : undefined,
        borderColor: hover ? f.color : undefined,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Faculty icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: `${f.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12, color: f.color, flexShrink: 0,
      }}>
        {IC[f.icon](22)}
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: 13, fontWeight: 600,
        color: 'var(--text)', marginBottom: 6, lineHeight: 1.4,
        fontFamily: 'var(--font-body)', flexGrow: 1,
      }}>
        {f.name}
      </h3>

      {/* Study form + duration */}
      <div style={{
        fontSize: 11, color: 'var(--muted)', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <span style={{ color: '#d97706', display: 'flex', alignItems: 'center' }}>{IC.sun(13)}</span>
        {f.studyForm}
        <span style={{ opacity: .4 }}>·</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--muted)' }}>
          {IC.clock(12)}{f.duration}
        </span>
      </div>

      {/* Price badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 20, marginBottom: 12,
        background: `${f.color}10`,
        border: `1px solid ${f.color}28`,
        alignSelf: 'flex-start',
      }}>
        <span style={{ color: f.color, display: 'flex', alignItems: 'center' }}>{IC.tag(11)}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: f.color }}>
          {fmt(f.price)} so'm/yil
        </span>
      </div>

      {/* Batafsil button */}
      <div style={{
        fontSize: 12, fontWeight: 600, color: f.color,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        Batafsil
        <span style={{ display: 'flex', alignItems: 'center' }}>{IC.arrowRight(13)}</span>
      </div>
    </div>
  )
}

/* ── Modal ─────────────────────────────────────────────────── */
function FacultyModal({ f, degree, onClose }) {
  useEffect(() => {
    const scrollW = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = scrollW + 'px'
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  /* info strip items */
  const infoItems = [
    { label: 'Davomiyligi',   value: f.duration,   iconFn: () => IC.clock(20)  },
    { label: "O'qitish tili", value: f.lang,        iconFn: () => IC.globe(20)  },
    { label: "O'qish shakli", value: f.studyForm,   iconFn: () => IC.sun(20)    },
  ]

  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,10,30,.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0.75rem 1rem',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: 18,
          padding: '1.4rem 1.5rem',
          maxWidth: 580,
          width: '100%',
          maxHeight: 'calc(100vh - 1.5rem)',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0,0,0,.35)',
          position: 'relative',
          border: `1px solid ${f.color}30`,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          title="Yopish (Esc)"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 34, height: 34, borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)',
            transition: 'background .15s',
          }}
        >
          {IC.close(16)}
        </button>

        {/* Degree badge */}
        <div style={{ marginBottom: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 600,
            padding: '4px 12px', borderRadius: 20,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: `${f.color}18`,
            color: f.color,
            border: `1px solid ${f.color}40`,
          }}>
            {degree === 'bakalavr' ? IC.graduation(13) : IC.building(13)}
            {degree === 'bakalavr' ? 'Bakalavr' : 'Magistratura'}
          </span>
        </div>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '1rem' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: `${f.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: f.color, flexShrink: 0,
          }}>
            {IC[f.icon](22)}
          </div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, paddingTop: 6 }}>
            {f.name}
          </h2>
        </div>

        {/* Info strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
          padding: '0.75rem', background: 'var(--card)',
          borderRadius: 12, marginBottom: '1rem',
          border: `1px solid ${f.color}25`,
        }}>
          {infoItems.map(({ label, value, iconFn }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                marginBottom: 6, color: f.color,
              }}>
                {iconFn()}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Price block */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0.75rem 1rem',
          background: `${f.color}0d`,
          borderRadius: 12, marginBottom: '1rem',
          border: `1px solid ${f.color}30`,
        }}>
          <div style={{ color: f.color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {IC.tag(28)}
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: f.color, marginBottom: 2, fontWeight: 500, opacity: 0.8 }}>
              Kontrakt narxi (kunduzgi, yillik)
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: f.color, letterSpacing: '-0.5px' }}>
              {fmt(f.price)} so'm
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1rem' }}>
          {f.desc}
        </p>

        {/* Note */}
        {f.note && (
          <div style={{
            padding: '8px 14px',
            background: `${f.color}08`,
            borderRadius: 10,
            fontSize: 12, color: f.color,
            marginBottom: '1rem',
            fontWeight: 500,
            display: 'flex', alignItems: 'flex-start', gap: 7,
          }}>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', marginTop: 1 }}>
              {IC.info(14)}
            </span>
            {f.note}
          </div>
        )}

        {/* Subjects + Career */}
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h4 style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text)',
              marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: f.color, display: 'flex', alignItems: 'center' }}>{IC.bookOpen(14)}</span>
              O'qitiladigan fanlar
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {f.subjects.map(s => (
                <span key={s} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 20,
                  background: `${f.color}0e`,
                  color: f.color,
                  border: `1px solid ${f.color}22`,
                  fontWeight: 500,
                }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text)',
              marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: f.color, display: 'flex', alignItems: 'center' }}>{IC.briefcase(14)}</span>
              Karyera imkoniyatlari
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {f.career.map(c => (
                <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: f.color, flexShrink: 0, marginTop: 4,
                  }} />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/admission"
            style={{
              flex: 1, minWidth: 160,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 10,
              background: `linear-gradient(135deg, ${f.color}, ${f.color}cc)`,
              color: '#fff', textDecoration: 'none',
              fontWeight: 700, fontSize: 12.5,
              boxShadow: `0 4px 16px ${f.color}55`,
            }}
          >
            {IC.pen(14)}
            Ariza topshirish
          </a>
          <a
            href="tel:+998555009944"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '11px 16px', borderRadius: 10,
              border: `1.5px solid ${f.color}40`,
              background: `${f.color}08`,
              color: f.color,
              textDecoration: 'none',
              fontWeight: 600, fontSize: 12.5,
              whiteSpace: 'nowrap',
            }}
          >
            {IC.phone(15)}
            +998 55 500 99 44
          </a>
        </div>

        {/* Deadline note */}
        <div style={{
          marginTop: '0.75rem', padding: '7px 12px',
          background: 'rgba(255,183,0,.1)', borderRadius: 10,
          border: '1px solid rgba(255,183,0,.3)',
          fontSize: 11, color: '#92400e', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{IC.calendar(14)}</span>
          Qabul muddati: 1 iyul — 20 avgust 2026
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

/* ── Main Page ─────────────────────────────────────────────── */

if (typeof document !== 'undefined' && !document.getElementById('faculty-styles')) {
  const s = document.createElement('style')
  s.id = 'faculty-styles'
  s.textContent = `
    @keyframes cardFadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
  `
  document.head.appendChild(s)
}

export default function Faculty() {
  const [tab, setTab] = useState('bakalavr')
  const [modal, setModal] = useState(null)

  const list = tab === 'bakalavr' ? BAKALAVR : MAGISTRATURA

  const tabMeta = {
    bakalavr:     { count: BAKALAVR.length,    duration: '4 yil', from: '12 850 000' },
    magistratura: { count: MAGISTRATURA.length, duration: '2 yil', from: '18 000 000' },
  }

  return (
    <div className="fade-up">
      {/* Hero */}
      <section style={{
        padding: '3rem 2rem 2rem',
        background: 'linear-gradient(135deg,#faf5ff 0%,#ede9fe 40%,#e0e7ff 100%)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text)', marginBottom: '.5rem' }}>Yo'nalishlar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: '1.75rem' }}>
          Xalqaro standartlarda yuqori sifatli ta'lim
        </p>

        {/* Tab switcher */}
        <div style={{
          display: 'inline-flex', gap: 6,
          background: 'var(--card)',
          padding: 5, borderRadius: 40,
          border: '2px solid var(--border)',
          boxShadow: '0 0 0 1px rgba(124,58,237,.25)',
        }}>
          {['bakalavr', 'magistratura'].map(t => {
            const active = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '9px 22px', borderRadius: 35,
                  border: active ? 'none' : '1px solid rgba(124,58,237,.35)',
                  cursor: 'pointer',
                  fontWeight: 700, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'all .2s',
                  background: active ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'transparent',
                  color: active ? '#fff' : 'var(--text)',
                  boxShadow: active ? '0 3px 10px rgba(124,58,237,.35)' : 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: active ? '#fff' : '#7c3aed' }}>
                  {t === 'bakalavr' ? IC.graduation(15) : IC.building(15)}
                </span>
                {t === 'bakalavr' ? 'Bakalavr' : 'Magistratura'}
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 7px', borderRadius: 20,
                  background: active ? 'rgba(255,255,255,.2)' : 'rgba(124,58,237,.15)',
                  color: active ? '#fff' : '#7c3aed',
                }}>
                  {tabMeta[t].count}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Stats bar */}
      <div style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '.9rem 2rem',
      }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'center',
          gap: '2.5rem', flexWrap: 'wrap',
        }}>
          {[
            { v: tabMeta[tab].count,           l: "Yo'nalish"    },
            { v: tabMeta[tab].duration,         l: 'Davomiyligi'  },
            { v: tabMeta[tab].from + " so'm",   l: 'Eng past narx' },
            { v: 'Kunduzgi',                    l: "O'qish shakli" },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{v}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <section className="section">
        <div className="container">
          <div className="grid-auto">
            {list.map((f, i) => (
              <FacultyCard
                key={tab + '-' + f.name}
                f={f}
                index={i}
                onClick={() => setModal({ ...f, degree: tab })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {modal && (
        <FacultyModal
          f={modal}
          degree={modal.degree}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}