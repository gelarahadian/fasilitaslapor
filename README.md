# FasilitasLapor

Prototype web untuk penelitian "Pengembangan Platform Pelaporan Kerusakan Fasilitas Umum Berbasis Web dengan Crowdsourcing Validation dan Priority Scoring".

## Struktur

- `app/`: halaman Next.js dan shell aplikasi.
- `components/`: komponen UI utama untuk dashboard, laporan, validasi, scoring, dan pengguna.
- `lib/`: data contoh, tipe data, dan rumus priority scoring.
- `prisma/schema.prisma`: rancangan database User, Report, Validation, dan konfigurasi bobot.
- `PRD_FasilitasLapor_Crowdsourcing_PriorityScoring.docx`: dokumen PRD sumber.

## Fitur Prototype

- Login dan registrasi simulasi.
- Input laporan kerusakan fasilitas umum.
- Daftar laporan dengan filter, pencarian, status, jumlah validasi, dan priority score.
- Crowdsourcing validation dengan tingkat kerusakan 1 sampai 4 dan keputusan konfirmasi/tolak.
- Priority scoring otomatis sesuai formula PRD:

```txt
Priority = (W1 x Tingkat Kerusakan) + (W2 x Jumlah Validasi) + (W3 x Duplikasi) + (W4 x Waktu)
```

- Dashboard monitoring administrator.
- Management user sederhana.

## Menjalankan

```bash
npm install
npm run dev
```

Lalu buka `http://localhost:3000`.

## Akun Demo

- Admin: `admin@fasilitaslapor.test` / password bebas.
- User: `user@fasilitaslapor.test` / password bebas.

Prototype saat ini memakai `localStorage` agar bisa diuji tanpa backend. Skema Prisma sudah disiapkan untuk migrasi ke PostgreSQL/Supabase.

## Backend PostgreSQL/Supabase

Setelah database tersedia, isi `DATABASE_URL` berdasarkan `.env.example`, lalu jalankan:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Route API yang tersedia:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/reports`
- `POST /api/reports`
- `PATCH /api/reports/:id/status`
- `POST /api/validations`
- `POST /api/scoring/recalculate`
- `GET /api/dashboard`

Catatan keamanan: password pada prototype backend masih disimpan apa adanya agar alur penelitian mudah diuji. Untuk rilis produksi, ganti dengan hashing password dan session/token authentication.

## Auth Production Dasar

Aplikasi sekarang memakai session cookie `HttpOnly` dan password bcrypt.

Environment tambahan:

```bash
AUTH_SECRET="isi-dengan-random-secret-minimal-32-karakter"
```

Akun demo setelah seed:

- Admin: `admin@fasilitaslapor.test` / `demo123`
- User: `user@fasilitaslapor.test` / `demo123`

Endpoint yang mengubah data sudah membaca user dari session cookie. Endpoint admin seperti dashboard, update status, user management, dan recalculation scoring menolak akses user biasa.

## Data Runtime

Laporan, validasi, status, dan daftar user sekarang dibaca dari API database. `localStorage` hanya dipakai untuk menyimpan konfigurasi bobot scoring di sisi UI prototype.

## Hardening API

Payload API divalidasi dengan `zod`. Login dibatasi 10 percobaan per menit per IP, registrasi 5 percobaan per menit per IP. Rate limit ini cukup untuk single-instance prototype; untuk production multi-instance gunakan Redis/Upstash agar counter konsisten di semua server.

## Migration Production

Untuk development:

```bash
npm run db:migrate
```

Untuk production deployment:

```bash
npm run db:deploy
```

`db:push` masih bisa dipakai saat prototyping, tetapi migration lebih aman untuk production karena perubahan schema tersimpan sebagai riwayat.

## Upload Foto Supabase Storage

Buat bucket Supabase Storage bernama `report-photos`. Jika bucket public, URL foto dapat langsung dibuka dari `photoUrl`. Jika bucket private, ganti implementasi URL menjadi signed URL.

Environment yang dibutuhkan:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"
SUPABASE_REPORT_PHOTO_BUCKET="report-photos"
```

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh disimpan di server/Vercel environment variable, jangan dipakai di client browser.
