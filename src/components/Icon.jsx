/* Chiziqli (stroke) SVG ikonka qobig'i (6.11c): 24×24 viewBox, `currentColor`, dekorativ (`aria-hidden`).
   `strokeWidth` — chiziq qalinligi (standart 2); `children` — faqat path/line/circle kabi ichki elementlar; o'lcham — `size` (px). */
export default function Icon({ size = 22, strokeWidth = 2, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}
