# Metrologi Legal — Frontend

Stack: React + Vite + TypeScript, Tailwind CSS, TanStack Query, React Router, React Hook Form + Zod.

## Menjalankan project

```bash
bun install
cp .env.example .env   # sesuaikan VITE_API_URL kalau backend tidak di localhost:3000
bun dev
```

Buka `http://localhost:5173`. Pastikan backend Elysia sudah jalan di `VITE_API_URL` (default `http://localhost:3000`) dan CORS-nya mengizinkan origin `http://localhost:5173`.

## Yang sudah dibangun

- **Auth**: halaman login (`/login`), simpan JWT di `localStorage`, auto-redirect ke login kalau token invalid/expired (401), ambil profil lengkap dari `GET /auth/me`.
- **Layout**: sidebar navigasi 3 modul (Dokumen Mutu, Peneraan, Pengawasan) + Dashboard, mengikuti role user yang login.
- **Modul Dokumen Mutu** (lengkap, terhubung ke API):
  - List dokumen aktif + filter kategori
  - List dokumen kedaluwarsa
  - Form tambah dokumen baru (upload file)
  - Form revisi dokumen (nomor versi naik otomatis di backend)
  - Buka/lihat file (di-fetch sebagai blob karena endpoint butuh Bearer token, lalu dibuka di tab baru)
- **Peneraan** dan **Pengawasan**: masih placeholder, menyusul.

## Struktur folder

```
src/
  lib/          # api client, auth context, util, data-fetching per modul
  components/   # layout, protected route, komponen UI dasar (Button, Input, Card, Table, Badge)
  pages/        # halaman per route, dikelompokkan per modul
```

## Menambah modul baru

Pola yang dipakai di Dokumen Mutu bisa dicontoh untuk Peneraan/Pengawasan:
1. Buat `src/lib/<modul>.ts` — types + fungsi API (pakai instance `api` dari `src/lib/api.ts`).
2. Buat halaman-halaman di `src/pages/<modul>/`.
3. Daftarkan route di `src/App.tsx`.

## Catatan keamanan role

Tombol aksi yang butuh role tertentu (mis. "Tambah / Revisi" cuma untuk `admin`/`petugas_penera`) disembunyikan di frontend, tapi **backend tetap jadi sumber kebenaran otorisasi** — validasi role di frontend ini murni untuk UX, bukan pengganti guard di Elysia.
