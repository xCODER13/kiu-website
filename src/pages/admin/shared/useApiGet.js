import { useState, useEffect } from 'react'
import { API, H, errorMessage } from './api'

// GET so'rovi uchun umumiy hook (6.22 — Statistika). Avval Stats.jsx da oltita alohida
// `fetch().then(r => r.json())` bor edi: `res.ok` tekshirilmasdi (server `{error}` qaytarsa u
// ma'lumot sifatida o'qilar va sahifa jimgina bo'sh qolardi), faqat bittasida poyga himoyasi
// bor edi va unmount'dan keyin ham `setState` chaqirilardi.
//
// - `AbortController`: `path` o'zgarsa yoki komponent yopilsa so'rov bekor qilinadi (eskirgan
//   javob yangisini bosib ketmaydi, unmount'dan keyin setState yo'q).
// - `res.ok` tekshiriladi: 4xx/5xx — xato holati (`error: true`), ma'lumot emas.
// - "yuklanmoqda" HISOBLANADI (`state.path !== path`) — effekt ichida sinxron setState yo'q.
//
// Qaytaradi: { data, error, loading }. `label` — konsol xabari uchun (foydalanuvchiga ko'rsatilmaydi).
export function useApiGet(path, label) {
  const [state, setState] = useState({ path: null, data: null, error: false })

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API}${path}`, { headers: H(), signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error(await errorMessage(res, `HTTP ${res.status}`))
        return res.json()
      })
      .then(data => setState({ path, data, error: false }))
      .catch(err => {
        if (controller.signal.aborted) return
        console.error(`${label}:`, err)
        setState({ path, data: null, error: true })
      })
    return () => controller.abort()
  }, [path, label])

  const settled = state.path === path
  return {
    data: settled ? state.data : null,
    error: settled && state.error,
    loading: !settled,
  }
}
