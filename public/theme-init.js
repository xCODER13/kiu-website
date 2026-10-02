// FOUC oldini olish: React yuklanguncha saqlangan tema <html> ga qo'yiladi.
// Tashqi fayl (inline emas) — kelajakdagi CSP'da `script-src 'self'` yetadi.
// Saqlangan tanlov yo'q bo'lsa atribut qo'yilmaydi: tokens.css `prefers-color-scheme` ni o'zi hisobga oladi.
try {
  var t = localStorage.getItem('theme');
  if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
} catch { /* private rejim: tizim sozlamasi ishlaydi */ }
