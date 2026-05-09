import { useState } from 'react'
import { NavLink } from 'react-router-dom'
 
// ── SVG ICONS ──────────────────────────────────────────────
const IcHat = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
    <ellipse cx="40" cy="66" rx="28" ry="8" fill="#4f46e5" opacity=".35"/>
    <ellipse cx="40" cy="60" rx="30" ry="9" fill="#7c3aed"/>
    <path d="M40 8 L64 58 H16 Z" fill="#4f46e5"/>
    <path d="M40 8 L56 48 H24 Z" fill="#6d28d9"/>
    <rect x="11" y="57" width="58" height="8" rx="4" fill="#7c3aed"/>
    <path d="M35 36 Q40 30 45 36 Q40 33 35 36Z" fill="#C8960C" opacity=".9"/>
    <circle cx="40" cy="11" r="4" fill="#C8960C"/>
    <circle cx="40" cy="11" r="2" fill="#fff" opacity=".5"/>
  </svg>
)
 
const IcStar = ({ s = 14, c = '#C8960C' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
 
const IcQuestion = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
 
const IcBolt = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
 
const IcTarget = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
)
 
const IcSparkle = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L14 9L20 12L14 15L12 21L10 15L4 12L10 9Z"/>
    <path d="M5 3L5.8 5.2L8 6L5.8 6.8L5 9L4.2 6.8L2 6L4.2 5.2Z"/>
    <path d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2Z"/>
  </svg>
)
 
const IcCheck = ({ s = 14, c = 'currentColor' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
 
const IcArrow = ({ s = 13 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
 
const IcArrowRight = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)
 
const IcRefresh = ({ s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)
 
const IcPlay = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
 
const IcGrad = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
)
 
const IcFile = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)
 
const IcBulb = ({ s = 28 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"/>
    <line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
)
 
const IcMedal1 = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
)
const IcMedal2 = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
)
const IcMedal3 = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cd7f32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
)
 
// Faculty SVG icons
const FacSvg = {
  it: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  maktab: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  boshlang: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  psixo: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  filolog: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  neft: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  moliya: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  buxgal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  huquq: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
}
 
// ── DATA ────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    q: "Bo'sh vaqtingizda nima qilishni yaxshi ko'rasiz?",
    icon: <IcQuestion />,
    opts: [
      { t: "Kompyuterda kod yozaman yoki texnik loyihalar qilaman", s: { it: 3, moliya: 1 } },
      { t: "Bolalar bilan o'ynab, ularga nimadir o'rgataman",       s: { maktab: 3, boshlang: 3 } },
      { t: "Kitob o'qiyman, chet til o'rganaman",                   s: { filolog: 3, psixo: 1 } },
      { t: "Hisob-kitob qilaman, moliyaviy rejalar tuzaman",        s: { moliya: 3, buxgal: 3 } },
    ]
  },
  {
    id: 2,
    q: "Qaysi fan sizga eng qiziqarli?",
    icon: <IcSparkle />,
    opts: [
      { t: "Matematika va fizika — aniq javoblar yoqadi",     s: { it: 2, neft: 2, moliya: 1 } },
      { t: "Psixologiya va falsafa — inson tafakkuri qiziq",  s: { psixo: 3, huquq: 1 } },
      { t: "Adabiyot va tillar — so'z va ifoda kuchida",      s: { filolog: 3, maktab: 1 } },
      { t: "Kimyo va biologiya — tabiat sirlari",             s: { neft: 3, boshlang: 1 } },
    ]
  },
  {
    id: 3,
    q: "Muammo yuzaga kelganda qanday harakat qilasiz?",
    icon: <IcTarget />,
    opts: [
      { t: "Mantiqiy tahlil qilib, ketma-ket yechaman",            s: { it: 3, buxgal: 2, neft: 1 } },
      { t: "Odamlar bilan muloqot qilib, birgalikda hal qilaman",  s: { psixo: 2, maktab: 2, filolog: 1 } },
      { t: "Ijodiy yondashuv — noodatiy yechimlar qidiraman",      s: { filolog: 2, psixo: 2, it: 1 } },
      { t: "Qoidalar va qonunlarga asoslanib harakat qilaman",     s: { huquq: 3, buxgal: 2 } },
    ]
  },
  {
    id: 4,
    q: "Kelajakda qanday ish qilishni xohlaysiz?",
    icon: <IcBolt />,
    opts: [
      { t: "Dastur va ilovalar yaratib, texnologiya dunyosida",    s: { it: 3 } },
      { t: "Yosh avlodni tarbiyalab, ta'lim sohasida ishlashni",   s: { maktab: 3, boshlang: 3 } },
      { t: "Bank, moliya yoki biznesda pul boshqarishni",          s: { moliya: 3, buxgal: 2 } },
      { t: "Odamlarga psixologik yordam ko'rsatishni",             s: { psixo: 3 } },
    ]
  },
  {
    id: 5,
    q: "Jamoada qanday rol o'ynaysiz?",
    icon: <IcGrad s={24} />,
    opts: [
      { t: "Rahbar — qarorlar qabul qilaman, yo'naltiraman",             s: { huquq: 2, moliya: 2, it: 1 } },
      { t: "Tahlilchi — ma'lumotlarni o'rganib, tavsiya beraman",        s: { it: 2, buxgal: 2, neft: 2 } },
      { t: "Muloqotchi — muammolarni muzokaralar orqali hal qilaman",    s: { psixo: 2, filolog: 2, maktab: 1 } },
      { t: "Ijodkor — yangi g'oyalar taklif qilaman",                    s: { filolog: 2, psixo: 1, maktab: 1 } },
    ]
  },
  {
    id: 6,
    q: "Qaysi ish muhiti sizga ko'proq yoqadi?",
    icon: <IcTarget />,
    opts: [
      { t: "Ofis va kompyuter — sokin, analitik muhit",          s: { it: 2, buxgal: 2, moliya: 1 } },
      { t: "Sinfxona — bolalar va yoshlar bilan ishlash",        s: { maktab: 3, boshlang: 3 } },
      { t: "Ko'p odamlar — muloqot, seminar, treninglar",        s: { psixo: 2, filolog: 2, huquq: 1 } },
      { t: "Dala va amaliy joy — qurilma va texnika bilan",      s: { neft: 3 } },
    ]
  },
  {
    id: 7,
    q: "Quyidagilardan qaysi biri sizni ilhomlantiradi?",
    icon: <IcSparkle />,
    opts: [
      { t: "Yangi texnologiyalar va sun'iy intellekt",            s: { it: 3, moliya: 1 } },
      { t: "Yosh bolaning biror narsani tushunib yetishi",        s: { maktab: 3, boshlang: 3 } },
      { t: "Adolat o'rnatilishi va qonun himoyasi",               s: { huquq: 3 } },
      { t: "Moliyaviy mustaqillik va biznes muvaffaqiyati",       s: { moliya: 3, buxgal: 1 } },
    ]
  },
  {
    id: 8,
    q: "Chet tillarini o'rganishga munosabatingiz?",
    icon: <IcBolt />,
    opts: [
      { t: "Juda yaxshi ko'raman — tillar meni hayajonga soladi",  s: { filolog: 3, maktab: 1 } },
      { t: "Ish uchun kerak — ingliz tilini bilsam yetarli",       s: { it: 1, moliya: 1, neft: 1 } },
      { t: "O'rganaman, lekin asosiy ixtisosim muhimroq",          s: { psixo: 1, huquq: 1, buxgal: 1 } },
      { t: "Qiziqarli, lekin aniq fanlar menga yaqinroq",          s: { it: 1, neft: 2 } },
    ]
  },
]
 
const FACULTIES = {
  it: {
    name: "Dasturiy injiniring",
    icon: FacSvg.it,
    color: "#7c3aed",
    grad: "linear-gradient(135deg,#7c3aed,#4f46e5)",
    desc: "Mantiqiy tafakkur, texnologiyalarga qiziqish va muammolarni algoritmik yechish — IT sohasida katta kelajak siz uchun!",
    career: ["Dasturchi (Frontend/Backend)", "Mobile Developer", "Data Scientist", "DevOps Engineer"],
    subjects: ["Algoritmlar va ma'lumotlar tuzilmasi", "Web dasturlash", "Ma'lumotlar bazasi", "Sun'iy intellekt"],
  },
  maktab: {
    name: "Maktabgacha ta'lim",
    icon: FacSvg.maktab,
    color: "#f59e0b",
    grad: "linear-gradient(135deg,#f59e0b,#d97706)",
    desc: "Bolalarga bo'lgan mehrli munosabat, sabr-toqat va ijodkorlik — yosh avlodning birinchi murabbiysi bo'lasiz!",
    career: ["Maktabgacha ta'lim muallimi", "Bog'cha direktori", "Ta'lim metodisti", "Bolalar psixologi"],
    subjects: ["Bolalar psixologiyasi", "O'yin texnologiyalari", "Musiqa va san'at", "Pedagogika"],
  },
  boshlang: {
    name: "Boshlang'ich ta'lim",
    icon: FacSvg.boshlang,
    color: "#10b981",
    grad: "linear-gradient(135deg,#10b981,#059669)",
    desc: "Bolalarga bilim berishga intilasiz, sabr-toqatli va mehribonsiz. Boshlang'ich sinf o'qituvchisi kelajakni quradi!",
    career: ["Boshlang'ich sinf o'qituvchisi", "Ta'lim metodisti", "Maktab direktori", "Tarbiyachi"],
    subjects: ["Pedagogika", "Ona tili va adabiyot", "Matematika metodikasi", "Bolalar psixologiyasi"],
  },
  psixo: {
    name: "Psixologiya",
    icon: FacSvg.psixo,
    color: "#8b5cf6",
    grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    desc: "Odamlarni tushunish, ichki dunyoni tahlil qilish — psixolog sifatida jamiyatga ulkan hissa qo'sha olasiz!",
    career: ["Klinik psixolog", "HR menejeri", "Oilaviy maslahatchi", "Ta'lim psixologi"],
    subjects: ["Umumiy psixologiya", "Ijtimoiy psixologiya", "Psixodiagnostika", "Psixoterapiya"],
  },
  filolog: {
    name: "Filologiya va tillarni o'qitish",
    icon: FacSvg.filolog,
    color: "#0088cc",
    grad: "linear-gradient(135deg,#0088cc,#0055aa)",
    desc: "Tillar va adabiyotga bo'lgan sevgi, so'z bilan ishlash qobiliyati — ajoyib tilshunos yoki tarjimon bo'lasiz!",
    career: ["Ingliz tili o'qituvchisi", "Tarjimon", "Jurnalist", "Diplomat"],
    subjects: ["Ingliz tili adabiyoti", "Tilshunoslik nazariyasi", "Tarjima nazariyasi", "Chet tili o'qitish metodikasi"],
  },
  neft: {
    name: "Neft va gaz ishi",
    icon: FacSvg.neft,
    color: "#dc2626",
    grad: "linear-gradient(135deg,#dc2626,#b91c1c)",
    desc: "Texnik fanlarni yaxshi ko'rasiz, amaliy ishlarga qiziqasiz. Neft-gaz sanoati — Qashqadaryoning tayanchi!",
    career: ["Neft-gaz muhandisi", "Gidrogeolog", "Texnologik jarayon mutaxassisi", "Energetika menejeri"],
    subjects: ["Neft va gaz geologiyasi", "Qazib olish texnologiyasi", "Kimyoviy texnologiya", "Ekologiya"],
  },
  moliya: {
    name: "Moliya va moliyaviy texnologiyalar",
    icon: FacSvg.moliya,
    color: "#059669",
    grad: "linear-gradient(135deg,#059669,#047857)",
    desc: "Hisob-kitob, moliyaviy tahlil va biznes qiziqtiradi. FinTech — kelajakdagi eng istiqbolli soha!",
    career: ["Moliya tahlilchisi", "Bank mutaxassisi", "Investitsiya maslahatchi", "FinTech startap asoschisi"],
    subjects: ["Moliya nazariyasi", "Korporativ moliya", "Raqamli moliya", "Qimmatli qog'ozlar bozori"],
  },
  buxgal: {
    name: "Buxgalteriya hisobi",
    icon: FacSvg.buxgal,
    color: "#2563eb",
    grad: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    desc: "Aniqlik, qoidalarga rioya va raqamlar bilan ishlash sizning kuchli tomoningiz. Har bir tashkilot tajribali buxgalterni kutadi!",
    career: ["Buxgalter", "Auditor", "Soliq maslahatchi", "Moliyaviy nazoratchi"],
    subjects: ["Buxgalteriya hisobi", "Moliyaviy audit", "Soliq huquqi", "Xalqaro moliyaviy hisobot"],
  },
  huquq: {
    name: "Milliy g'oya va huquq ta'limi",
    icon: FacSvg.huquq,
    color: "#6d28d9",
    grad: "linear-gradient(135deg,#6d28d9,#4c1d95)",
    desc: "Adolat va qonunga hurmat asosiy qadriyatingiz. Fuqarolar huquqini himoya qiladigan mutaxassis bo'lasiz!",
    career: ["Huquqshunoslik o'qituvchisi", "Yurist-maslahatchi", "Davlat xizmatchisi", "Notarius"],
    subjects: ["Konstitutsiyaviy huquq", "Fuqarolik huquqi", "Milliy g'oya va ma'naviyat", "Xalqaro huquq"],
  },
}
 
const MEDALS = [<IcMedal1 />, <IcMedal2 />, <IcMedal3 />]
const RANKS  = ['Birinchi tavsiya', 'Ikkinchi tavsiya', 'Uchinchi tavsiya']
 
// ── COMPONENT ───────────────────────────────────────────────
export default function SortingHat() {
  const [stage, setStage]     = useState('intro')
  const [current, setCurrent] = useState(0)
  const [scores, setScores]   = useState({})
  const [result, setResult]   = useState(null)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy]       = useState(false)
 
  function startQuiz() {
    setStage('quiz'); setCurrent(0)
    setScores({}); setResult(null); setSelected(null)
  }
 
  function pick(opt) {
    if (busy) return
    setSelected(opt); setBusy(true)
    setTimeout(() => {
      const ns = { ...scores }
      Object.entries(opt.s).forEach(([k, v]) => { ns[k] = (ns[k] || 0) + v })
      setScores(ns)
      if (current + 1 >= QUESTIONS.length) {
        const top3 = Object.entries(ns).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k)
        setResult(top3); setStage('result')
      } else {
        setCurrent(current + 1); setSelected(null)
      }
      setBusy(false)
    }, 480)
  }
 
  const pct = (current / QUESTIONS.length) * 100
 
  return (
    <div className="fade-up">
      {/* ── HERO ── */}
      <section style={{ padding: '3rem 2rem 2.5rem', background: 'linear-gradient(135deg,#1a1a2e 0%,#2d1b69 50%,#1a1a2e 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* bg stars */}
        {[...Array(7)].map((_, i) => (
          <span key={i} style={{ position: 'absolute', opacity: .18, left: `${8 + i * 13}%`, top: `${15 + Math.sin(i) * 50}%` }}>
            <IcStar s={12 + i * 2} c="#C8960C" />
          </span>
        ))}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}><IcHat /></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C8960C', background: 'rgba(200,150,12,.15)', padding: '5px 16px', borderRadius: 20, marginBottom: '0.9rem', border: '1px solid rgba(200,150,12,.3)' }}>
            <IcStar s={11} /> KIU Sehrli Shlyapasi <IcStar s={11} />
          </div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.6rem', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            Qaysi yo'nalish siz uchun?
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Bir necha savolga javob bering — tizim qiziqishlaringizni tahlil qilib, eng mos yo'nalishni tavsiya qiladi!
          </p>
        </div>
      </section>
 
      <section className="section">
        <div className="container" style={{ maxWidth: 680 }}>
 
          {/* ══ INTRO ══ */}
          {stage === 'intro' && (
            <div>
              {/* info cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 12, marginBottom: '1.75rem' }}>
                {[
                  { icon: <IcQuestion />,   title: `${QUESTIONS.length} ta savol`, desc: 'Oddiy va qiziqarli' },
                  { icon: <IcBolt />,        title: '3 daqiqa',        desc: 'Tez va aniq'       },
                  { icon: <IcTarget />,      title: 'Top 3 tavsiya',   desc: "Mos yo'nalishlar"  },
                  { icon: <IcSparkle />,     title: 'Shaxsiy tahlil',  desc: 'Faqat siz uchun'   },
                ].map((c, i) => (
                  <div key={i} className="card" style={{ padding: '1.15rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{c.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.desc}</div>
                  </div>
                ))}
              </div>
 
              {/* how it works */}
              <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(124,58,237,.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <IcBulb s={20} />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>Qanday ishlaydi?</h3>
                </div>
                {[
                  { n: '1', t: 'Savolga javob bering',  d: "Har bir savolda o'zingizga eng mos variantni tanlang" },
                  { n: '2', t: 'Tizim tahlil qiladi',   d: 'Javoblaringiz asosida kuchli tomonlaringiz aniqlanadi' },
                  { n: '3', t: 'Tavsiya olasiz',         d: "Top 3 ta mos yo'nalish va karyera imkoniyatlari ko'rsatiladi" },
                  { n: '4', t: "Qaror o'z qo'lingizda",  d: "Shlyapa maslahat beradi — yakuniy tanlov siz bilan!" },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 3 ? '0.7rem' : 0 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.t}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
 
              <div style={{ textAlign: 'center' }}>
                <button onClick={startQuiz}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 36px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 20px rgba(124,58,237,.4)', transition: 'transform .2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                  <IcPlay s={18} /> Testni boshlash
                </button>
              </div>
            </div>
          )}
 
          {/* ══ QUIZ ══ */}
          {stage === 'quiz' && (
            <div>
              {/* progress */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IcQuestion />
                    <span style={{ marginLeft: 2 }}>Savol {current + 1} / {QUESTIONS.length}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: '#7c3aed' }}>{Math.round(pct)}%</span>
                </div>
                <div style={{ height: 7, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', borderRadius: 10, transition: 'width .4s ease' }} />
                </div>
                {/* step dots */}
                <div style={{ display: 'flex', gap: 5, marginTop: 8, justifyContent: 'center' }}>
                  {QUESTIONS.map((_, i) => (
                    <div key={i} style={{ width: i === current ? 18 : 7, height: 7, borderRadius: 10, background: i < current ? '#7c3aed' : i === current ? 'linear-gradient(90deg,#7c3aed,#4f46e5)' : 'var(--border)', transition: 'all .3s' }} />
                  ))}
                </div>
              </div>
 
              {/* question */}
              <div className="card" style={{ marginBottom: '1.15rem', textAlign: 'center', padding: '1.75rem', borderColor: 'rgba(124,58,237,.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  {QUESTIONS[current].icon}
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.55, fontFamily: 'var(--font-body)' }}>
                  {QUESTIONS[current].q}
                </h2>
              </div>
 
              {/* options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {QUESTIONS[current].opts.map((opt, i) => {
                  const isSel = selected === opt
                  return (
                    <button key={i} onClick={() => pick(opt)} disabled={busy}
                      style={{
                        width: '100%', padding: '0.9rem 1.1rem', textAlign: 'left',
                        cursor: busy ? 'default' : 'pointer',
                        background: isSel ? 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(79,70,229,.12))' : 'var(--bg)',
                        border: `2px solid ${isSel ? '#7c3aed' : 'var(--border)'}`,
                        borderRadius: 12, fontSize: 13.5, color: 'var(--text)',
                        fontFamily: 'var(--font-body)', transition: 'all .18s',
                        display: 'flex', alignItems: 'center', gap: 12,
                        transform: isSel ? 'scale(1.01)' : 'scale(1)',
                      }}
                      onMouseEnter={e => { if (!isSel && !busy) { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = 'rgba(124,58,237,.05)' }}}
                      onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)' }}}>
                      {/* letter/check */}
                      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s', background: isSel ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'var(--bg-2)', border: `2px solid ${isSel ? '#7c3aed' : 'var(--border)'}`, color: isSel ? '#fff' : 'var(--muted)', fontSize: 12, fontWeight: 700 }}>
                        {isSel ? <IcCheck s={13} c="#fff" /> : ['A','B','C','D'][i]}
                      </div>
                      <span style={{ lineHeight: 1.5 }}>{opt.t}</span>
                      {isSel && <span style={{ marginLeft: 'auto', flexShrink: 0, color: '#7c3aed' }}><IcArrow /></span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
 
          {/* ══ RESULT ══ */}
          {stage === 'result' && result && (
            <div>
              {/* result header */}
              <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1.75rem', background: 'linear-gradient(135deg,rgba(124,58,237,.08),rgba(79,70,229,.08))', borderColor: 'rgba(124,58,237,.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '0.75rem' }}>
                  <IcStar s={20} />
                  <IcHat />
                  <IcStar s={20} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem', fontFamily: 'var(--font-body)' }}>
                  Tahlil tayyor!
                </h2>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Javoblaringiz asosida sizga eng mos yo'nalishlar aniqlandi
                </p>
              </div>
 
              {/* faculty cards */}
              {result.map((key, idx) => {
                const fac = FACULTIES[key]
                if (!fac) return null
                return (
                  <div key={key} className="card reveal" style={{ marginBottom: '1.1rem', overflow: 'hidden', borderColor: fac.color + '50', position: 'relative' }}>
                    {/* top stripe */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: fac.grad }} />
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingTop: 6 }}>
                      {/* icon */}
                      <div style={{ width: 50, height: 50, borderRadius: 13, background: fac.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: `0 4px 14px ${fac.color}40` }}>
                        {fac.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        {/* rank badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: fac.color }}>
                            {MEDALS[idx]} {RANKS[idx]}
                          </span>
                          {idx === 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, background: fac.color + '18', color: fac.color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                              <IcStar s={9} c={fac.color} /> Eng mos
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{fac.name}</h3>
                        <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.65, marginBottom: '0.75rem' }}>{fac.desc}</p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 150 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: fac.color, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <IcGrad s={12} /> Karyera yo'llari
                            </div>
                            {fac.career.map((c, i) => (
                              <div key={i} style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                <IcArrow s={11} /> {c}
                              </div>
                            ))}
                          </div>
                          <div style={{ flex: 1, minWidth: 150 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: fac.color, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <IcFile s={12} /> Asosiy fanlar
                            </div>
                            {fac.subjects.map((s, i) => (
                              <div key={i} style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                <IcArrow s={11} /> {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
 
              {/* bottom CTA */}
              <div className="card" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.06),rgba(79,70,229,.06))', borderColor: 'rgba(124,58,237,.2)', textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><IcBulb s={26} /></div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
                  Shlyapa <strong style={{ color: '#7c3aed' }}>maslahat berdi</strong> — ammo yakuniy qaror siz bilan! Qo'shimcha ma'lumot uchun fakultetlar sahifasini ko'ring yoki ariza topshiring.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <NavLink to="/faculty" style={{ textDecoration: 'none' }}>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      <IcGrad s={15} /> Yo'nalishlarni ko'rish
                    </button>
                  </NavLink>
                  <NavLink to="/admission" style={{ textDecoration: 'none' }}>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'none', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      <IcFile s={15} /> Ariza topshirish
                    </button>
                  </NavLink>
                  <button onClick={startQuiz}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'none', color: 'var(--muted)', border: '2px solid var(--border)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    <IcRefresh s={14} /> Qayta o'tish
                  </button>
                </div>
              </div>
            </div>
          )}
 
        </div>
      </section>
    </div>
  )
}