import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LANGS, switchLangPath } from './locale'
import useLocale from './useLocale'
import { loadLocale } from './index'

// UZ | EN almashtirgich. Har til — haqiqiy <a href> (to'g'ridan-to'g'ri ochish, "yangi
// oynada ochish" va qidiruv tizimlari uchun ishlaydi), joriy til esa bosilmaydigan belgi.
// Diqqat: bu yerda react-router'ning ASL Link'i ishlatiladi (i18n/router.jsx'dagi emas) —
// u `to`ni joriy tilga qayta moslab, maqsad tilni buzib yuborardi.
export default function LanguageSwitcher({ className = '', onNavigate }) {
  const { t } = useTranslation()
  const { lang } = useLocale()
  const { pathname, search, hash } = useLocation()

  return (
    <div className={`lang-switch${className ? ` ${className}` : ''}`} role="group" aria-label={t('lang.label')}>
      {LANGS.map(code => {
        const label = code.toUpperCase()
        if (code === lang) {
          return (
            <span key={code} className="lang-switch-item active" lang={code} aria-current="true" title={t(`lang.${code}`)}>
              {label}
            </span>
          )
        }
        return (
          <Link
            key={code}
            to={`${switchLangPath(pathname, code)}${search}${hash}`}
            className="lang-switch-item"
            lang={code}
            hrefLang={code}
            aria-label={t(`lang.${code}`)}
            title={t(`lang.${code}`)}
            onClick={onNavigate}
            onPointerEnter={() => loadLocale(code).catch(() => {})}
            onFocus={() => loadLocale(code).catch(() => {})}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
