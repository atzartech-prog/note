# Weblog & Catatan (Retro, DIY, Tips & Tricks)

Weblog interaktif responsif berbasis Single Page Application (SPA) yang memuat data secara dinamis dari file JSON. Dibuat menggunakan HTML5, JavaScript Modern, Bootstrap 5, dan CSS Custom dengan tampilan modern dan elegan (Dark/Light mode support).

## Fitur Utama

- **Desain Premium**: Menggunakan font modern (Outfit & Space Grotesk), efek Glassmorphism, shadow, dan mikro-animasi pada komponen.
- **Sistem Tema Dinamis**: Mendukung Mode Gelap (Dark Mode) dan Mode Terang (Light Mode) dengan penyimpanan preferensi di LocalStorage.
- **Navigasi SPA Tanpa Reload**: Menggunakan sistem router berbasis hash URL (`#/`, `#/post/:id`, `#/category/:category`, dll.) sehingga artikel dapat dibagikan dengan link unik.
- **Pagination Canggih**: Secara otomatis membatasi tampilan maksimal 8 postingan per halaman di Home maupun hasil filter.
- **Pencarian Artikel (Full-Text Search)**: Fitur pencarian instan pada judul, ringkasan, isi konten, dan tag artikel.
- **Filter Kategori**: Mengelompokkan artikel berdasarkan kategori DIY, Retro Gadgets, dan Tips & Tricks.
- **Fallback Visual Cerdas**: Jika gambar sampul artikel tidak dimuat/hilang, aplikasi secara otomatis merender gambar SVG gradien dengan ikon kategori terkait.
- **Tombol Salin Link**: Mempermudah pembaca menyalin alamat artikel yang sedang dibuka langsung ke clipboard mereka.

## Struktur Folder

```
weblogdancatan/
├── index.html       # Kerangka utama weblog
├── style.css        # Desain layout, variabel warna, tema & animasi
├── app.js           # Sistem routing SPA, pencarian, pagination, & logika tema
├── posts.json       # Database artikel berformat JSON
└── README.md        # Panduan penggunaan repository
```

## Cara Menjalankan Secara Lokal

1. Buka folder ini di komputer Anda.
2. Jalankan server lokal untuk menghindari isu CORS saat memuat file JSON (misal menggunakan VS Code Live Server, python `-m http.server`, atau extension server lainnya).
3. Akses alamat server lokal (misalnya `http://localhost:5500`) melalui web browser Anda.

## Panduan Push ke GitHub & Mengaktifkan GitHub Pages

Ikuti langkah-langkah berikut di Terminal/Command Prompt Anda untuk mengunggah weblog ini ke GitHub:

### 1. Inisialisasi Git Lokal
```bash
git init
git add .
git commit -m "Initial commit: Weblogdancatan SPA"
```

### 2. Hubungkan ke Repository GitHub Anda
Buat repository baru di GitHub dengan nama `weblogdancatan` (kosong, tanpa README/License), lalu jalankan perintah berikut:
```bash
# Pastikan Anda mengganti 'username' dengan username GitHub Anda sendiri
git remote add origin https://github.com/username/weblogdancatan.git
git branch -M main
git push -u origin main
```

### 3. Aktifkan GitHub Pages
1. Masuk ke halaman repository Anda di GitHub.
2. Pergi ke tab **Settings** (Pengaturan).
3. Di menu sidebar kiri, pilih **Pages**.
4. Pada bagian **Build and deployment > Source**, pilih **Deploy from a branch**.
5. Pada bagian **Branch**, pilih **main** dan folder **/(root)**, lalu klik **Save**.
6. Tunggu 1-2 menit. Link weblog publik Anda akan muncul di bagian atas halaman Settings tersebut (misal: `https://username.github.io/weblogdancatan/`).
