import { Link as RouterLink, NavLink as RouterNavLink, Navigate as RouterNavigate } from 'react-router-dom'
import useLocale from './useLocale'
import { localizeTo } from './locale'

// react-router'ning Link/NavLink/Navigate komponentlarining "til-sezgir" o'ramalari:
// ichki `to` ("/admission") joriy til prefiksi bilan ("/en/admission") avtomatik
// almashtiriladi. Tashqi URL, mailto:, #hash va /admin o'zgarishsiz qoladi.
// Barcha ommaviy sahifalar `react-router-dom`dan emas, shu fayldan import qiladi —
// shunda hali tarjima qilinmagan sahifadagi havola ham foydalanuvchini ingliz
// rejimidan chiqarib yubormaydi.

export function Link({ to, ...props }) {
  const { lang } = useLocale()
  return <RouterLink to={localizeTo(to, lang)} {...props} />
}

export function NavLink({ to, ...props }) {
  const { lang } = useLocale()
  return <RouterNavLink to={localizeTo(to, lang)} {...props} />
}

export function Navigate({ to, ...props }) {
  const { lang } = useLocale()
  return <RouterNavigate to={localizeTo(to, lang)} {...props} />
}
