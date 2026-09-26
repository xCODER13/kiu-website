import { useState, useEffect } from 'react'

export default function useApi(url, fallback = []) {
  const [data, setData] = useState(fallback)
  // Qaysi url uchun javob (yoki xato) kelganini eslab qolamiz: loading/error
  // effect ichida setState qilmasdan, joriy url bilan solishtirib hosil qilinadi.
  const [settled, setSettled] = useState({ url: null, error: false })

  useEffect(() => {
    let cancelled = false
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(d => {
        if (cancelled) return
        const result = Array.isArray(d) ? d : d.posts || d
        if (Array.isArray(result) && result.length > 0) setData(result)
        else if (!Array.isArray(result)) setData(d)
        setSettled({ url, error: false })
      })
      .catch(() => {
        if (!cancelled) setSettled({ url, error: true })
      })
    return () => { cancelled = true }
  }, [url])

  const loading = settled.url !== url
  return { data, loading, error: !loading && settled.error }
}
