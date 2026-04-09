const config = {
  university: {
    name: 'Qarshi Xalqaro Universiteti',
    shortName: 'KIU',
    founded: '2022',
    website: 'kiu.uz',
    logo: '/logo.png',
  },

  stats: [
    { n: '6875', l: 'Talaba' },
    { n: '151',  l: "O'qituvchi" },
    { n: '10',   l: "Yo'nalish" },
    { n: '2022', l: 'Tashkil yili' },
  ],

  contact: {
    address1: "Qarshi sh., Bahodir Sherqulov ko'chasi, 7-uy (1-kampus)",
    address2: "Qarshi sh., Mustaqillik ko'chasi, 71-uy (2-kampus)",
    phone: '+998 55 500 99 44',
    email: 'info@kiu.uz',
    workHours: "Du–Shan: 09:00–20:00",
  },

  social: {
    telegram:  'https://t.me/kiu_uz',
    instagram: 'https://instagram.com/kiu_university_uz',
    youtube:   'https://youtube.com/@kiu_uz',
    facebook:  'https://facebook.com/kiuuzofficial',
    tiktok:    'https://www.tiktok.com/@kiu_uz',
    x:         'https://x.com/kiu_uz',
  
  },

  telegram: {
    username: '@kiu_uz',
    url: 'https://t.me/kiu_uz',
  },

  faculties: [
    { icon: '🎓', name: "Maktabgacha ta'lim",                         count: 1 },
    { icon: '📚', name: "Boshlang'ich ta'lim",                        count: 1 },
    { icon: '🏛️', name: "Milliy g'oya, ma'naviyat asoslari va huquqta'limi", count: 1 },
    { icon: '⛽', name: "Neft va gaz ishi",                           count: 1 },
    { icon: '💼', name: "Iqtisodiyot",                                count: 1 },
    { icon: '💻', name: "Dasturiy injiniring",                        count: 1 },
    { icon: '💰', name: "Moliya va moliyaviy texnologiyalar",          count: 1 },
    { icon: '📊', name: "Buxgalteriya hisobi",                        count: 1 },
    { icon: '🧠', name: "Psixologiya",                                count: 1 },
    { icon: '🌍', name: "Filologiya va tillarni o'qitish",            count: 1 },
  ],

  admission: {
    year: '2026',
    deadline: "1 iyul — 20 avgust 2026 gacha",
    applyUrl: '#apply',
  },

  search: [
    { title: "Maktabgacha ta'lim", url: '/faculty' },
    { title: "Boshlang'ich ta'lim", url: '/faculty' },
    { title: "Dasturiy injiniring", url: '/faculty' },
    { title: "Iqtisodiyot", url: '/faculty' },
    { title: "Psixologiya", url: '/faculty' },
    { title: "Filologiya va tillarni o'qitish", url: '/faculty' },
    { title: "Neft va gaz ishi", url: '/faculty' },
    { title: "Buxgalteriya hisobi", url: '/faculty' },
    { title: "Moliya va moliyaviy texnologiyalar", url: '/faculty' },
    { title: "Qabul", url: '/admission' },
    { title: "Hujjatlar", url: '/admission' },
    { title: "Ariza topshirish", url: '/admission' },
    { title: "Bog'lanish", url: '/contact' },
    { title: "Telefon", url: '/contact' },
    { title: "Manzil", url: '/contact' },
    { title: "Yangiliklar", url: '/news' },
    { title: "Fakultetlar", url: '/faculty' },
    { title: "FAQ", url: '/faq' },
    { title: "Tadbirlar", url: '/events' },
    { title: "Yutuqlar", url: '/achievements' },
    { title: "Sharhlar", url: '/testimonials' },
    { title: "QR kod", url: '/qrcode' },
  ],
}

export default config