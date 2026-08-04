# Administrator Flow

**Status:** 🔒 LOCKED

Seluruh isi pada BAB ini telah disepakati dan tidak boleh diubah tanpa persetujuan pengguna.

---

# 5.1 Dashboard Administrator

Setelah Login berhasil, Administrator langsung diarahkan ke Dashboard.

Dashboard merupakan satu halaman utama yang berisi navigasi interaktif.

Dashboard tidak menggunakan:

- Sidebar
- Menu bertingkat
- Halaman navigasi terpisah

Navigasi menggunakan tombol horizontal (Horizontal Carousel).

Menu utama terdiri dari:

- Participant
- Bank Soal
- Settings

Pada pojok kanan atas terdapat ikon Logout.

---

# 5.2 Navigasi Dashboard

Perpindahan antar menu tidak memuat halaman baru.

Sistem hanya mengganti konten utama sesuai menu yang dipilih.

Menu yang sedang aktif tetap dipertahankan selama Session masih berlaku.

---

# 5.3 Menu Participant

Ketika menu **Participant** dipilih, Dashboard menampilkan:

- Search Bar.
- Tabel Participant.

Kolom tabel:

| Nama | NIK | Tanggal Lahir | Tempat Lahir | Alamat | Nomor WhatsApp | Email | Status |

Header tabel dapat digunakan untuk melakukan Sorting.

Search digunakan untuk mencari Participant.

---

# 5.4 Status Participant

Status Participant terdiri dari:

- Belum Mulai
- Sedang Mengerjakan
- Selesai
- Waktu Habis

Status diperbarui secara otomatis oleh sistem.

Administrator tidak dapat mengubah Status secara manual.

---

# 5.5 Detail Participant

Administrator dapat membuka Detail Participant.

Detail menampilkan:

## Biodata

- Nama Lengkap.
- Tempat Lahir.
- Tanggal Lahir.
- NIK.
- Alamat.
- Nomor WhatsApp.
- Email.

---

## Hasil Quiz

Menampilkan seluruh pertanyaan dan jawaban yang dipilih Participant.
| Nama | pertanyaan | jawaban dipilih |
Sistem tidak menampilkan:

- Jawaban benar.
- Jawaban salah.
- Nilai.
- Skor.

---

## Hasil Game

Menampilkan:

- Status.
- Durasi.
- Jumlah Langkah (untuk Game yang mendukung Step Count).
- Jumlah Kata Yang ditemukan (Untuk Game Search Word)
- Kata Yang ditemukan (Daftar kata yang ditemukan pada game Search Word (abc, def, ghi, dan seterusnya)

---

# 5.6 Data Participant

Seluruh data Participant bersifat **Read Only**.

Administrator tidak dapat:

- Mengubah Biodata.
- Menghapus Participant.
- Mengaktifkan atau menonaktifkan Participant.
- Mengubah Status Participant.

Apabila diperlukan perubahan data, proses dilakukan langsung pada Database.

---

# 5.7 Menu Bank Soal

Ketika menu **Bank Soal** dipilih, Dashboard menampilkan:

- Search Bar.
- Tombol Tambah Pertanyaan.
- Tabel Pertanyaan.

Kolom tabel:

| Jenis | Tipe | Nomor Urut | Pertanyaan / Pernyataan | Aksi |

---

# 5.8 Jenis Pertanyaan

Kolom **Jenis** terdiri dari:

- Quiz
- Game

---

# 5.9 Tipe Pertanyaan

Jenis **Quiz** terdiri dari:

- Single Choice Question
- Yes / No Question
- Image Based Question
- Image Based Answer
- Likert Scale
- Semantic Differential Scale

Jenis **Game** terdiri dari:

- Image Sliding Puzzle
- Search Word

---

# 5.10 Tambah Pertanyaan

Administrator dapat menambahkan Pertanyaan baru.

Saat membuat Pertanyaan:

- Administrator memilih Jenis Pertanyaan.
- Sistem menampilkan Form sesuai Jenis Pertanyaan.
- Nomor Urut diberikan secara otomatis oleh sistem.

Administrator tidak menentukan Nomor Urut secara manual.

---

# 5.11 Preview

Setiap Pertanyaan memiliki fitur Full Preview.

Full Preview digunakan untuk merasakan pengalaman yang akan diterima Participant.

Preview tidak:

- Membuat Participant.
- Menyimpan Jawaban.
- Menyimpan Durasi.
- Menyimpan Langkah.
- Menyimpan Progress.
- Mengubah Database.

Preview hanya digunakan sebagai simulasi antarmuka dan ujicoba pengalaman participant.

---

# 5.12 Status Pertanyaan

Pertanyaan memiliki salah satu status berikut:

## Aktif

Pertanyaan:

- Digunakan dalam Tes.
- Ditampilkan pada Frontend.
- Dapat dilakukan Preview.

---

## Non Aktif

Pertanyaan:

- Tidak digunakan dalam Tes.
- Tidak ditampilkan pada Frontend.
- Tetap tersimpan di Database.

Perubahan status hanya berlaku bagi Participant yang belum memulai Tes.

---

# 5.13 Pertanyaan Immutable

Pertanyaan yang telah digunakan dalam Tes bersifat **Immutable**.

Administrator tidak dapat:

- Mengubah isi Pertanyaan.
- Mengubah gambar.
- Mengubah tipe Pertanyaan.
- Mengubah pilihan jawaban.
- Mengubah skala jawaban.

Apabila diperlukan perubahan, Administrator wajib membuat Pertanyaan baru.

---

# 5.14 Nomor Urut

Setiap Pertanyaan memiliki Nomor Urut.

Nomor Urut digunakan sebagai urutan penyajian soal.

Nomor Urut diberikan secara otomatis ketika Pertanyaan dibuat.

Perubahan Nomor Urut hanya dilakukan melalui Database.

Frontend tidak menyediakan fitur untuk mengubah Nomor Urut.

---

# 5.15 Menu Settings

Administrator dapat mengubah konfigurasi berikut:

- Durasi Tes.
- Isi Instruksi Tes.
- Isi Ucapan Terima Kasih.
- Isi Ucapan Maaf.
- Status Maintenance.

Perubahan konfigurasi disimpan melalui Backend.

---

# 5.16 Maintenance Mode

Administrator dapat mengaktifkan atau menonaktifkan Maintenance Mode.

## Maintenance Aktif

- Participant baru tidak dapat memulai Tes.
- Participant yang sedang mengerjakan Tes tetap dapat melanjutkan hingga selesai.

## Maintenance Non Aktif

Sistem kembali menerima Participant baru.

---

# 5.17 Logout

Logout dilakukan melalui ikon pada pojok kanan atas Dashboard.

Saat Logout:

- Session dihapus.
- JWT dihapus.
- HttpOnly Cookie dihapus.

Administrator diarahkan kembali ke Landing Page.

---

# 5.18 Export Data

Frontend tidak menyediakan fitur Export.

Setelah Participant menyelesaikan Tes:

1. Backend menyimpan data ke PostgreSQL.
2. Backend secara otomatis mengirim data ke Spreadsheet yang telah dikonfigurasi.

Seluruh proses berjalan tanpa interaksi Administrator.

---

# 5.19 Spreadsheet (LEWATI TAHAP INI)

Spreadsheet digunakan sebagai media administrasi dan analisis data.

Spreadsheet dapat terhubung dengan Database untuk:

- Fetch Data.
- Refresh Data.

Fitur Spreadsheet berada di luar ruang lingkup Web Application.


---

# 5.20 Prinsip Dashboard

Dashboard Administrator dirancang dengan prinsip:

- Sederhana.
- Ringan.
- Cepat.
- Konsisten.
- Berorientasi pada efisiensi administrasi.

Frontend hanya menampilkan data yang masih digunakan sistem.

Data yang berstatus **Non Aktif** tidak ditampilkan pada Dashboard.

---