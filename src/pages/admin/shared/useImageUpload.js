import { useRef, useState } from 'react'

// YAXSHILASH: bu ikkala hook NewsAdmin/EventsAdmin/TeachersAdmin'da deyarli
// so'zma-so'z nusxalangan (rasm tanlash, preview, o'chirish) mantiqni bir
// joyga jamlaydi. Xatti-harakat asl koddagi bilan bir xil — faqat joyi
// o'zgargan.

// ── Bitta rasm (Events, Teachers) ──────────────────────────────────
export function useSingleImageUpload() {
  const [imageFile, setImageFile]       = useState(null)   // yangi tanlangan fayl
  const [imagePreview, setImagePreview] = useState(null)    // preview URL (blob yoki mavjud supabase URL)

  function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('Faqat rasm fayli qabul qilinadi!')
    if (file.size > 5 * 1024 * 1024) return alert("Rasm 5 MB dan katta bo'lmasin!")
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Foydalanuvchi "olib tashlash" tugmasini bosganda — blob URL tozalanadi.
  function clearImage() {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  return { imageFile, imagePreview, setImageFile, setImagePreview, handleImageSelect, clearImage }
}

// ── Ko'p rasm (News) ────────────────────────────────────────────────
export function useMultiImageUpload() {
  const [imageFiles, setImageFiles]     = useState([])   // yangi fayllar
  const [imagePreviews, setImagePreviews] = useState([]) // {url, isNew}[]
  const fileRef = useRef(null)

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const invalid = files.find(f => !f.type.startsWith('image/'))
    if (invalid) return alert('Faqat rasm fayllari qabul qilinadi!')
    const oversized = files.find(f => f.size > 5 * 1024 * 1024)
    if (oversized) return alert(`${oversized.name} — 5 MB dan katta!`)

    const newFiles = [...imageFiles, ...files]
    const newPreviews = [...imagePreviews, ...files.map(f => ({ url: URL.createObjectURL(f), isNew: true }))]
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(idx) {
    const preview = imagePreviews[idx]
    if (preview.isNew) {
      // blob URL ni tozalash
      URL.revokeObjectURL(preview.url)
      const newFiles = imageFiles.filter((_, i) => {
        // imageFiles faqat yangi fayllar — index hisoblash kerak
        const newIdx = imagePreviews.slice(0, idx).filter(p => p.isNew).length
        return i !== newIdx
      })
      setImageFiles(newFiles)
    }
    setImagePreviews(imagePreviews.filter((_, i) => i !== idx))
  }

  // Tahrirlash uchun ochilganda — mavjud (backenddan kelgan) URL'larni
  // preview sifatida ko'rsatish, yangi fayllar ro'yxatini tozalash.
  function reset(urls = []) {
    setImageFiles([])
    setImagePreviews(urls.map(u => ({ url: u, isNew: false })))
  }

  function clear() {
    setImageFiles([])
    setImagePreviews([])
  }

  return { imageFiles, imagePreviews, fileRef, handleFileSelect, removeImage, reset, clear }
}
