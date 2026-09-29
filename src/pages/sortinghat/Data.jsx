import {
  IcQuestion, IcSparkle, IcTarget, IcBolt, IcGrad,
  IcMedal1, IcMedal2, IcMedal3,
} from './Icons.jsx'
import { FacSvg } from './FacultyIcons.jsx'

// ── DATA ────────────────────────────────────────────────────
// Bu yerda faqat tilga bog'liq bo'lmagan qism: id, ball (s), ikonka, rang.
// Savol/variant/yo'nalish MATNLARI locales/*.json ichida:
//   sortingHat.questions.<id>.q / .opts.<a|b|c|d>
//   sortingHat.faculties.<kalit>.{name,desc,career,subjects}
// FACULTIES[k].name esa backend'ga yuboriladigan O'ZBEKCHA qiymat (admin panel
// statistikasi shunga tayanadi) — ko'rsatiladigan nom tarjimadan olinadi.
export const QUESTIONS = [
  {
    id: 1,
    icon: <IcQuestion />,
    opts: [
      { id: 'a', s: { it: 3, moliya: 1 } },
      { id: 'b', s: { maktab: 3, boshlang: 3 } },
      { id: 'c', s: { filolog: 3, psixo: 1 } },
      { id: 'd', s: { moliya: 3, buxgal: 3 } },
    ]
  },
  {
    id: 2,
    icon: <IcSparkle />,
    opts: [
      { id: 'a', s: { it: 2, neft: 2, moliya: 1 } },
      { id: 'b', s: { psixo: 3, huquq: 1 } },
      { id: 'c', s: { filolog: 3, maktab: 1 } },
      { id: 'd', s: { neft: 3, boshlang: 1 } },
    ]
  },
  {
    id: 3,
    icon: <IcTarget />,
    opts: [
      { id: 'a', s: { it: 3, buxgal: 2, neft: 1 } },
      { id: 'b', s: { psixo: 2, maktab: 2, filolog: 1 } },
      { id: 'c', s: { filolog: 2, psixo: 2, it: 1 } },
      { id: 'd', s: { huquq: 3, buxgal: 2 } },
    ]
  },
  {
    id: 4,
    icon: <IcBolt />,
    opts: [
      { id: 'a', s: { it: 3 } },
      { id: 'b', s: { maktab: 3, boshlang: 3 } },
      { id: 'c', s: { moliya: 3, buxgal: 2 } },
      { id: 'd', s: { psixo: 3 } },
    ]
  },
  {
    id: 5,
    icon: <IcGrad s={24} />,
    opts: [
      { id: 'a', s: { huquq: 2, moliya: 2, it: 1 } },
      { id: 'b', s: { it: 2, buxgal: 2, neft: 2 } },
      { id: 'c', s: { psixo: 2, filolog: 2, maktab: 1 } },
      { id: 'd', s: { filolog: 2, psixo: 1, maktab: 1 } },
    ]
  },
  {
    id: 6,
    icon: <IcTarget />,
    opts: [
      { id: 'a', s: { it: 2, buxgal: 2, moliya: 1 } },
      { id: 'b', s: { maktab: 3, boshlang: 3 } },
      { id: 'c', s: { psixo: 2, filolog: 2, huquq: 1 } },
      { id: 'd', s: { neft: 3 } },
    ]
  },
  {
    id: 7,
    icon: <IcSparkle />,
    opts: [
      { id: 'a', s: { it: 3, moliya: 1 } },
      { id: 'b', s: { maktab: 3, boshlang: 3 } },
      { id: 'c', s: { huquq: 3 } },
      { id: 'd', s: { moliya: 3, buxgal: 1 } },
    ]
  },
  {
    id: 8,
    icon: <IcBolt />,
    opts: [
      { id: 'a', s: { filolog: 3, maktab: 1 } },
      { id: 'b', s: { it: 1, moliya: 1, neft: 1 } },
      { id: 'c', s: { psixo: 1, huquq: 1, buxgal: 1 } },
      { id: 'd', s: { it: 1, neft: 2 } },
    ]
  },
  {
    id: 9,
    icon: <IcSparkle />,
    opts: [
      { id: 'a', s: { it: 2, buxgal: 2, moliya: 1 } },
      { id: 'b', s: { neft: 3, boshlang: 1 } },
      { id: 'c', s: { filolog: 3, maktab: 1 } },
      { id: 'd', s: { huquq: 3, psixo: 1 } },
    ]
  },
  {
    id: 10,
    icon: <IcQuestion />,
    opts: [
      { id: 'a', s: { it: 3 } },
      { id: 'b', s: { moliya: 3, buxgal: 2 } },
      { id: 'c', s: { psixo: 3, filolog: 1 } },
      { id: 'd', s: { huquq: 3 } },
    ]
  },
  {
    id: 11,
    icon: <IcTarget />,
    opts: [
      { id: 'a', s: { it: 3 } },
      { id: 'b', s: { maktab: 3, boshlang: 3 } },
      { id: 'c', s: { moliya: 3, buxgal: 3 } },
      { id: 'd', s: { huquq: 3 } },
    ]
  },
  {
    id: 12,
    icon: <IcBolt />,
    opts: [
      { id: 'a', s: { it: 3 } },
      { id: 'b', s: { maktab: 3, boshlang: 2 } },
      { id: 'c', s: { psixo: 3, filolog: 1 } },
      { id: 'd', s: { neft: 3 } },
    ]
  },
  {
    id: 13,
    icon: <IcSparkle />,
    opts: [
      { id: 'a', s: { it: 3, buxgal: 1 } },
      { id: 'b', s: { filolog: 3, psixo: 2, maktab: 1 } },
      { id: 'c', s: { buxgal: 3, moliya: 3 } },
      { id: 'd', s: { psixo: 3, maktab: 2, boshlang: 2 } },
    ]
  },
  {
    id: 14,
    icon: <IcTarget />,
    opts: [
      { id: 'a', s: { maktab: 3, boshlang: 3 } },
      { id: 'b', s: { it: 3, moliya: 1 } },
      { id: 'c', s: { huquq: 3 } },
      { id: 'd', s: { moliya: 3, buxgal: 2 } },
    ]
  },
]

export const FACULTIES = {
  it: {
    name: "Dasturiy injiniring",
    icon: FacSvg.it,
    color: "#7c3aed",
    grad: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  },
  maktab: {
    name: "Maktabgacha ta'lim",
    icon: FacSvg.maktab,
    color: "#f59e0b",
    grad: "linear-gradient(135deg,#f59e0b,#d97706)",
  },
  boshlang: {
    name: "Boshlang'ich ta'lim",
    icon: FacSvg.boshlang,
    color: "#10b981",
    grad: "linear-gradient(135deg,#10b981,#059669)",
  },
  psixo: {
    name: "Psixologiya",
    icon: FacSvg.psixo,
    color: "#8b5cf6",
    grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  },
  filolog: {
    name: "Filologiya va tillarni o'qitish",
    icon: FacSvg.filolog,
    color: "#0088cc",
    grad: "linear-gradient(135deg,#0088cc,#0055aa)",
  },
  neft: {
    name: "Neft va gaz ishi",
    icon: FacSvg.neft,
    color: "#dc2626",
    grad: "linear-gradient(135deg,#dc2626,#b91c1c)",
  },
  moliya: {
    name: "Moliya va moliyaviy texnologiyalar",
    icon: FacSvg.moliya,
    color: "#059669",
    grad: "linear-gradient(135deg,#059669,#047857)",
  },
  buxgal: {
    name: "Buxgalteriya hisobi",
    icon: FacSvg.buxgal,
    color: "#2563eb",
    grad: "linear-gradient(135deg,#2563eb,#1d4ed8)",
  },
  huquq: {
    name: "Milliy g'oya va huquq ta'limi",
    icon: FacSvg.huquq,
    color: "#6d28d9",
    grad: "linear-gradient(135deg,#6d28d9,#4c1d95)",
  },
}

export const MEDALS = [<IcMedal1 />, <IcMedal2 />, <IcMedal3 />]
export const RANKS  = ['first', 'second', 'third'] // matn: sortingHat.result.ranks.<kalit>
