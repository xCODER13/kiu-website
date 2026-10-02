/* ── Styles injection ──────────────────────────────────────── */
// Bu fayl faqat side-effect uchun import qilinadi (Faculty.jsx'ning
// yuqorisida `import './faculty-styles.js'`) — hech qanday export yo'q.
// Xatti-harakati asl koddagi bilan bir xil: bir marta, module yuklanganda
// <style id="faculty-styles"> qo'shiladi.
if (typeof document !== 'undefined' && !document.getElementById('faculty-styles')) {
  const s = document.createElement('style')
  s.id = 'faculty-styles'
  s.textContent = `
    @keyframes cardFadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0);    }
    }

    /* ✅ FIX 2: Mobile tab responsive styles */
    .kiu-tab-wrap {
      display: inline-flex;
      gap: 6px;
      background: var(--card);
      padding: 5px;
      border-radius: 40px;
      border: 2px solid var(--border);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-brand) 25%, transparent);
      max-width: 100%;
    }
    .kiu-tab-btn {
      padding: 9px 22px;
      border-radius: 35px;
      cursor: pointer;
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 7px;
      transition: all .2s;
      white-space: nowrap;
      font-family: inherit;
    }
    .kiu-tab-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 20px;
    }

    /* Mobil uchun: kichik ekranda padding va font kamaytirish */
    @media (max-width: 480px) {
      .kiu-tab-btn {
        padding: 8px 13px !important;
        font-size: 11.5px !important;
        gap: 5px !important;
      }
      .kiu-tab-badge {
        padding: 1px 5px !important;
        font-size: 9px !important;
      }
    }
  `
  document.head.appendChild(s)
}
