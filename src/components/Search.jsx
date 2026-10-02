import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useNavigate from '../i18n/useLocalizedNavigate'

const SEARCH_DATA = [
  { id: 'preschool', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'primary', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { id: 'softwareEng', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  { id: 'economics', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
  { id: 'psychology', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A6.5 6.5 0 0 1 16 8.5c0 3.58-2.92 6.5-6.5 6.5A6.5 6.5 0 0 1 3 8.5 6.5 6.5 0 0 1 9.5 2z"/><path d="M9.5 15v7"/><path d="M6 22h7"/></svg> },
  { id: 'philology', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  { id: 'oilGas', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg> },
  { id: 'finance', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { id: 'accounting', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { id: 'nationalIdea', url: '/faculty', cat: 'program', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { id: 'admission', url: '/admission', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { id: 'documents', url: '/admission', cat: 'admission', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg> },
  { id: 'apply', url: '/admission', cat: 'admission', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { id: 'grants', url: '/admission', cat: 'admission', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  { id: 'news', url: '/news', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg> },
  { id: 'shorts', url: '/news', cat: 'media', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
  { id: 'contact', url: '/contact', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.44a16 16 0 0 0 5.61 5.61l1.5-1.5a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
  { id: 'address', url: '/contact', cat: 'contact', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
  { id: 'about', url: '/about', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'mission', url: '/about', cat: 'university', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> },
  { id: 'leadership', url: '/about', cat: 'university', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { id: 'teachers', url: '/teachers', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'international', url: '/international', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  { id: 'regulations', url: '/documents', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { id: 'vacancies', url: '/vacancies', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
  { id: 'hemis', url: '/hemis', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { id: 'faq', url: '/faq', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { id: 'events', url: '/events', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { id: 'testimonials', url: '/testimonials', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { id: 'achievements', url: '/achievements', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  { id: 'gallery', url: '/gallery', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { id: 'map', url: '/map', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg> },
  { id: 'qrcode', url: '/qrcode', cat: 'page', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg> },
]

const QUICK = [
  { id: 'admission', url: '/admission', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { id: 'programs', url: '/faculty', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { id: 'contact', url: '/contact', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.44a16 16 0 0 0 5.61 5.61l1.5-1.5a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
  { id: 'news', url: '/news', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg> },
  { id: 'hemis', url: '/hemis', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { id: 'about', url: '/about', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
]

export default function Search() {
  const { t } = useTranslation()
  const [open, setOpen]         = useState(false)
  const [query, setQuery]       = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const wrapRef  = useRef(null)
  const inputRef = useRef(null)
  const focusTimer = useRef(null)
  const toggleRef = useRef(null)
  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      focusTimer.current = setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('')
    }
    // Panel yopilishi/komponent unmount bo'lishi 50ms ichida sodir bo'lsa,
    // kechiktirilgan focus() keyinroq yana tetiklanib qolmasin
    return () => { if (focusTimer.current) clearTimeout(focusTimer.current) }
  }, [open])
  // Esc paneli fokus qayerda bo'lishidan qat'i nazar (natija/tezkor havola ustida ham) yopadi
  // va fokusni ochuvchi tugmaga qaytaradi
  useEffect(() => {
    if (!open) return undefined
    const button = toggleRef.current
    function onEsc(e) {
      if (e.key === 'Escape') { setOpen(false); button?.focus() }
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open])
  useEffect(() => {
    if (isMobile) return
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => 
    {document.body.style.overflow = ''}
  }, [open, isMobile])

  // Sarlavha va kategoriya joriy tilda (tarjimadan) olinadi; qidiruv ham shu til bo'yicha
  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return SEARCH_DATA
      .map(item => ({ ...item, title: t(`search.items.${item.id}`), category: t(`search.categories.${item.cat}`) }))
      .filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      ).slice(0, 7)
  }, [query, t])

  // Reset selection when results change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(0)
  }, [results])

  function go(url) { navigate(url); setOpen(false); setQuery('') }

  function handleKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(p => Math.min(p + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(p => Math.max(p - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) go(results[selected].url)
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        ref={toggleRef}
        onClick={() => setOpen(o => !o)} aria-label={t('search.open')}
        aria-expanded={open} aria-controls="site-search-panel" aria-haspopup="dialog"
        style={{
          background: open ? 'color-mix(in srgb, var(--color-brand) 8%, transparent)' : 'none',
          border: `1px solid ${open ? 'var(--color-brand)' : 'var(--border)'}`,
          borderRadius: 8, padding: '7px 9px', cursor: 'pointer',
          color: open ? 'var(--color-brand)' : 'var(--muted)',
          display: 'flex', alignItems: 'center', transition: 'all .2s',
        }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>

      {open && (
        <div id="site-search-panel" role="dialog" aria-label={t('search.placeholder')} style={{
               position: isMobile ? 'fixed' : 'absolute',
               top: isMobile ? '70px' : 'calc(100% + 10px)',
               left: isMobile ? '16px' : 'auto',
               right: isMobile ? '16px' : 0,
               width: isMobile ? 'auto' : 420,
               background: 'var(--bg)',
               border: '1px solid var(--border)',
               borderRadius: 14,
               boxShadow: '0 12px 40px rgba(0,0,0,.15)',
               zIndex: 200,
               overflow: 'hidden',
               maxHeight: isMobile ? 'calc(100vh - 90px)' : 'none',
               overflowY: isMobile ? 'auto' : 'hidden',
  }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              role="combobox" aria-expanded={results.length > 0} aria-controls="site-search-results"
              aria-autocomplete="list" aria-activedescendant={results.length > 0 ? `site-search-opt-${selected}` : undefined}
              placeholder={t('search.placeholder')}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'none', color: 'var(--text)', fontFamily: 'inherit' }}
            />
            {query ? (
              <button onClick={() => setQuery('')} aria-label={t('search.clear')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            ) : (
              <kbd style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--bg-2)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>Esc</kbd>
            )}
          </div>

          {results.length > 0 && (
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              <div style={{ padding: '6px 1rem', fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
                {t('search.found', { count: results.length })}
              </div>
              <div id="site-search-results" role="listbox">
              {results.map((item, i) => (
                <div key={i} id={`site-search-opt-${i}`} role="option" aria-selected={selected === i} onClick={() => go(item.url)}
                  onMouseEnter={() => setSelected(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.65rem 1rem', cursor: 'pointer',
                    background: selected === i ? 'color-mix(in srgb, var(--color-brand) 6%, transparent)' : 'none',
                    borderLeft: selected === i ? '3px solid var(--color-brand)' : '3px solid transparent',
                    transition: 'all .1s',
                  }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'color-mix(in srgb, var(--color-brand) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: selected === i ? 'var(--color-brand)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.category}</div>
                  </div>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{t('search.noResults')}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('search.noResultsFor', { query })}</div>
            </div>
          )}

          {!query && (
            <div style={{ padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '0.6rem' }}>
                {t('search.quickLinks')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK.map((l, i) => (
                  <button key={i} onClick={() => go(l.url)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 11px', background: 'var(--bg-2)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      fontSize: 12, color: 'var(--text)', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--color-brand)'; e.currentTarget.style.color='var(--color-brand)'; e.currentTarget.style.background='color-mix(in srgb, var(--color-brand) 6%, transparent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='var(--bg-2)' }}>
                    {l.icon} {t(`search.quick.${l.id}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, fontSize: 10, color: 'var(--muted)', background: 'var(--bg-2)' }}>
            <span><kbd style={{ background: 'var(--bg)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)' }}>↑↓</kbd> {t('search.hints.select')}</span>
            <span><kbd style={{ background: 'var(--bg)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)' }}>Enter</kbd> {t('search.hints.go')}</span>
            <span><kbd style={{ background: 'var(--bg)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)' }}>Esc</kbd> {t('search.hints.close')}</span>
          </div>
        </div>
      )}
    </div>
  )
}