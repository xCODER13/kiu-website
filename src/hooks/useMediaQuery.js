import { useSyncExternalStore } from 'react'

// CSS media query holati (masalan, `(max-width: 768px)`). `window.innerWidth` ni render paytida bir marta o'qish o'rniga —
// ekran aylantirilsa yoki o'lchami o'zgarsa komponent yangilanadi. `matchMedia` yo'q muhitda (eski/test) — `false`.
export default function useMediaQuery(query) {
  return useSyncExternalStore(
    notify => {
      const mq = window.matchMedia?.(query)
      mq?.addEventListener?.('change', notify)
      return () => mq?.removeEventListener?.('change', notify)
    },
    () => window.matchMedia?.(query).matches ?? false,
    () => false,
  )
}
