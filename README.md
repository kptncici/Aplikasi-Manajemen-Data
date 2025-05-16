# 📦 Aplikasi Manajemen Data

Aplikasi ini dibuat untuk membantu pengguna dalam mengelola dan menyimpan data secara lokal 
menggunakan **SQLite** serta dapat disinkronkan ke **Firebase** ketika koneksi tersedia.

---

## 🚀 Fitur Utama

- CRUD Data Lokal (Create, Read, Update, Delete)
- Penyimpanan lokal menggunakan **SQLite**
- Sinkronisasi otomatis ke **Firebase**
- Antarmuka web yang ringan dan modern (HTML + CSS + JavaScript)
- Backend menggunakan **Node.js (Express)**

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js + Express
- **Database Lokal**: SQLite
- **Cloud Sync**: Firebase (Firestore)
- **Version Control**: Git & GitHub

---

## ⚙️ Cara Menjalankan Aplikasi

1. Clone Repository
   git clone https://github.com/kptncici/Aplikasi-Manajemen-Data.git

   cd Aplikasi-Manajemen-Data

2. Masuk ke folder project:
   cd nama-folder

3. Install dependencies:
   npm install

4. Jalankan server:
   node server.js
   Server akan berjalan di http://localhost:3000

## 🔗 Link Firebase dan konfigurasi
Pastikan file `serviceAccountKey.json` tersedia di root folder.

---

## 🔐 Keamanan
⚠️ File serviceAccountKey.json tidak disertakan di repository demi alasan keamanan. Untuk dapat menyinkronkan ke Firebase, 
buat file tersebut secara manual dari Firebase Console, dan letakkan di:

./serviceAccountKey.json


---

## 📁 Struktur Folder
Aplikasi-Manajemen-Data/
│
├── public/               # File frontend (HTML, CSS, JS)
├── firebase/             # Folder untuk file sinkronisasi Firebase
├── serviceAccountKey.json (ignored) 
├── database.db           # SQLite database
├── server.js             # File utama backend
├── .gitignore
└── README.md             # Dokumentasi ini


---
## 🙌 Kontribusi
Pull Request sangat terbuka! Silakan fork repo ini, tambahkan fitur atau perbaikan bug, lalu buat PR.

---
## Nama Kelompok: Kelompok 2

Anggota:
- Nurfadilla Rhamadani (23621039)
- Diva Riantika Ramadhanty (23621035)
- Wa Shinta (23621012)
- Magfira Rahma Arilaha (23621001)
- Gracelia Putri B.M (22621019)
- Muhammad Fachrul Syam (23621057)


Link GitHub: https://github.com/kptncici/Aplikasi-Manajemen-Data.git

---
## 📄 Lisensi
Proyek ini dilisensikan di bawah MIT License.

---
Setelah kamu paste ke file `README.md`, jalankan perintah ini untuk commit dan push:

git add README.md
git commit -m "Add complete documentation in README.md"
git push


