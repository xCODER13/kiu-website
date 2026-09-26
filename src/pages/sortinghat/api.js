// ── API ─────────────────────────────────────────────────────
// Test natijasi (top-3 yo'nalish) va foydalanuvchi ma'lumotlarini
// backendga (Telegram lead sifatida) yuboradi. Asl koddagi bilan
// bir xil xatti-harakat: xato bo'lsa faqat console.log qilinadi,
// foydalanuvchi natijani ko'rishda davom etadi (fetch xatosi UI'ni
// to'xtatmaydi).
export async function postSortingHatLead({ name, phone, faculties }) {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/api/sorting-hat-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, faculties })
    })
  } catch (e) {
    console.log('Telegram xatosi:', e.message)
  }
}
