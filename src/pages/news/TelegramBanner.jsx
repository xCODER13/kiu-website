import TelegramPanel from '../../components/TelegramPanel'

// DIQQAT: bu komponent News.jsx'da chaqirilmagan edi (asl faylda ham hech
// qayerda ishlatilmagan — dead code). Bo'lish paytida hech narsa yo'qotmaslik
// uchun o'zgarishsiz shu yerga ko'chirildi, funksionallik/chaqiruv o'zgarmadi.
export default function TelegramBanner() {
  return (
    <div className="tg-banner">
      <div className="tg-banner-inner">
        <TelegramPanel bannerMode />
      </div>
    </div>
  )
}
