import { useEffect } from 'react'

export default function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )

    document.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])
}