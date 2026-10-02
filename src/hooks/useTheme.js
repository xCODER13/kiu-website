import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

const isTheme = (value) => value === 'dark' || value === 'light'

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null // private rejim: localStorage ochilmasligi mumkin
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Boshlang'ich qiymat: theme-init.js qo'ygan atribut → saqlangan tanlov → tizim sozlamasi.
function initialTheme() {
  const attr = document.documentElement.getAttribute('data-theme')
  return isTheme(attr) ? attr : (readStored() ?? systemTheme())
}

/**
 * Yagona tema manbai (App, Dashboard, Login).
 * `[dark, setDark]` qaytaradi. Tanlov faqat foydalanuvchi almashtirganda saqlanadi —
 * shunda tanlamagan foydalanuvchi tizim sozlamasiga ergashishda davom etadi.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setDark = useCallback((dark) => {
    const next = dark ? 'dark' : 'light'
    setTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* saqlanmasa ham joriy sessiyada ishlaydi */
    }
  }, [])

  return [theme === 'dark', setDark]
}
