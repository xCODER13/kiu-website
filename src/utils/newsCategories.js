// Yangiliklar kategoriyalari uchun yagona rang/label/normalizatsiya manbai.
//
// Muammo: ma'lumotlar bazasida bitta kategoriya turlicha holatda saqlangan —
// masalan "Umumiy" VA "umumiy", "Ta'lim" VA "ta'lim" bir vaqtda uchraydi
// (admin panel keyinchalik bosh harfli qiymatlarga o'tgan, eski yozuvlar esa
// kichik harfli qolib ketgan). News.jsx, Home.jsx va NewsDetail.jsx'da har
// birida alohida, bir-biriga mos kelmaydigan CAT_COLORS/CAT_LABELS xaritalari
// bo'lgani sababli bir xil yangilik turli sahifada turlicha rangda (binafsha
// standart rang / to'g'ri rang) va turlicha yozuvda (xom "umumiy" / "Umumiy")
// ko'rinar, hatto kategoriya filtri ba'zi maqolalarni noto'g'ri yashirar edi.
//
// Yechim: barcha qidiruv shu yerda, har doim kichik harfga normallashtirilgan
// holda amalga oshiriladi — front tomonda qaysi sahifa ekanidan qat'i nazar
// bir xil natija kafolatlanadi.

// `key` — i18n kaliti (categories.<key>): "ta'lim"dagi apostrof kalit sifatida noqulay.
// `token` — 4.4 palitrasi (6.11, qaror 22; tartib qotirilgan): CSS o'zgaruvchisi (`--chart-N`), `--cat` ga qo'yiladi.
// Hex ranglar (`color`, `DEFAULT_CATEGORY_COLOR`, `getCategoryColor`) 6.11c5 da olib tashlandi — Home ham `token` ishlatadi.
const CATEGORY_META = {
  umumiy: { key: 'umumiy', label: 'Umumiy', token: 'var(--chart-1)' },
  "ta'lim": { key: 'talim', label: "Ta'lim", token: 'var(--chart-2)' },
  sport: { key: 'sport', label: 'Sport', token: 'var(--chart-3)' },
  madaniyat: { key: 'madaniyat', label: 'Madaniyat', token: 'var(--chart-4)' },
  xalqaro: { key: 'xalqaro', label: 'Xalqaro', token: 'var(--chart-5)' },
  fan: { key: 'fan', label: 'Fan', token: 'var(--chart-6)' },
}

// Noma'lum (bazadagi erkin matn) kategoriya → brend rangi
export const DEFAULT_CATEGORY_TOKEN = 'var(--color-brand)'

export function normalizeCategory(category) {
  return category ? category.trim().toLowerCase() : ''
}

// CSS o'zgaruvchisi qiymati (`var(--chart-N)`) — `style={{ '--cat': … }}` uchun; hex emas, shuning uchun
// `${color}18` kabi hex+alfa birlashtirish YO'Q: chip/gradient fonlari CSS da `color-mix(… var(--cat) …)` bilan.
export function getCategoryToken(category) {
  return CATEGORY_META[normalizeCategory(category)]?.token || DEFAULT_CATEGORY_TOKEN
}

// `t` (ixtiyoriy) — i18next t funksiyasi: berilsa ma'lum kategoriya nomi joriy tilga
// tarjima qilinadi. Bermasa (eski chaqiruvlar, admin panel) o'zbekcha nom qaytadi.
// Noma'lum (bazadagi erkin) kategoriya har holda o'zi qaytadi.
export function getCategoryLabel(category, t) {
  const meta = CATEGORY_META[normalizeCategory(category)]
  if (!meta) return category
  return t ? t(`categories.${meta.key}`, { defaultValue: meta.label }) : meta.label
}

// Ikki xil holatdagi ("Umumiy" / "umumiy") bir xil kategoriya bitta ekanini
// aniqlash uchun — filtr bosilganda va faol chipni belgilashda ishlatiladi.
export function categoryMatches(itemCategory, activeKey) {
  return normalizeCategory(itemCategory) === activeKey
}

// Maqolalar ro'yxatidan takrorlanmas kategoriya kalitlarini chiqaradi.
// Turli holatdagi bir xil kategoriya bitta kalitga birlashtiriladi — aks
// holda filtr chiplarida "Umumiy" va "umumiy" uchun ikkita alohida,
// deyarli bir xil tugma paydo bo'lardi.
export function collectCategoryKeys(items) {
  const seen = new Set()
  for (const item of items) {
    const key = normalizeCategory(item.category)
    if (key) seen.add(key)
  }
  return [...seen]
}