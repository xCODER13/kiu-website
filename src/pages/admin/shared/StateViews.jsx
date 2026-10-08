import { Ic } from './Icons.jsx'

// Admin sahifalarining umumiy holat ko'rinishlari (6.22 — taxtadagi "karta holatlari" va
// "sahifa darajasidagi holatlar"). Birinchi marta Statistikada ishlatiladi, keyingi bo'laklarda
// (Arizalar, Yangiliklar …) ham shu yerdan olinadi — har sahifa o'z "Yuklanmoqda..." matnini yozmaydi.
// 6.23 (Arizalar) qo'shdi: `ErrorPanel` («Qayta urinish»), sarlavhali/tugmali `EmptyState` va yopiladigan `ErrorBanner`.

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

// Sahifa xatosi (taxta: Arizalar «Sahifa holatlari»): sarlavha + izoh + «Qayta urinish» tugmasi.
// Ro'yxat yuklanmaganda jim «Ariza yo'q» ko'rsatilmaydi — admin xatoni ko'radi va qayta urinadi.
export function ErrorPanel({ title, children, onRetry, retryLabel = 'Qayta urinish' }) {
  return (
    <div className="adm-error-panel" role="alert">
      <span className="adm-error-panel-icon" aria-hidden="true">{Ic.alert}</span>
      <div className="adm-error-panel-body">
        <p className="adm-error-panel-title">{title}</p>
        {children && <p className="adm-error-panel-text">{children}</p>}
        {onRetry && (
          <button type="button" className="btn btn-secondary adm-error-panel-retry" onClick={onRetry}>
            {Ic.retry}
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  )
}

// Bo'sh holat: ikonka plitkasi + matn (markazda). `title` berilsa — sahifa darajasidagi «panel» ko'rinishi
// (punktir chegara, sarlavha + izoh + ixtiyoriy `action` tugmasi); bo'lmasa — karta ichidagi ixcham ko'rinish.
export function EmptyState({ icon = Ic.stats, title, action, children = "Ma'lumot yo'q" }) {
  return (
    <div className={title ? 'adm-empty-state adm-empty-state--panel' : 'adm-empty-state'}>
      <span className="adm-empty-state-icon" aria-hidden="true">{icon}</span>
      {title && <p className="adm-empty-state-title">{title}</p>}
      <p className="adm-empty-state-text">{children}</p>
      {action}
    </div>
  )
}

// Sahifa darajasidagi xato banneri. `onDismiss` berilsa — o'ngda «Yopish» tugmasi (taxta: Arizalar,
// holat o'zgartirilmagandagi xabar — avval `alert()` edi).
export function ErrorBanner({ children, onDismiss }) {
  return (
    <div className={onDismiss ? 'adm-banner adm-banner--dismissible' : 'adm-banner'} role="alert">
      {Ic.alert}
      <span className="adm-banner-text">{children}</span>
      {onDismiss && (
        <button type="button" className="adm-banner-close" aria-label="Yopish" onClick={onDismiss}>
          {Ic.close}
        </button>
      )}
    </div>
  )
}
