import { useTranslation } from 'react-i18next'
import { DEFAULT_LANG } from './locale'

// Bazadan keladigan kontent (yangiliklar, tadbirlar, o'qituvchilar...) faqat o'zbekcha —
// interfeys boshqa tilda bo'lganda foydalanuvchiga kichik izoh ko'rsatiladi.
// O'zbekcha interfeysda hech narsa chiqmaydi.
export default function ContentLangNote() {
  const { t, i18n } = useTranslation()
  if (i18n.language === DEFAULT_LANG) return null
  return (
    <p className="content-lang-note">
      {t('common.contentInUzbek')}
    </p>
  )
}
