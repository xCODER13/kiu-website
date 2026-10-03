import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { loadLocale } from './i18n'
import { getLangFromPath } from './i18n/locale'
import './styles/tokens.css'
import './styles/components.css'
import './styles/site.css'
import './styles/pages.css'
import './styles/admin.css'
import './styles/global.css'

// /en, /ru: birinchi render'dan oldin shu til paketini kutamiz (uz — kirish faylida, kutish yo'q).
// Yuklanmasa ham ilova ochiladi (matn o'zbekcha fallback bilan).
loadLocale(getLangFromPath(window.location.pathname))
  .catch(() => {})
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    )
  })
