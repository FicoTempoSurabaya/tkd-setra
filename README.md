# Online Test Web Application

Aplikasi web untuk menyelenggarakan tes online berbasis **Single-Tenant**.

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Frontend | Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS 4 |
| Backend | Node.js 24 + Fastify 5 + TypeScript + Zod + JWT + Argon2 |
| Database | PostgreSQL 17 (Native SQL, tanpa ORM) |
| Design | Retro Neo Brutalism |

## Struktur Proyek

```
tkd_setra/
├── packages/
│   └── shared/          # Shared types, schemas (Zod), constants, utils
├── apps/
│   ├── backend/         # Fastify REST API
│   └── frontend/        # Vue 3 SPA
├── SSoT/                # Source of Truth documents
└── package.json         # Root workspace config
```

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

Pastikan PostgreSQL 17 berjalan, lalu buat database `tkd_setra`.

```bash
# Copy .env.example ke .env dan sesuaikan
cp apps/backend/.env.example apps/backend/.env

# Jalankan database setup
pnpm db:setup

# Set password administrator
pnpm --filter @tkd-setra/backend run db:seed
```

### 3. Development

```bash
# Jalankan frontend dan backend secara paralel
pnpm dev

# Atau jalankan terpisah:
pnpm --filter @tkd-setra/frontend run dev   # Frontend di :5173
pnpm --filter @tkd-setra/backend run dev    # Backend di :3000
```

### 4. Build

```bash
pnpm build
```

## Fitur

### Participant Flow
- Landing Page dengan tombol Participant dan Login Administrator
- Form Biodata dengan validasi (NIK 16 digit, WhatsApp auto 62, email valid)
- Halaman Instruksi dengan persetujuan checkbox
- Quiz: 6 jenis soal (Single Choice, Yes/No, Image Based Question/Answer, Likert, Semantic Differential)
- Game: Image Sliding Puzzle (3x3) dan Search Word (10x10)
- Timer berbasis backend (tidak terpengaruh refresh browser)
- Halaman Selesai dengan tombol Kirim Bukti Tes ke WhatsApp admin
- URL Tes unik per participant

### Admin Dashboard
- Login dengan password saja (JWT HttpOnly Cookie, 24 jam)
- Rate limiting login (3x gagal → lock 5/10 menit/24 jam)
- Menu Participant: list, search, sort, detail (biodata, quiz answers, game results)
- Menu Bank Soal: tambah pertanyaan/game, nonaktifkan, preview
- Menu Settings: durasi tes, instruksi, ucapan terima kasih/maaf, maintenance mode
- Horizontal carousel navigation (bukan sidebar)
- Logout di pojok kanan atas

### Game Engine
- **Image Sliding Puzzle**: 3x3, Cloudinary URL, keyboard + swipe, eye preview, step counter
- **Search Word**: 10x10 grid, 1-9 kata, 4 arah (➡⬇↘↗), drag/swipe, kata ditemukan ditandai permanen

### Security
- Argon2 password hashing
- JWT dalam HttpOnly Cookie
- Helmet security headers
- CORS configuration
- Prepared statements (SQL injection protection)
- Error handling tanpa stack trace/SQL error ke client

## API Endpoints

### Public (Participant)
| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/participant/biodata` | Submit biodata, buat tes |
| GET | `/api/participant/test/:token` | Ambil status tes |
| GET | `/api/participant/instruction/:token` | Ambil instruksi |
| POST | `/api/participant/start-test/:token` | Mulai tes |
| GET | `/api/participant/quiz/:token` | Ambil soal saat ini |
| POST | `/api/participant/quiz/:token/answer` | Submit jawaban |
| GET | `/api/participant/game/:token` | Ambil game saat ini |
| POST | `/api/participant/game/:token/result` | Submit hasil game |
| GET | `/api/participant/finish/:token` | Ambil ucapan selesai |

### Admin Auth
| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/admin/login` | Login |
| POST | `/api/admin/logout` | Logout |
| GET | `/api/admin/session` | Cek session |
| GET | `/api/admin/lock-status` | Status lock login |

### Admin Protected
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/admin/participants` | List participant |
| GET | `/api/admin/participants/:id` | Detail participant |
| GET | `/api/admin/questions` | List pertanyaan |
| GET | `/api/admin/questions/:id` | Detail pertanyaan |
| POST | `/api/admin/questions` | Tambah pertanyaan |
| PATCH | `/api/admin/questions/:id/deactivate` | Nonaktifkan pertanyaan |
| GET | `/api/admin/games` | List game |
| GET | `/api/admin/games/:id` | Detail game |
| POST | `/api/admin/games` | Tambah game |
| PATCH | `/api/admin/games/:id/deactivate` | Nonaktifkan game |
| GET | `/api/admin/settings` | Ambil settings |
| PATCH | `/api/admin/settings` | Update settings |

## Environment Variables

Lihat `apps/backend/.env.example` untuk daftar lengkap.

## Sumber Dokumen

Seluruh implementasi mengikuti dokumen SSoT (Source of Truth) di folder `SSoT/`.