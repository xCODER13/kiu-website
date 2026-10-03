import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uz from './locales/uz.json'
import { DEFAULT_LANG, LANGS } from './locale'

// Faqat standart til (uz) kirish faylida: u fallback ham (EN/RU'da kaliti yo'q matn o'zbekcha ko'rinadi).
// en/ru alohida chunk — kerak bo'lganda yuklanadi (`loadLocale`). Avval uchala til (≈ 147 kB, gzip ≈ 48 kB)
// har bir tashrifchiga birdan yuklanardi. Birinchi render tarjimadan oldin boshlanmaydi (main.jsx kutadi),
// til almashtirganda esa LocaleProvider tarjima kelguncha oldingi tilni ko'rsatadi — "uzbekcha miltillash" yo'q.
const resources = {
  uz: { translation: uz },
}

const loaders = {
  en: () => import('./locales/en.json'),
  ru: () => import('./locales/ru.json'),
}
const pending = {}

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG, // EN/RU'da kaliti hali tarjima qilinmagan matn o'zbekcha ko'rinadi (bo'sh emas)
  supportedLngs: LANGS,
  initAsync: false,
  interpolation: { escapeValue: false }, // React o'zi escape qiladi
  returnNull: false,
  react: { useSuspense: false, bindI18nStore: 'added' }, // lazy paket qo'shilganda (til o'zgarmasa ham) komponentlar qayta chiziladi
})

// URL tilini GLOBAL holat (i18n.changeLanguage) orqali emas, har til uchun alohida
// nusxa + <I18nextProvider> orqali beramiz: til URL'dan sinxron aniqlanadi, effekt
// ham, re-render'da o'zbekchadan inglizchaga "sakrash" ham bo'lmaydi.
// cloneInstance resurslarni ulashadi (nusxalamaydi).
export const instances = Object.fromEntries(
  LANGS.map(lng => [lng, i18n.cloneInstance({ lng })])
)

export function isLocaleLoaded(lng) {
  return i18n.hasResourceBundle(lng, 'translation')
}

// Til paketini yuklaydi (takroriy chaqiruv bitta so'rov). Xatoda keyingi urinish qayta so'raydi.
// cloneInstance resurslarni ulashadi — bir marta qo'shish barcha nusxalarga ta'sir qiladi.
export function loadLocale(lng) {
  if (isLocaleLoaded(lng) || !loaders[lng]) return Promise.resolve()
  pending[lng] ??= loaders[lng]()
    .then(m => { i18n.addResourceBundle(lng, 'translation', m.default ?? m, true, true) })
    .finally(() => { delete pending[lng] })
  return pending[lng]
}

export default i18n
