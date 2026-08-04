# Game Engine

**Status:** 🔒 LOCKED

Seluruh isi pada BAB ini telah disepakati dan tidak boleh diubah tanpa persetujuan pengguna.

---

# 7.1 Tujuan

BAB ini mendefinisikan seluruh aturan pelaksanaan Game pada sistem.

Game merupakan bagian dari Tes dan hanya dapat dijalankan setelah seluruh Quiz berhasil diselesaikan.

Seluruh implementasi Frontend, Backend, API, dan Database wajib mengikuti aturan pada BAB ini.

---

# 7.2 Jenis Game

Sistem hanya mendukung dua jenis Game.

- Image Sliding Puzzle
- Search Word

Jenis Game bersifat tetap.

---

# 7.3 Urutan Game

Game dijalankan berdasarkan Nomor Urut Game.

Urutan Game dimulai dari Nomor Urut terkecil hingga terbesar.

Contoh:

Game 1

↓

Game 2

↓

Game 3

Sistem tidak menggunakan:

- Random Game
- Shuffle Urutan Game
- Pemilihan Game oleh Participant

---

# 7.4 Preview Administrator

Administrator dapat melakukan Full Preview setiap Game.

Preview digunakan untuk:

- Melihat tampilan Game.
- Menguji pengalaman pengguna (UI/UX).

Preview tidak:

- Membuat data Participant.
- Menyimpan hasil.
- Menyimpan durasi.
- Menyimpan langkah.
- Menyimpan jumlah kata.
- Mengubah Database.

Preview hanya merupakan simulasi.

---

# 7.5 Timer Game

Setiap Game memiliki Timer sendiri.

Durasi default:

**3 Menit**

Durasi ditentukan ketika Administrator membuat Game baru.

Setiap Game memiliki Timer yang berdiri sendiri.

Contoh:

Game 1

↓

03:00

↓

Game 2

↓

03:00

↓

Game 3

↓

03:00

---

# 7.6 Perilaku Timer

Timer tetap berjalan berdasarkan waktu Backend.

Timer tidak dipengaruhi oleh:

- Refresh Browser.
- Penutupan Browser.
- Perubahan jam perangkat.
- Kehilangan koneksi internet.

Saat Participant kembali ke Tes, sistem menampilkan sisa waktu yang sebenarnya.

---

# 7.7 Image Sliding Puzzle

Image Sliding Puzzle menggunakan satu gambar sebagai sumber Puzzle.

Administrator hanya memasukkan URL gambar Cloudinary.

Administrator tidak mengunggah gambar melalui Web Application.

---

# 7.8 Ukuran Puzzle

Ukuran Puzzle bersifat tetap.

```
3 × 3
```

Ukuran lain tidak didukung.

Administrator tidak dapat mengubah ukuran Puzzle.

---

# 7.9 Pembentukan Puzzle

Saat Game dimulai, sistem:

1. Mengambil gambar dari Cloudinary.
2. Membagi gambar menjadi sembilan bagian.
3. Menyisakan satu ruang kosong.
4. Mengacak posisi Puzzle.
5. Menampilkan Puzzle kepada Participant.

---

# 7.10 Pengacakan Puzzle

Pengacakan dilakukan sepenuhnya oleh sistem.

Karakteristik:

- Setiap Participant memperoleh susunan Puzzle yang berbeda.
- Setiap Preview Administrator menghasilkan susunan Puzzle yang berbeda.
- Tidak ada susunan awal yang ditentukan Administrator.

---

# 7.11 Interaksi Puzzle

## Desktop

Participant menggunakan:

- Keyboard Arrow.
- Mouse.

## Mobile

Participant menggunakan:

- Swipe Gesture.

Puzzle harus mendukung Desktop dan Mobile secara penuh.

---

# 7.12 Fitur Puzzle

Image Sliding Puzzle:

- Tidak memiliki Hint.
- Tidak memiliki Auto Solve.
- Tidak memiliki Penilaian.
- Tidak memiliki Skor.

Terdapat tombol "eye" untuk Participant dapat melihat Preview gambar utuh.

---

# 7.13 Hasil Puzzle

Saat Puzzle selesai atau waktu habis, sistem menyimpan:

- Status.
- Durasi.
- Jumlah Langkah.

Sistem tidak menyimpan:

- Replay.
- Riwayat perpindahan tile.
- Posisi tile setiap langkah.
- Aktivitas Drag.
- Event Log permainan.

---

# 7.14 Search Word

Search Word menggunakan Grid berukuran tetap.

Ukuran Grid:

```
10 × 10
```

Ukuran Grid tidak dapat diubah.

---

# 7.15 Daftar Kata

Administrator hanya memasukkan daftar kata.

Ketentuan:

- Minimal 1 kata.
- Maksimal 9 kata.
- Panjang setiap kata maksimal 10 huruf.

Administrator tidak menentukan:

- Posisi kata.
- Arah kata.
- Huruf pengisi.
- Susunan Grid.

Seluruhnya dibuat otomatis oleh sistem.

---

# 7.16 Pembentukan Grid

Saat Game dimulai, sistem:

1. Membuat Grid 10 × 10.
2. Menempatkan seluruh kata.
3. Menentukan arah setiap kata secara acak.
4. Mengisi seluruh sel kosong menggunakan huruf acak.

---

# 7.17 Arah Kata

Sistem hanya menggunakan empat arah berikut.

- ➡ Kiri ke Kanan
- ⬇ Atas ke Bawah
- ↘ Atas Kiri ke Bawah Kanan
- ↗ Bawah Kiri ke Atas Kanan

Sistem tidak menggunakan:

- ⬅ Kanan ke Kiri
- ⬆ Bawah ke Atas
- ↖ Bawah Kanan ke Atas Kiri
- ↙ Atas Kanan ke Bawah Kiri

---

# 7.18 Persilangan Kata

Dua atau lebih kata diperbolehkan menggunakan huruf yang sama pada satu sel.

Persilangan huruf merupakan perilaku yang sah dan didukung oleh sistem.

---

# 7.19 Huruf Pengisi

Huruf selain kata dihasilkan secara otomatis oleh sistem.

Karakteristik:

- Acak.
- Berbeda untuk setiap Participant.
- Berbeda untuk setiap Preview Administrator.

---

# 7.20 Interaksi Search Word

## Desktop

Participant:

- Klik huruf pertama.
- Drag hingga huruf terakhir.
- Lepaskan Mouse.

## Mobile

Participant:

- Sentuh huruf pertama.
- Swipe hingga huruf terakhir.
- Lepaskan sentuhan.

---

# 7.21 Validasi Kata

Setelah Drag atau Swipe selesai, sistem memeriksa:

- Jalur membentuk garis lurus.
- Jalur sesuai salah satu arah yang diizinkan.
- Huruf membentuk kata yang tersedia.

Apabila valid:

- Kata ditandai sebagai ditemukan.
- Jumlah kata ditemukan bertambah.

Apabila tidak valid:

- Seleksi dibatalkan.

---

# 7.22 Kata Ditemukan

Kata yang telah ditemukan:

- Tidak dapat dipilih kembali.
- Tetap ditandai pada Grid.
- Tetap ditandai pada daftar kata.

---

# 7.23 Hasil Search Word

Saat Game selesai atau waktu habis, sistem menyimpan:

- Status.
- Durasi.
- Jumlah kata yang berhasil ditemukan.
- Kata apa saja yang ditemukan.

Sistem tidak menyimpan:

- Urutan pencarian kata.
- Waktu penemuan setiap kata.
- Posisi Drag.
- Replay permainan.
- Aktivitas Participant.

---

# 7.24 Penyelesaian Game

Game dinyatakan selesai apabila:

- Participant berhasil menyelesaikan Game.

atau

- Durasi Game habis.

Apabila waktu habis:

- Sistem menyimpan hasil terakhir.
- Sistem otomatis melanjutkan ke Game berikutnya apabila masih tersedia.

---

# 7.25 Responsivitas

Seluruh Game wajib mendukung:

- Desktop.
- Tablet.
- Mobile.

Antarmuka harus tetap konsisten pada seluruh ukuran layar.

---

# 7.26 Prinsip Game Engine

Game Engine dirancang dengan prinsip:

- Ringan.
- Konsisten.
- Responsif.
- Mudah dipelihara.
- Scalable.

Seluruh implementasi wajib mengikuti prinsip tersebut.

---
