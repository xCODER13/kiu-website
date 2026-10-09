// Yangi admin parolini tekshiruvi (3.4). Frontend faqat maslahat beradi (kuch o'lchagichi), himoya shu yerda.
//
// Qoidalar (uzunlik va 72 bayt tekshiruvi controller'da):
//   1) keng tarqalgan parollar qisqa ro'yxatidan bo'lmasin;
//   2) parol loginni o'z ichiga olmasin (katta-kichik harfga e'tiborsiz).
// To'liq lug'at (zxcvbn) yoki HIBP ataylab qo'yilmagan: bitta admin uchun ortiqcha bog'liqlik/tashqi so'rov.
const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890', '87654321', '12341234', '11111111', '00000000', '11223344', '123123123',
  'password', 'password1', 'password12', 'password123', 'passw0rd', 'p@ssw0rd', 'p@ssword', 'parol123', 'parol1234',
  'qwerty123', 'qwertyui', 'qwertyuiop', 'qwerty1234', '1q2w3e4r', '1q2w3e4r5t', 'qazwsxedc', 'zaq12wsx', '123qweasd',
  'asdfghjk', 'asdfghjkl', 'abc12345', 'abcd1234', 'iloveyou', 'welcome1', 'welcome123', 'letmein1', 'letmein123',
  'admin123', 'admin1234', 'admin12345', 'administrator', 'superadmin', 'changeme', 'changeme123',
  'kiu12345', 'kiu123456', 'kiu2024', 'kiu2025', 'kiu2026', 'qarshi123', 'uzbekistan', 'uzbekistan1', 'toshkent1',
])

const MIN_LOGIN_LENGTH = 3 // juda qisqa login («a») har bir parolga mos tushib qolmasin

// Muammo bo'lsa foydalanuvchiga ko'rsatiladigan xabar, aks holda null.
function passwordProblem(password, username) {
  const lower = password.toLowerCase()
  if (COMMON_PASSWORDS.has(lower)) return "Bu parol juda keng tarqalgan — boshqa parol tanlang"
  const login = typeof username === 'string' ? username.trim().toLowerCase() : ''
  if (login.length >= MIN_LOGIN_LENGTH && lower.includes(login)) return "Parol loginni o'z ichiga olmasligi kerak"
  return null
}

module.exports = { passwordProblem, COMMON_PASSWORDS }
