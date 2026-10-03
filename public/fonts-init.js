// Google Fonts CSS'ini render'ni bloklamasdan ulaydi (index.html'dagi preload bilan birga).
// Tashqi fayl (inline emas) — CSP `script-src 'self'` yetadi. JS o'chiq bo'lsa index.html'dagi <noscript> ishlaydi.
(function () {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
})();
