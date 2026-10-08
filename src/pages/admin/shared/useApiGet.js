import { useState, useEffect, useCallback } from 'react'
import { API, H, errorMessage } from './api'

// GET so'rovi uchun umumiy hook (6.22 — Statistika). Avval Stats.jsx da oltita alohida
// `fetch().then(r => r.json())` bor edi: `res.ok` tekshirilmasdi (server `{error}` qaytarsa u
// ma'lumot sifatida o'qilar va sahifa jimgina bo'sh qolardi), faqat bittasida poyga himoyasi
// bor edi va unmount'dan keyin ham `setState` chaqirilardi.
//
// - `AbortController`: `path` o'zgarsa yoki komponent yopilsa so'rov bekor qilinadi (eskirgan
//   javob yangisini bosib ketmaydi, unmount'dan keyin setState yo'q).
// - `res.ok` tekshiriladi: 4xx/5xx — xato holati (`error: true`), ma'lumot emas.
// - "yuklanmoqda" HISOBLANADI (`state.key !== key`) — effekt ichida sinxron setState yo'q.
//
// 6.23 (Arizalar) qo'shdi:
// - `reload()` — xatodan keyin "Qayta urinish": so'rov qaytadan yuboriladi va `loading` yana true bo'ladi.
// - `mutate(fn)` — yuklangan ma'lumotni mahalliy yangilash (holat o'zgartirilgach / ariza o'chirilgach
//   butun ro'yxatni qayta yuklamasdan; server javobi allaqachon qo'lda).
//
// Qaytaradi: { data, error, loading, reload, mutate }. `label` — konsol xabari uchun (foydalanuvchiga ko'rsatilmaydi).
export function useApiGet(path, label) {
  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState({ key: null, data: null, error: false })
  // `key` — path + qayta yuklash soni: reload() ham "yangi so'rov" hisoblanadi
  const key = `${nonce}:${path}`

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API}${path}`, { headers: H(), signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error(await errorMessage(res, `HTTP ${res.status}`))
        return res.json()
      })
      .then(data => setState({ key, data, error: false }))
      .catch(err => {
        if (controller.signal.aborted) return
        console.error(`${label}:`, err)
        setState({ key, data: null, error: true })
      })
    return () => controller.abort()
  }, [path, label, key])

  const reload = useCallback(() => setNonce(n => n + 1), [])
  const mutate = useCallback(fn => setState(s => (s.data == null ? s : { ...s, data: fn(s.data) })), [])

  const settled = state.key === key
  return {
    data: settled ? state.data : null,
    error: settled && state.error,
    loading: !settled,
    reload,
    mutate,
  }
}
