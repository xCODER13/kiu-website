import { useState, useEffect } from 'react'

export default function useApi(url, fallback = []) {
  const [data, setData]       = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(d => {
        if (cancelled) return
        const result = Array.isArray(d) ? d : d.posts || d
        if (Array.isArray(result) && result.length > 0) setData(result)
        else if (!Array.isArray(result)) setData(d)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}