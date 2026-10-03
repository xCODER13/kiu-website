import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { instances, isLocaleLoaded, loadLocale } from './index'
import { getLangFromPath } from './locale'

// Router ichida turadi: tilni URL prefiksidan (/en/...) aniqlaydi va shu tilga
// mos i18n nusxasini beradi. Til paketi yuklangan bo'lsa — prefiks o'zgarganda (masalan
// almashtirgich bosilganda) bitta render'da hamma matn almashadi. Yuklanmagan bo'lsa (en/ru
// birinchi marta) — paket kelguncha oldingi til ko'rsatiladi, kelgach almashadi (yuklash xatosida
// nusxa uz fallback'iga tushadi, sahifa bo'sh qolmaydi).
export default function LocaleProvider({ children }) {
  const { pathname } = useLocation()
  const target = getLangFromPath(pathname)
  const ready = isLocaleLoaded(target)
  // obyekt: yuklash tugagach (til o'zgarmasa ham) qayta render bo'lishi uchun
  const [shown, setShown] = useState({ lang: target })

  useEffect(() => {
    if (ready) return undefined
    let off = false
    loadLocale(target).catch(() => {}).then(() => { if (!off) setShown({ lang: target }) })
    return () => { off = true }
  }, [target, ready])

  return <I18nextProvider i18n={instances[ready ? target : shown.lang]}>{children}</I18nextProvider>
}
