import { useEffect } from 'react'

// Sahifaga schema.org JSON-LD strukturaviy ma'lumotini <head>ga qo'shadi
// (Google rich snippet uchun). Sahifadan chiqilganda o'zi tozalanadi —
// aks holda boshqa route'ga o'tganda eski schema DOM'da qolib, noto'g'ri
// ma'lumot bergan bo'lardi.
//
// `data` chaqiruvchi tomondan barqaror referens (masalan modul darajasidagi
// konstanta) bo'lishi kerak — aks holda har render'da script qayta yaratiladi.
export default function useJsonLd(id, data) {
  useEffect(() => {
    if (!data) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
    return () => script.remove()
  }, [id, data])
}