import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function usePageView() {
  const location = useLocation()

  useEffect(() => {
    const page = location.pathname
    fetch(`${import.meta.env.VITE_API_URL}/api/views${page}`, {
      method: 'POST'
    }).catch(() => {})
  }, [location.pathname])
}