# Question Bank & Test Engine

**Status:** 🔒 LOCKED

Seluruh isi pada BAB ini telah disepakati dan tidak boleh diubah tanpa persetujuan pengguna.

---

# 6.1 Tujuan

BAB ini mendefinisikan aturan mengenai:

- Bank Soal
- Test Engine
- Urutan Tes
- Snapshot Tes
- Penyimpanan Jawaban
- Timer
- Penyelesaian Tes

Seluruh implementasi Frontend, Backend, API dan Database wajib mengikuti aturan pada BAB ini.

---

# 6.2 Jenis Soal

Sistem hanya mendukung delapan jenis soal.

## Quiz

- Single Choice Question
- Yes / No Question
- Image Based Question
- Image Based Answer
- Likert Scale
- Semantic Differential Scale

## Game

- Image Sliding Puzzle
- Search Word

Jenis soal bersifat tetap.

---

# 6.3 Struktur Tes

Tes dibagi menjadi dua tahap.

Tahap pertama:

- Quiz

Tahap kedua:

- Game

Participant wajib menyelesaikan seluruh Quiz terlebih dahulu sebelum memasuki tahap Game.

Game tidak dapat dikerjakan sebelum seluruh Quiz selesai.

---

# 6.4 Bank Soal

Bank Soal dipisahkan menjadi dua kelompok.

## Quiz

Berisi seluruh soal Quiz.

## Game

Berisi seluruh Game.

Masing-masing kelompok memiliki urutan soal sendiri.

---

# 6.5 Status Soal

Setiap soal memiliki salah satu status berikut.

## Aktif

- Digunakan pada Tes.
- Ditampilkan pada Frontend Administrator.
- Dapat dilakukan Full Preview.

## Non Aktif

- Tidak digunakan pada Tes.
- Tidak ditampilkan pada Frontend.
- Tetap tersimpan di Database.

Perubahan status hanya berlaku bagi Participant yang belum memulai Tes.

---

# 6.6 Nomor Urut

Quiz dan Game memiliki Nomor Urut yang terpisah.

Contoh:

## Quiz

1

2

3

4

...

## Game

1

2

3

...

Nomor Urut diberikan secara otomatis ketika Administrator membuat soal baru.

Administrator tidak dapat mengubah Nomor Urut melalui Frontend.

Perubahan Nomor Urut hanya dilakukan melalui Database.

Frontend dan Backend otomatis mengikuti Nomor Urut terbaru.

---

# 6.7 Snapshot Tes

Snapshot Tes dibentuk satu kali ketika Participant menekan tombol **Mulai Tes**.

Snapshot terdiri dari seluruh soal yang berstatus **Aktif** pada saat tersebut.

Snapshot digunakan hingga Tes selesai.

Snapshot juga menyimpan konfigurasi Game yang berlaku saat Participant memulai Tes, termasuk durasi Game dan daftar kata Search Word yang digunakan.

Perubahan Bank Soal setelah Snapshot terbentuk tidak memengaruhi Participant yang sedang mengerjakan Tes.

Perubahan hanya berlaku bagi Participant yang belum memulai Tes.

---

# 6.8 Engine Penyusun Tes

Saat Participant memulai Tes, sistem menjalankan proses berikut.

1. Mengambil seluruh Quiz yang berstatus Aktif.
2. Mengurutkan Quiz berdasarkan Nomor Urut.
3. Membentuk Snapshot Quiz.
4. Menampilkan Quiz satu per satu.

Apabila seluruh Quiz berhasil diselesaikan sebelum waktu habis.

Sistem:

1. Mengambil seluruh Game yang berstatus Aktif.
2. Mengurutkan Game berdasarkan Nomor Urut.
3. Membentuk Snapshot Game.
4. Menjalankan Game satu per satu.

---

# 6.9 Penyimpanan Jawaban

Sistem hanya menyimpan hasil akhir permainan.
Sistem tidak menyimpan aktivitas permainan secara terus-menerus.
Penyimpanan dilakukan saat permainan selesai atau saat waktu permainan habis.

Proses:

Participant menjawab

↓

Jawaban disimpan ke Database

↓

Sistem menampilkan soal berikutnya

Tidak terdapat tombol Submit di akhir Tes.

Pendekatan ini memastikan jawaban tetap tersimpan apabila:

- Browser ditutup.
- Browser di-refresh.
- Koneksi internet terputus.
- Durasi Tes habis.

---

# 6.10 Penyimpanan Hasil Quiz

Sistem menyimpan:

- Identitas Participant.
- Identitas Soal.
- Jawaban yang dipilih.
- Waktu penyimpanan.

Sistem tidak melakukan penilaian.

---

# 6.11 Penyimpanan Hasil Game

## Image Sliding Puzzle

Sistem menyimpan:

- Status.
- Durasi.
- Jumlah Langkah.

---

## Search Word

- Daftar kata ditentukan Administrator saat membuat Game.
- Daftar kata menjadi bagian dari Snapshot Tes.
- Perubahan daftar kata tidak memengaruhi Participant yang telah memulai Tes.
- Kata yang berhasil ditemukan dicatat satu per satu oleh sistem.
- Jumlah kata ditemukan dihitung berdasarkan data tersebut.

Sistem menyimpan:

- Status.
- Durasi.
- Jumlah Kata yang berhasil ditemukan.
- Daftar kata yang berhasil ditemukan oleh Participant.

---

# 6.12 Timer Quiz

Quiz menggunakan satu Timer untuk seluruh Quiz.

Durasi default:

**120 Menit**

Durasi dapat diubah Administrator melalui halaman Settings.

Timer dimulai ketika Participant menekan tombol **Mulai Tes**.

Timer menggunakan sistem hitung mundur.

---

# 6.13 Perilaku Timer Quiz

Timer tetap berjalan meskipun:

- Browser di-refresh.
- Browser ditutup.
- Participant kehilangan koneksi internet.
- URL dibuka pada Tab baru.

Saat Participant kembali ke Tes, sistem menampilkan sisa waktu yang sebenarnya.

Timer tidak pernah terjeda selama masih berada dalam masa Tes.

---

# 6.14 Penyelesaian Quiz

Apabila seluruh Quiz berhasil diselesaikan sebelum waktu habis.

Sistem otomatis melanjutkan ke tahap Game.

Apabila waktu Quiz habis sebelum seluruh Quiz selesai.

Tes langsung dinyatakan selesai.

Participant tidak dapat melanjutkan ke Game.

Sistem menampilkan halaman Maaf.

---

# 6.15 Timer Game

Setiap Game memiliki Timer sendiri.

Durasi default:

**3 Menit**

Durasi ditentukan saat Administrator membuat Game.

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

# 6.16 Penyelesaian Game

Apabila Participant berhasil menyelesaikan Game sebelum waktu habis.

Sistem otomatis melanjutkan ke Game berikutnya.

Apabila waktu Game habis.

Sistem:

- Menyimpan hasil terakhir.
- Menyimpan Status.
- Menyimpan Durasi.
- Menyimpan hasil sesuai jenis Game.

Kemudian otomatis melanjutkan ke Game berikutnya.

---

# 6.17 Penyelesaian Tes

Tes dinyatakan selesai apabila:

- Seluruh Quiz selesai.
- Seluruh Game selesai.

Sistem menampilkan:

- Ucapan Terima Kasih.
- Tombol Kirim Bukti Tes.

---

# 6.18 Tes Berakhir Karena Waktu Habis

Tes dinyatakan selesai apabila waktu Quiz habis sebelum seluruh Quiz selesai.

Sistem:

- Menghentikan Tes.
- Tidak menjalankan Game.
- Menampilkan Ucapan Maaf.
- Menampilkan Tombol Kirim Bukti Tes.

---

# 6.19 Prinsip Timer

Seluruh Timer menggunakan waktu Backend sebagai acuan utama.

Frontend hanya menampilkan sisa waktu yang diberikan oleh Backend.

Perubahan waktu pada perangkat Participant tidak memengaruhi Timer.

Refresh Browser tidak memengaruhi Timer.

Kehilangan koneksi internet tidak menghentikan Timer.

---

# 6.20 Prinsip Test Engine

Test Engine dirancang dengan prinsip:

- Konsisten.
- Sederhana.
- Ringan.
- Aman.
- Scalable.

Seluruh implementasi Test Engine wajib mengikuti prinsip tersebut.

---