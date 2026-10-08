import { useRef, useState } from 'react'

// Backend ham faqat shu turlarni qabul qiladi. `image/svg+xml` ataylab yo'q:
// SVG ichida skript bo'lishi mumkin (saqlangan XSS xavfi).
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const isAllowedImage = f => ALLOWED_IMAGE_TYPES.includes(f.type)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// YAXSHILASH: bu ikkala hook NewsAdmin/EventsAdmin/TeachersAdmin'da deyarli
// so'zma-so'z nusxalangan (rasm tanlash, preview, o'chirish) mantiqni bir
// joyga jamlaydi. Xatti-harakat asl koddagi bilan bir xil — faqat joyi
// o'zgargan.

// ── Bitta rasm (Events, Teachers) ──────────────────────────────────
// 6.25 (Tadbirlar) qo'shdi (Yangiliklardagi `useMultiImageUpload` bilan bir xil naqsh):
// - `onError({ kind, file })` — berilsa `alert()` o'rniga chaqiriladi (kind: 'type' | 'size'): maydon ostida inline xabar.
//   Berilmasa — avvalgidek `alert()` (O'qituvchilar 7-bo'lakda o'zgaradi);
// - `addFile(file)` — fayl tanlash VA drag-and-drop uchun bitta yo'l; `fileRef` — `<input type=file>` ni tozalash uchun:
//   rasm olib tashlangach xuddi shu faylni qayta tanlasa `onChange` ishlashi kerak (avval `input.value` tozalanmasdi);
// - `reset(url)` — tahrirlash uchun mavjud rasmni ko'rsatish (eski blob URL tozalanadi);
// - `clearImage` / `reset` / `clear` blob URL'ni `revokeObjectURL` qiladi (saqlangach ham — avval xotira oqardi).
export function useSingleImageUpload({ onError } = {}) {
  const [imageFile, setImageFile]       = useState(null)   // yangi tanlangan fayl
  const [imagePreview, setImagePreview] = useState(null)    // preview URL (blob yoki mavjud supabase URL)
  const fileRef = useRef(null)

  const revokeIfBlob = url => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url) }
  const resetInput = () => { if (fileRef.current) fileRef.current.value = '' }

  function fail(error) {
    resetInput()
    if (onError) return onError(error)
    if (error.kind === 'type') alert('Faqat rasm fayli qabul qilinadi (JPEG, PNG, WebP, GIF)!')
    else alert("Rasm 5 MB dan katta bo'lmasin!")
  }

  function addFile(file) {
    if (!file) return
    if (!isAllowedImage(file)) return fail({ kind: 'type', file })
    if (file.size > MAX_FILE_SIZE) return fail({ kind: 'size', file })
    revokeIfBlob(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    resetInput()
  }

  function handleImageSelect(e) {
    addFile(e.target.files?.[0])
  }

  // Foydalanuvchi "olib tashlash" tugmasini bosganda — blob URL tozalanadi.
  function clearImage() {
    revokeIfBlob(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    resetInput()
  }

  // Forma ochilganda: mavjud (backenddan kelgan) URL yoki `null`
  function reset(url = null) {
    revokeIfBlob(imagePreview)
    setImageFile(null)
    setImagePreview(url || null)
    resetInput()
  }

  return { imageFile, imagePreview, fileRef, setImageFile, setImagePreview, addFile, handleImageSelect, clearImage, reset }
}

// ── Ko'p rasm (News, Gallery) ────────────────────────────────────────
// 6.24 (Yangiliklar) qo'shdi:
// - `addFiles(files)` — fayl tanlash VA drag-and-drop uchun bitta yo'l (`handleFileSelect` shuni chaqiradi);
// - `max` — jami rasm soni (mavjud + yangi); oshsa fayllar qo'shilmaydi;
// - `onError({ kind, file, max })` — berilsa `alert()` o'rniga chaqiriladi (kind: 'type' | 'size' | 'count'),
//   maydon ostida inline xabar ko'rsatish uchun. Berilmasa — avvalgidek `alert()` (Galereya 6-bo'lakda o'zgaradi).
export function useMultiImageUpload({ onError, max } = {}) {
  const [imageFiles, setImageFiles]     = useState([])   // yangi fayllar
  const [imagePreviews, setImagePreviews] = useState([]) // {url, isNew}[]
  const fileRef = useRef(null)

  function fail(error) {
    if (fileRef.current) fileRef.current.value = ''
    if (onError) return onError(error)
    if (error.kind === 'type') alert('Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP, GIF)!')
    else if (error.kind === 'size') alert(`${error.file.name} — 5 MB dan katta!`)
    else alert(`Ko'pi bilan ${error.max} ta rasm qo'shish mumkin.`)
  }

  function addFiles(list) {
    const files = Array.from(list || [])
    if (!files.length) return
    const invalid = files.find(f => !isAllowedImage(f))
    if (invalid) return fail({ kind: 'type', file: invalid })
    const oversized = files.find(f => f.size > MAX_FILE_SIZE)
    if (oversized) return fail({ kind: 'size', file: oversized })
    if (max && imagePreviews.length + files.length > max) return fail({ kind: 'count', max })

    const newFiles = [...imageFiles, ...files]
    const newPreviews = [...imagePreviews, ...files.map(f => ({ url: URL.createObjectURL(f), isNew: true }))]
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleFileSelect(e) {
    addFiles(e.target.files)
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
  function revokeNew() {
    imagePreviews.filter(p => p.isNew).forEach(p => URL.revokeObjectURL(p.url))
  }

  function reset(urls = []) {
    revokeNew()
    setImageFiles([])
    setImagePreviews(urls.map(u => ({ url: u, isNew: false })))
  }

  function clear() {
    revokeNew()
    setImageFiles([])
    setImagePreviews([])
  }

  return { imageFiles, imagePreviews, fileRef, handleFileSelect, addFiles, removeImage, reset, clear }
}
