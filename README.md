# Knowledge Journal

Journal knowledge harian dengan hierarki Day → Week (Senin–Minggu) → Month, tag many-to-many, database via Google Sheets, backend Google Apps Script, proxy Netlify Functions.

Status: **Semua fitur inti sudah diimplementasikan** — Tags CRUD, Knowledge item CRUD (dengan rich text + multi-tag), hierarki Timeline → Month → Week → Day, Weekly/Monthly Summary editor, dan Tag Detail page. Sudah lolos `npm run build` tanpa error.

## Langkah Setup (lakukan sekali di awal)

### 1. Buka project ini secara lokal
Unzip file yang kamu terima, lalu:
```bash
cd knowledge-journal
npm install
npm run dev
```
Buka `http://localhost:5173` — kamu akan lihat shell app (sidebar desktop / bottom nav mobile) dengan halaman placeholder.

### 2. Buat Google Spreadsheet
1. Buat spreadsheet baru di Google Sheets, beri nama `Knowledge Journal DB`.
2. Buka **Extensions > Apps Script**.
3. Hapus isi default `Code.gs`, lalu paste seluruh isi file `apps-script/Code.gs` dari project ini.
4. Di dropdown fungsi (sebelah tombol Run), pilih `setupSheets`, klik **Run**. Izinkan permission saat diminta.
   Ini otomatis membuat 4 sheet (`Knowledge`, `Tags`, `WeeklySummary`, `MonthlySummary`) lengkap dengan header kolom.

### 3. Set Shared Secret
1. Di Apps Script editor, buka **Project Settings** (ikon gear) > **Script Properties**.
2. Tambah property: key = `SHARED_SECRET`, value = string acak apapun (mis. generate lewat `openssl rand -hex 16` atau password manager).
3. Catat nilai ini — akan dipakai lagi di step Netlify env var.

### 4. Deploy Apps Script sebagai Web App
1. Klik **Deploy > New deployment**.
2. Pilih tipe **Web app**.
3. Execute as: **Me**. Who has access: **Anyone**.
4. Klik **Deploy**, izinkan permission.
5. Copy **Web app URL** yang muncul — ini nilai `APPS_SCRIPT_URL`.

### 5. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial setup: Knowledge Journal FASE 0"
gh repo create knowledge-journal --private --source=. --push
```
(atau buat repo manual di GitHub lalu `git remote add origin ...` seperti biasa)

### 6. Connect ke Netlify
1. Di Netlify dashboard: **Add new site > Import an existing project**, pilih repo GitHub di atas.
2. Build command & publish directory sudah otomatis terbaca dari `netlify.toml` (`npm run build` / `dist`).
3. Sebelum deploy pertama, buka **Site settings > Environment variables**, tambahkan:
   - `APPS_SCRIPT_URL` = URL dari step 4
   - `APPS_SCRIPT_SHARED_SECRET` = value dari step 3
4. Deploy.

### 7. Verifikasi
Setelah live, buka console browser di site Netlify-mu dan jalankan:
```js
fetch('/.netlify/functions/kj-api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'ping' }),
}).then((r) => r.json()).then(console.log)
```
Kalau muncul `{ ok: true, result: { message: 'pong' } }` — seluruh pipeline (Netlify → Apps Script → Sheets) sudah tersambung dengan benar.

### 8. Password gate (aman dari inspect)
Password dicek di **server** (Netlify Function `check-password.js`), bukan di kode frontend — jadi tidak akan pernah muncul kalau di-inspect/lihat source di browser.

Tambahkan environment variable ini di Netlify dashboard (**bukan** diawali `VITE_`, supaya tidak ikut ter-bundle ke frontend):
- `SITE_PASSWORD` = `vcknowledge` (atau ganti sesuai kebutuhan, kapan saja, tanpa perlu rebuild kode)

**Testing lokal**: `npm run dev` biasa (Vite saja) **tidak bisa** menjalankan Netlify Function, jadi cek password akan gagal terhubung. Untuk tes lokal, install Netlify CLI lalu jalankan lewat itu:
```bash
npm install -g netlify-cli
netlify dev
```
Buat file `.env` lokal (tidak di-commit) berisi `SITE_PASSWORD=vcknowledge` supaya `netlify dev` bisa baca variabel yang sama.

## Struktur Project
Lihat komentar di masing-masing file `src/services/api/*.ts` untuk placeholder fitur yang akan diisi di fase berikutnya.

## PENTING: Update Apps Script kamu
Backend Apps Script sekarang sudah lengkap (Tags, Knowledge, Summary CRUD) — bukan cuma `setupSheets()` lagi. Kalau kamu sudah pernah deploy versi awal (yang cuma ada `ping`), **wajib update**:

1. Buka Apps Script editor project kamu.
2. Select-all isi `Code.gs` yang lama, hapus.
3. Paste seluruh isi `apps-script/Code.gs` yang baru (dari zip ini).
4. Klik **Terapkan (Deploy) > Kelola deployment (Manage deployments)**.
5. Klik ikon pensil (Edit) di deployment yang sudah ada.
6. Di dropdown **Version**, pilih **New version**.
7. Klik **Deploy**.

**Kenapa harus "New version"?** Karena menyimpan kode di editor Apps Script TIDAK otomatis memperbarui web app yang sudah live — web app tetap menjalankan snapshot kode versi lama sampai kamu deploy versi baru secara eksplisit. URL web app-nya tetap sama, jadi tidak perlu update env var Netlify.

## Fitur yang sudah bisa dipakai
- **Tags**: tambah/edit/hapus tag dengan 7 pilihan warna, klik tag untuk lihat semua knowledge dengan tag itu
- **Knowledge harian**: tambah/edit/hapus item (judul, rich text description, multi-tag), navigasi hari sebelum/berikutnya
- **Timeline**: ringkasan bulan-bulan yang ada knowledge-nya, shortcut ke hari ini
- **Month/Week page**: drill-down dari bulan → minggu → hari, plus editor ringkasan mingguan & bulanan (rich text, tersimpan terpisah)
- **Tambah cepat**: tombol "+" di sidebar (desktop) atau bottom nav (mobile) untuk langsung catat knowledge hari ini dari halaman manapun
