import {
  IcQuestion, IcSparkle, IcTarget, IcBolt, IcGrad,
  IcMedal1, IcMedal2, IcMedal3,
} from './Icons.jsx'
import { FacSvg } from './FacultyIcons.jsx'

// ── DATA ────────────────────────────────────────────────────
export const QUESTIONS = [
  {
    id: 1,
    q: "Bo'sh vaqtingizda nima qilishni yaxshi ko'rasiz?",
    icon: <IcQuestion />,
    opts: [
      { t: "Dasturlash yoki texnik loyihalar ustida ishlashni yaxshi ko'raman", s: { it: 3, moliya: 1 } },
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
  {
    id: 9,
    q: "Maktabda qaysi fan olimpiadasida qatnashgan bo'lardingiz?",
    icon: <IcSparkle />,
    opts: [
      { t: "Matematika yoki fizika — aniq fanlar meni qiziqtiradi",     s: { it: 2, buxgal: 2, moliya: 1 } },
      { t: "Biologiya yoki kimyo — tabiat va moddalar sirlarini sevaman", s: { neft: 3, boshlang: 1 } },
      { t: "Ona tili yoki adabiyot — so'z va ifoda kuchida",             s: { filolog: 3, maktab: 1 } },
      { t: "Tarix yoki huquqshunoslik — jamiyat va qonunlar qiziq",      s: { huquq: 3, psixo: 1 } },
    ]
  },
  {
    id: 10,
    q: "Do'stlaringiz muammoga duchor bo'lsa, sizdan nima so'rashadi?",
    icon: <IcQuestion />,
    opts: [
      { t: "Texnik yordam — kompyuter, dastur yoki internet masalalarida", s: { it: 3 } },
      { t: "Moliyaviy maslahat — pul, qarz yoki investitsiya haqida",     s: { moliya: 3, buxgal: 2 } },
      { t: "Gaplashish va ruhiy qo'llab-quvvatlash",                      s: { psixo: 3, filolog: 1 } },
      { t: "Qonuniy maslahat — huquq va hujjatlar bo'yicha",              s: { huquq: 3 } },
    ]
  },
  {
    id: 11,
    q: "Qaysi lavozim sizga eng jozibali?",
    icon: <IcTarget />,
    opts: [
      { t: "Dasturchi yoki IT menejeri — texnologiya kompaniyasida",  s: { it: 3 } },
      { t: "Bog'cha yoki boshlang'ich maktab o'qituvchisi",           s: { maktab: 3, boshlang: 3 } },
      { t: "Moliyaviy tahlilchi yoki auditor — bank yoki kompaniyada", s: { moliya: 3, buxgal: 3 } },
      { t: "Advokat yoki yurist — huquq va adolat himoyachisi",        s: { huquq: 3 } },
    ]
  },
  {
    id: 12,
    q: "Erkin vaqtingizda qaysi video yoki kontent ko'rishni yaxshi ko'rasiz?",
    icon: <IcBolt />,
    opts: [
      { t: "Texnologiya, dasturlash va sun'iy intellekt haqida",   s: { it: 3 } },
      { t: "Bolalar bilan qiziqarli tajribalar va ta'lim videolari", s: { maktab: 3, boshlang: 2 } },
      { t: "Inson psixologiyasi, munosabatlar va motivatsiya",      s: { psixo: 3, filolog: 1 } },
      { t: "Neft, geologiya, sanoat va energetika haqida",          s: { neft: 3 } },
    ]
  },
  {
    id: 13,
    q: "Qaysi ko'nikma sizda eng kuchli deb o'ylaysiz?",
    icon: <IcSparkle />,
    opts: [
      { t: "Mantiqiy fikrlash va muammolarni tizimli yechish",      s: { it: 3, buxgal: 1 } },
      { t: "Til va muloqot — odamlar bilan oson til topaman",       s: { filolog: 3, psixo: 2, maktab: 1 } },
      { t: "Raqamlar va hisoblar — moliyaviy hisob-kitob oson",     s: { buxgal: 3, moliya: 3 } },
      { t: "Empatiya — odamlarni tushunish va yordam berish",       s: { psixo: 3, maktab: 2, boshlang: 2 } },
    ]
  },
  {
    id: 14,
    q: "Qaysi jumla sizning hayot falsafangizga eng mos keladi?",
    icon: <IcTarget />,
    opts: [
      { t: "\"Har bir bola — kelajak, ularni to'g'ri tarbiyalash zarur\"", s: { maktab: 3, boshlang: 3 } },
      { t: "\"Texnologiya dunyoni o'zgartiradi — men ham shu jarayonda\"",  s: { it: 3, moliya: 1 } },
      { t: "\"Qonun hammaga teng — adolat uchun kurashish kerak\"",         s: { huquq: 3 } },
      { t: "\"Pul — vosita, uni to'g'ri boshqarish san'at\"",               s: { moliya: 3, buxgal: 2 } },
    ]
  },
]

export const FACULTIES = {
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

export const MEDALS = [<IcMedal1 />, <IcMedal2 />, <IcMedal3 />]
export const RANKS  = ['Birinchi tavsiya', 'Ikkinchi tavsiya', 'Uchinchi tavsiya']
