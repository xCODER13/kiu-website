// Narxni formatlash: 12850000 -> "12 850 000" (UZ) / "12,850,000" (EN).
// sep — minglik ajratgich (i18n: meta.thousandsSep); berilmasa bo'sh joy.
export const fmt = (n, sep = ' ') => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep)

// Yo'nalishning joriy tilga tarjima qilingan ko'rinishi (matnlar i18n'dan, tuzilma data.js'dan).
// `t` — i18next t funksiyasi. Massivlar (fanlar, karyera) returnObjects bilan olinadi.
export function localizeProgram(f, t) {
  const base = `faculty.programs.${f.id}`
  return {
    ...f,
    name: t(`${base}.name`),
    desc: t(`${base}.desc`),
    subjects: t(`${base}.subjects`, { returnObjects: true }),
    career: t(`${base}.career`, { returnObjects: true }),
    note: f.hasNote ? t(`${base}.note`) : undefined,
    duration: t('faculty.years', { count: f.years }),
    lang: f.langs.map(code => t(`faculty.langs.${code}`)).join(' / '),
    studyFormLabel: t(`faculty.studyForms.${f.studyForm}`),
  }
}
