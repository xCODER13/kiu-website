import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useLocale from './useLocale'
import { localizeTo } from './locale'

// useNavigate'ning til-sezgir varianti: navigate('/faculty') → /en/faculty (EN rejimida).
// navigate(-1) kabi raqamli chaqiruvlar o'zgarishsiz o'tadi.
export default function useLocalizedNavigate() {
  const navigate = useNavigate()
  const { lang } = useLocale()
  return useCallback(
    (to, options) => (typeof to === 'number' ? navigate(to) : navigate(localizeTo(to, lang), options)),
    [navigate, lang]
  )
}
