import { Ic } from './Icons.jsx'

// Admin sahifalarining umumiy holat ko'rinishlari (6.22 — taxtadagi "karta holatlari" va
// "sahifa darajasidagi holatlar"). Birinchi marta Statistikada ishlatiladi, keyingi bo'laklarda
// (Arizalar, Yangiliklar …) ham shu yerdan olinadi — har sahifa o'z "Yuklanmoqda..." matnini yozmaydi.

// Yuklanmoqda: CSS spinner + matn. `role="status"` — ekran o'quvchi e'lon qiladi, ikonka yashirin.
export function LoadingState({ children = 'Yuklanmoqda...' }) {
  return (
    <p className="adm-load-state" role="status">
      <span className="adm-load-state-spinner" aria-hidden="true" />
      {children}
    </p>
  )
}

// Karta ichidagi xato: ikonka + qizil matn. `role="alert"` — darhol e'lon qilinadi.
export function ErrorState({ children = 'Yuklashda xatolik yuz berdi.' }) {
  return (
    <p className="adm-load-state adm-load-state--error" role="alert">
      {Ic.alert}
      {children}
    </p>
  )
}

// Bo'sh holat: ikonka plitkasi + "Ma'lumot yo'q" (markazda).
export function EmptyState({ icon = Ic.stats, children = "Ma'lumot yo'q" }) {
  return (
    <div className="adm-empty-state">
      <span className="adm-empty-state-icon" aria-hidden="true">{icon}</span>
      <p className="adm-empty-state-text">{children}</p>
    </div>
  )
}

// Sahifa darajasidagi xato banneri (butun sahifa yuklanmaganda).
export function ErrorBanner({ children }) {
  return (
    <div className="adm-banner" role="alert">
      {Ic.alert}
      <span>{children}</span>
    </div>
  )
}
