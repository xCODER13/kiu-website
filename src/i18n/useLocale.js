import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getLangFromPath, stripLangPrefix, localizePath } from './locale'

// { lang, path, localize }
//  lang     — joriy til kodi ('uz' | 'en'), URL prefiksidan
//  path     — prefikssiz yo'l (/en/news → /news): faol havolani/SEO kalitini aniqlash uchun
//  localize — ichki yo'lni joriy tilga moslaydi: localize('/faq') → '/en/faq'
export default function useLocale() {
  const { pathname } = useLocation()
  return useMemo(() => {
    const lang = getLangFromPath(pathname)
    return { lang, path: stripLangPrefix(pathname), localize: to => localizePath(to, lang) }
  }, [pathname])
}
