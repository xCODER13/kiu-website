/* Ichki sahifa hero'si (6.11, hammasi uchun umumiy): badge (ixtiyoriy), h1, ta'rif, ixtiyoriy qo'shimcha (masalan, tab almashtirgich).
   Fon (yarim shaffof wine/oltin radial) va pastdagi so'nish — faqat CSS (`.inner-hero`, pages.css); nuqtalar va yaltirash — sahifa bo'ylab yagona qatlam (`body::before/::after`, global.css).
   `note` — ta'rif ostidagi kichik izoh (masalan, `<ContentLangNote />`); `children` — hero ichidagi qo'shimcha (tab almashtirgich).
   `title` — matn yoki JSX (masalan, `<Trans>` bilan yil brend rangida). */
export default function PageHero({ badge, title, sub, note, children, className = '' }) {
  return (
    <section className={`inner-hero${className ? ` ${className}` : ''}`}>
      <div className="container inner-hero__inner">
        {badge && (
          <span className="hero-badge">
            <span className="hero-badge__dot" aria-hidden="true" />
            {badge}
          </span>
        )}
        <h1 className="inner-hero__title">{title}</h1>
        {sub && <p className="inner-hero__sub">{sub}</p>}
        {note}
        {children && <div className="inner-hero__extra">{children}</div>}
      </div>
    </section>
  )
}
