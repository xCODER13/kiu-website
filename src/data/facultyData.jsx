/* Faculty (Yo'nalishlar) uchun umumiy ma'lumotlar.
 * Faculty.jsx va Home.jsx (preview bo'lim) shu fayldan foydalanadi. */

export const IC = {
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

export const BAKALAVR = [
  {
    name: "Maktabgacha ta'lim",
    price: 12850000,
    duration: '4 yil',
    lang: "O'zbek / Rus",
    studyForm: 'Kunduzgi',
    icon: 'users',
    // ✅ TO'G'RI: 6-belgili hex rang
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
    // ✅ FIX 1: '#3abd31fa' → '#3abd31'
    // Muammo: 8-belgili hex (#RRGGBBAA) ishlatilgan edi.
    // ${f.color}25 => '#3abd31fa25' — bu noto'g'ri CSS, border ko'rinmagan.
    color: '#3abd31',
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
    color: '#e3dd2c',
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
