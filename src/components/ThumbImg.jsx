import { useState } from 'react'
import { thumbUrl } from '../utils/thumb'

// Kichik kartalar uchun <img>: avval yengil thumbnail (~25 KB), u yo'q/yuklanmasa — original.
// Ikkalasi ham yuklanmasa, berilgan `onError` chaqiriladi (mavjud `data-broken` mexanizmi o'zgarishsiz ishlaydi).
// Katta ko'rinishlarda (lightbox, modal, maqola) oddiy <img> + original qoladi.
export default function ThumbImg({ src, onError, ...rest }) {
  const [originalFor, setOriginalFor] = useState(null) // thumbnail yuklanmagan `src`
  const thumb = originalFor === src ? null : thumbUrl(src)
  return (
    <img
      {...rest}
      src={thumb || src}
      onError={e => {
        if (thumb) setOriginalFor(src)
        else if (onError) onError(e)
      }}
    />
  )
}
