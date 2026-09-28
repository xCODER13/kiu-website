# KIU — Qarshi xalqaro universiteti veb-sayti

Qarshi xalqaro universiteti (KIU) uchun to'liq stack veb-sayt: ommaviy sahifalar (yangiliklar, tadbirlar, o'qituvchilar, fakultetlar, "Sorting Hat" test, ariza topshirish) + admin panel (kontentni boshqarish).

**Live:** frontend — Vercel, backend — Render

---

## Stek

| Qatlam | Texnologiya |
|---|---|
| Frontend | React 19 + Vite, React Router 7 |
| Backend | Node.js + Express 5 |
| Ma'lumotlar bazasi | MongoDB (Mongoose) |
| Fayl saqlash | Supabase Storage (rasm yuklash — backend orqali, signed/service-key bilan) |
| Auth | JWT + `PrivateRoute` guard (frontend), bcrypt bilan parol xeshlash (backend) |
| Test | Vitest + Testing Library + Playwright (frontend), Jest + Supertest + Docker MongoDB (backend) |
| Deploy | Vercel (frontend), Render (backend) |

---

## Loyiha tuzilishi

```
kiu-website/
├── src/                    # Frontend (React)
│   ├── pages/               # Sahifalar (Home, News, Events, Faculty, Admission, ...)
│   │   ├── admin/            # Admin panel (News/Events/Teachers/Gallery/Applications boshqaruvi)
│   │   ├── faculty/          # Faculty sahifasi qism-komponentlari
│   │   └── sortinghat/       # "Sorting Hat" interaktiv testi
│   ├── components/          # Qayta ishlatiladigan UI komponentlar
│   ├── hooks/               # Custom React hook'lar
│   ├── utils/                # Yordamchi funksiyalar
│   └── styles/               # Global stillar
├── kiu-backend/             # Backend (Express API)
│   ├── app.js                 # Express app (middleware, route ulash) — .listen() yo'q
│   ├── server.js               # Startup: DB ulanish, .listen(), graceful shutdown, keep-alive
│   ├── config/                # Env validatsiya, MongoDB ulanish, CORS
│   ├── routes/                 # API route'lar
│   ├── controllers/             # Route logikasi
│   ├── models/                  # Mongoose sxemalari
│   ├── middleware/               # Auth, rate limiting, xato boshqaruvi
│   ├── services/                  # Supabase upload, Telegram integratsiyasi
│   ├── utils/                      # Yordamchi funksiyalar
│   └── tests/                       # Jest + Supertest testlari
├── e2e/                      # Playwright end-to-end testlari
└── public/                   # Statik fayllar
```

---

## Ishga tushirish (local development)

### Talab qilinadigan dasturlar
- Node.js 20+
- MongoDB (local yoki Atlas ulanish satri)
- Docker (backend integratsiya testlari uchun, ixtiyoriy)

### 1. Repozitoriyani klonlash

```bash
git clone https://github.com/xCODER13/kiu-website.git
cd kiu-website
```

### 2. Frontend

```bash
npm install
cp .env.example .env   # agar mavjud bo'lmasa, quyidagi jadvaldan yarating
npm run dev
```

**Frontend `.env` o'zgaruvchilari:**

| O'zgaruvchi | Tavsif |
|---|---|
| `VITE_API_URL` | Backend API manzili (masalan, `http://localhost:5000/api` yoki production Render URL) |

### 3. Backend

```bash
cd kiu-backend
npm install
cp .env.example .env   # so'ng qiymatlarni to'ldiring
npm run dev
```

**Backend `.env` o'zgaruvchilari:**

| O'zgaruvchi | Majburiymi | Tavsif |
|---|---|---|
| `MONGODB_URI` | ✅ Majburiy | MongoDB ulanish satri |
| `JWT_SECRET` | ✅ Majburiy | Kamida 64 belgili tasodifiy matn (`openssl rand -hex 64`) |
| `ADMIN_USERNAME` | ✅ Majburiy | Admin login |
| `ADMIN_PASSWORD` | Faqat dastlabki hash generatsiya uchun | Haqiqiy parol MongoDB'da bcrypt hash sifatida saqlanadi |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Tavsiya etiladi | Rasm yuklash (News/Events/Teachers/Gallery) ishlashi uchun |
| `BOT_TOKEN` / `CHANNEL_USERNAME` / `TELEGRAM_CHAT_ID` | Tavsiya etiladi | Telegram integratsiyasi (yangi ariza xabarnomasi, kanal postlari) |
| `FRONTEND_URL` | Tavsiya etiladi | CORS uchun |
| `BACKEND_URL` | Tavsiya etiladi | Render cold-start'ga qarshi keep-alive mexanizmi uchun (o'zini `/health`ga so'raydi) |
| `PORT` | Ixtiyoriy | Standart: `5000` |

> Server ishga tushishda barcha majburiy o'zgaruvchilarni tekshiradi — biror narsa yo'q yoki `JWT_SECRET` namuna qiymat/juda qisqa bo'lsa, aniq xato bilan darhol to'xtaydi (birinchi so'rovda emas).

---

## API — asosiy endpoint'lar

Barcha yo'llar `/api` prefiksi bilan boshlanadi. Mutatsiya (`POST`/`PUT`/`DELETE`) endpoint'larining aksariyati `auth` (JWT) va rate-limit middleware bilan himoyalangan.

| Resurs | Endpoint'lar |
|---|---|
| Auth | `POST /admin/login`, `POST /admin/change-password` |
| News | `GET /news`, `GET /news/:id`, `POST /news`, `PUT /news/:id`, `PUT /news/:id/view`, `DELETE /news/:id` |
| Events | `GET /events`, `POST /events`, `PUT /events/:id`, `DELETE /events/:id` |
| Teachers | `GET /teachers`, `POST /teachers`, `PUT /teachers/:id`, `DELETE /teachers/:id` |
| Gallery | `GET /gallery`, `POST /gallery`, `PUT /gallery/:id`, `DELETE /gallery/:id` |
| Applications | `GET /applications`, `POST /applications`, `PUT /applications/:id`, `DELETE /applications/:id` |
| Stats | `GET /stats` |
| Boshqa | `POST /sorting-hat-lead`, `GET /telegram/posts` |
| Monitoring | `GET /health` (auth talab qilinmaydi — keep-alive va uptime monitoring uchun) |

News/Events/Teachers/Gallery uchun rasm yuklash `multipart/form-data` orqali (`multer`), fayllar Supabase Storage'ga backend orqali yuklanadi — frontend'da hech qanday Supabase kaliti saqlanmaydi.

---

## Test

**Frontend:**
```bash
npm run test          # Vitest (bir marta)
npm run test:watch    # Vitest (watch rejimi)
```

**Backend:**
```bash
cd kiu-backend
npm run test:db:up     # Docker'da mongo:8.0 test bazasini ko'tarish
npm test               # Jest + Supertest
npm run test:db:down   # Test bazasini to'xtatish
```

**E2E:**
```bash
npx playwright test
```

---

## Deploy

- **Frontend (Vercel):** `main` branch'ga push — avtomatik deploy. SPA routing `vercel.json`dagi rewrite qoidasi orqali ta'minlanadi.
- **Backend (Render):** `main` branch'ga push — avtomatik deploy (`autoDeploy: yes`). Bepul tarifda cold-start (15 daq. faolsizlikdan keyin uxlash) muammosi `server.js`dagi ichki keep-alive mexanizmi + Render Health Check Path (`/health`) orqali yumshatilgan.

**Rollback:**
- Vercel: Deployments → oldingi `READY` deploy → *Promote to Production* (bir necha soniya).
- Render: instant rollback tugmasi yo'q — `git revert <commit> && git push origin main` yoki dashboard'dan qo'lda qayta deploy.

---

## Xavfsizlik

- Parollar bcrypt bilan xeshlanadi, admin autentifikatsiyasi JWT orqali.
- Mutatsiya endpoint'larida rate limiting (`express-rate-limit`) qo'llanilgan.
- HTTP xavfsizlik headerlari — `helmet`.
- Foydalanuvchi kiritgan matn Telegram xabarlariga yuborishdan oldin escape qilinadi (HTML injection'ning oldini olish uchun).
- Rasm yuklash: fayl turi (MIME whitelist), hajmi va yuklash papkasi tekshiriladi. **Ma'lum cheklov:** MIME tekshiruvi hozircha faqat client yuborgan `Content-Type`ga tayanadi (magic-bytes tekshiruvi yo'q) — batafsil `claude/ANALYSIS.md`da.
- Muhit o'zgaruvchilari (`.env`) hech qachon commit qilinmaydi — namunalar uchun `.env.example`ga qarang.

Xavfsizlik zaifligi topsangiz, uni ochiq issue sifatida emas, to'g'ridan-to'g'ri loyiha egasiga xabar bering.

---

## Litsenziya

Bu loyiha KIU (Qarshi xalqaro universiteti) uchun maxsus ishlab chiqilgan yopiq (proprietary) loyiha.