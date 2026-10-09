import { useState } from 'react'
import { initialsOf } from './helpers'
import ThumbImg from '../../../components/ThumbImg'

// Doira avatar (6.27 — taxta: Admin-Teachers): foto bo'lsa `object-fit: cover`, bo'lmasa yoki yuklanmasa — bosh harflar
// (`--color-brand-fill → --color-brand-hover` gradient, saytdagi o'qituvchi kartasi bilan bir xil; avval har kartada alohida
// hardcoded rang va yuklanmagan foto doirani bo'sh qoldirardi). Ism yonida turadi, shuning uchun bezak (`aria-hidden`, `alt=""`).
// `size`: 'md' — 56 px (ro'yxat kartasi), 'lg' — 96 px (forma).
export default function Avatar({ name, avatar, image, size = 'md' }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = !!image && failedSrc !== image
  return (
    <span className="adm-avatar" data-size={size} aria-hidden="true">
      {showImage
        ? <ThumbImg src={image} alt="" loading="lazy" onError={() => setFailedSrc(image)} />
        : <span className="adm-avatar-text">{initialsOf({ avatar, name })}</span>}
    </span>
  )
}
