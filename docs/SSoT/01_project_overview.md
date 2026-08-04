# Project Overview

**Status:** 🔒 LOCKED

Seluruh isi pada BAB ini telah disepakati dan tidak boleh diubah tanpa persetujuan pengguna.

---

# 1.1 Tujuan Aplikasi

Online Test Web Application merupakan aplikasi berbasis web yang digunakan untuk menyelenggarakan tes secara online.

Tujuan utama aplikasi adalah:

- Menyediakan media pelaksanaan tes online.
- Menampilkan berbagai jenis soal kepada Participant.
- Mencatat seluruh jawaban Participant.
- Mencatat hasil penyelesaian Game.
- Menyimpan seluruh data ke PostgreSQL.
- Menyediakan Dashboard Administrator.
- Mengirim data hasil tes secara otomatis ke Spreadsheet melalui Backend.

Aplikasi ini bukan merupakan sistem penilaian.

---

# 1.2 Ruang Lingkup

Aplikasi dikembangkan sebagai sistem **Single-Tenant**.

Karakteristik sistem:

- Satu Organisasi.
- Satu Aplikasi.
- Satu Database PostgreSQL.
- Satu Dashboard Administrator.
- Satu Bank Soal.
- Satu Konfigurasi Sistem.

Sistem tidak dirancang untuk mendukung Multi-Tenant.

---

# 1.3 Platform

Platform yang didukung:

- Web Browser Desktop.
- Web Browser Mobile.

Platform yang tidak didukung:

- Android Native.
- iOS Native.
- Desktop Application.

Seluruh akses dilakukan melalui Web Browser.

---

# 1.4 Bahasa

Bahasa aplikasi:

- Bahasa Indonesia.

Sistem tidak mendukung:

- Multi Language.
- Internationalization (i18n).
- Localization.

Seluruh antarmuka, validasi, dan pesan sistem menggunakan Bahasa Indonesia.

---

# 1.5 User Role

Sistem hanya memiliki dua jenis pengguna.

- Administrator.
- Participant.

Jumlah Role bersifat tetap dan tidak dapat ditambah.

---

# 1.6 Prinsip Penilaian

Sistem tidak melakukan proses penilaian dalam bentuk apa pun.

Sistem tidak menghitung:

- Skor.
- Nilai.
- Jawaban benar.
- Jawaban salah.
- Persentase.
- Ranking.
- Kelulusan.
- Interpretasi hasil.
- Analisis psikologi.
- Rekomendasi hasil.

Sistem hanya berfungsi sebagai media pengumpulan data.

Seluruh proses analisis dilakukan di luar aplikasi.

---

# 1.7 Data Quiz

Untuk setiap Quiz, sistem hanya menyimpan:

- Identitas Participant.
- Identitas Pertanyaan.
- Jawaban yang dipilih Participant.
- Waktu penyimpanan jawaban.

Sistem tidak mengevaluasi jawaban.

---

# 1.8 Data Game

## Image Sliding Puzzle

Sistem menyimpan:

- Status penyelesaian.
- Durasi penyelesaian.
- Jumlah langkah (Step Count).

Sistem tidak menyimpan:

- Replay permainan.
- Riwayat perpindahan tile.
- Posisi tile setiap langkah.
- Aktivitas drag atau swipe.
- Event log permainan.

---

## Search Word

Sistem menyimpan:

- Status penyelesaian.
- Durasi penyelesaian.
- Kata yang berhasil ditemukan.

Sistem tidak menyimpan:

- Riwayat pencarian kata.
- Koordinat seleksi kata.
- Replay permainan.
- Aktivitas drag.
- Event log permainan.

---

# 1.9 Prinsip Penyimpanan Data

Sistem hanya menyimpan data yang diperlukan untuk:

- Administrasi.
- Pelaksanaan Tes.
- Integritas data.
- Pengiriman data ke Spreadsheet.

Sistem tidak menyimpan:

- Replay aktivitas pengguna.
- Mouse tracking.
- Gesture tracking.
- Riwayat interaksi detail.
- Event log yang tidak diperlukan.

Pendekatan ini bertujuan untuk:

- Menjaga ukuran Database tetap ringan.
- Meningkatkan performa query.
- Mempermudah proses Backup.
- Mempermudah pemeliharaan sistem.
- Menyederhanakan proses pengembangan.

---

# 1.10 Arsitektur Data

Aplikasi menggunakan PostgreSQL sebagai sumber data utama (Source of Truth).

Frontend hanya bertugas:

- Menampilkan data.
- Mengirim data.
- Menampilkan status.

Backend bertugas:

- Memproses Business Rules.
- Melakukan validasi.
- Mengelola autentikasi.
- Mengelola integritas data.
- Mengirim data ke Spreadsheet secara otomatis.

Seluruh keputusan bisnis berada pada Backend.

---

# 1.11 Prinsip Kesederhanaan

Aplikasi dirancang dengan prinsip:

- Ringan.
- Cepat.
- Mudah dipelihara.
- Mudah dikembangkan.
- Konsisten.

Setiap fitur baru harus mengikuti prinsip tersebut.

---