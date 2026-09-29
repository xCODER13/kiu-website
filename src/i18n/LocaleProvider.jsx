import { I18nextProvider } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { instances } from './index'
import { getLangFromPath } from './locale'

// Router ichida turadi: tilni URL prefiksidan (/en/...) aniqlaydi va shu tilga
// mos i18n nusxasini beradi. Prefiks o'zgarganda (masalan almashtirgich bosilganda)
// bitta render'da hamma matn almashadi.
export default function LocaleProvider({ children }) {
  const { pathname } = useLocation()
  return <I18nextProvider i18n={instances[getLangFromPath(pathname)]}>{children}</I18nextProvider>
}
