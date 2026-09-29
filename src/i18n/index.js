import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uz from './locales/uz.json'
import en from './locales/en.json'
import ru from './locales/ru.json'
import { DEFAULT_LANG, LANGS } from './locale'

// Barcha tillar to'g'ridan-to'g'ri bundle'ga kiradi (sinxron init) — birinchi render'da
// tarjima tayyor bo'ladi, "til almashishi" miltillashi (flash) bo'lmaydi. Tillar soni
// ko'payib, JSON hajmi sezilarli bo'lib qolsa, faqat joriy tilni dynamic import qilish mumkin.
const resources = {
  uz: { translation: uz },
  en: { translation: en },
  ru: { translation: ru },
}

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG, // EN/RU'da kaliti hali tarjima qilinmagan matn o'zbekcha ko'rinadi (bo'sh emas)
  supportedLngs: LANGS,
  initAsync: false,
  interpolation: { escapeValue: false }, // React o'zi escape qiladi
  returnNull: false,
  react: { useSuspense: false },
})

// URL tilini GLOBAL holat (i18n.changeLanguage) orqali emas, har til uchun alohida
// nusxa + <I18nextProvider> orqali beramiz: til URL'dan sinxron aniqlanadi, effekt
// ham, re-render'da o'zbekchadan inglizchaga "sakrash" ham bo'lmaydi.
// cloneInstance resurslarni ulashadi (nusxalamaydi).
export const instances = Object.fromEntries(
  LANGS.map(lng => [lng, i18n.cloneInstance({ lng })])
)

export default i18n
