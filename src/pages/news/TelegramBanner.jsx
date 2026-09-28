import TelegramPanel from '../../components/TelegramPanel'

// DIQQAT: bu komponent News.jsx'da chaqirilmagan edi (asl faylda ham hech
// qayerda ishlatilmagan — dead code). Bo'lish paytida hech narsa yo'qotmaslik
// uchun o'zgarishsiz shu yerga ko'chirildi, funksionallik/chaqiruv o'zgarmadi.
export default function TelegramBanner() {
  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, #0088cc, #006aa3)',
      padding: '0',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 2rem',
      }}>
        <TelegramPanel bannerMode />
      </div>
    </div>
  )
}