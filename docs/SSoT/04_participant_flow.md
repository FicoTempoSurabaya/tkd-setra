# BAB 4 — Participant Flow

**Status:** 🔒 LOCKED

Seluruh isi pada BAB ini telah disepakati dan tidak boleh diubah tanpa persetujuan pengguna.

---

# 4.1 Landing Page

Landing Page merupakan halaman pertama yang ditampilkan ketika pengguna membuka aplikasi.

Landing Page hanya terdiri dari:

- Logo Aplikasi.
- Nama Aplikasi.
- Tombol **Participant**.
- Tombol **Login Administrator**.

Landing Page tidak memiliki menu lain.

---

# 4.2 Memulai Tes

Ketika tombol **Participant** dipilih, sistem langsung menampilkan Form Biodata.

Participant tidak perlu melakukan Login.

Terdapat ikon kembali untuk kembali ke Landing Page.

---

# 4.3 Form Biodata

Seluruh field wajib diisi.

Field Biodata terdiri dari:

| Field | Tipe Data | Aturan |
|--------|-----------|--------|
| Nama Lengkap | Text | Wajib diisi |
| Tempat Lahir | Text | Wajib diisi |
| Tanggal Lahir | Date | Format tampilan **dd/mm/yyyy** |
| NIK | Number | Tepat 16 digit |
| Alamat | Text | Wajib diisi |
| Nomor WhatsApp | Number | Maksimal 14 digit. Jika diawali angka **0**, sistem otomatis mengubah menjadi **62** |
| Email | Email | Wajib menggunakan format email yang valid dan mengandung karakter **@** |

---

# 4.4 Validasi Biodata

Sebelum Biodata dikirim, sistem melakukan validasi.

Validasi meliputi:

- Seluruh field wajib diisi.
- NIK harus terdiri dari 16 digit angka.
- Email harus menggunakan format email yang valid.
- Nomor WhatsApp otomatis menggunakan awalan **62** apabila Participant memasukkan angka **0** di awal.

Apabila terdapat data yang tidak valid, sistem menampilkan pesan kesalahan dan proses tidak dilanjutkan.

---

# 4.5 Penyimpanan Biodata

Selama Participant mengisi Biodata:

- Sistem tidak melakukan Auto Save.
- Data belum disimpan ke Database.

Biodata hanya disimpan ketika tombol **Ajukan Tes** dipilih.

---

# 4.6 Ajukan Tes

Saat tombol **Ajukan Tes** dipilih, sistem wajib:

1. Memvalidasi seluruh Biodata.
2. Menyimpan Biodata ke PostgreSQL.
3. Membuat URL Tes yang unik.
4. Membuat Session Tes.
5. Mengalihkan Participant ke halaman Instruksi.

Cara pembentukan URL merupakan detail implementasi.

---

# 4.7 Halaman Instruksi

Sistem hanya memiliki satu halaman Instruksi.

Isi Instruksi dapat diubah oleh Administrator melalui halaman Settings.

Instruksi mendukung:

- Format teks.
- Gambar.

---

# 4.8 Persetujuan

Participant wajib memberikan persetujuan sebelum memulai Tes.

Persetujuan dilakukan dengan mencentang Checkbox yang tersedia di akhir bawah instruksi.

Tombol **Mulai Tes** hanya dapat digunakan setelah Checkbox dicentang.

---

# 4.9 Memulai Tes

Saat tombol **Mulai Tes** dipilih, sistem wajib:

1. Mencatat waktu mulai Tes.
2. Mengubah Status Participant menjadi **Sedang Mengerjakan**.
3. Memulai Timer.
4. Membentuk Snapshot Tes berdasarkan seluruh Pertanyaan yang berstatus **Aktif**.
5. Menampilkan soal pertama.

Snapshot tersebut digunakan hingga Tes selesai.

---

# 4.10 Snapshot Tes

- Snapshot Tes dibentuk satu kali ketika Participant memulai Tes.
- Snapshot terdiri dari seluruh Pertanyaan yang berstatus **Aktif** pada saat itu.
- Perubahan Bank Soal setelah Snapshot terbentuk tidak memengaruhi Participant tersebut.
- Perubahan hanya berlaku bagi Participant yang belum menekan tombol **Ajukan Tes**.

---

# 4.11 Navigasi Tes

Tes menggunakan aturan berikut:
- Satu soal ditampilkan dalam satu halaman.
- Tidak tersedia tombol Previous.
- Tidak tersedia tombol Next.
- Participant tidak dapat memilih nomor soal.
- Participant tidak dapat melewati soal.
- Participant wajib menjawab soal yang sedang ditampilkan.

---

# 4.12 Penyimpanan Jawaban

Setelah Participant memilih jawaban:
- Jawaban langsung disimpan ke Database.
- Sistem langsung menampilkan soal berikutnya.

Jawaban yang telah tersimpan:
- Tidak dapat diubah.
- Tidak dapat dihapus.
- Tidak dapat dipilih ulang.

---

# 4.13 Urutan Soal

Urutan soal mengikuti nilai **Nomor Urut**.
Soal ditampilkan mulai dari Nomor Urut terkecil hingga terbesar.
Nomor Urut diberikan secara otomatis ketika Pertanyaan dibuat.
Perubahan Nomor Urut hanya dapat dilakukan melalui Database.
Frontend tidak menyediakan fitur untuk mengubah Nomor Urut.

---

# 4.14 Timer

Timer dimulai ketika Participant menekan tombol **Mulai Tes**.

Timer terus berjalan meskipun:
- Browser di-refresh.
- URL dibuka pada tab baru.
- Participant kembali ke halaman sebelumnya.

Timer berhenti apabila:

- Seluruh Tes selesai.
- Durasi Tes habis.

---

# 4.15 Refresh Browser

Refresh Browser tidak mengulang Tes.

Saat Browser di-refresh:
- Participant tetap berada pada soal terakhir.
- Jawaban yang telah tersimpan tetap tersedia.
- Timer tetap berjalan.
- Progress Tes tetap dipertahankan.
- Biodata tidak perlu diisi kembali.

---

# 4.16 Multi Tab

Participant diperbolehkan membuka URL Tes pada tab baru.

Ketentuan:
- Menggunakan Session Tes yang sama.
- Tidak membuat Tes baru.
- Tidak mengulang Tes dari awal.
- Tetap melanjutkan Progress Tes.
- Timer tetap sama.

---

# 4.17 Penyelesaian Tes

Tes dinyatakan selesai apabila:
- Participant berhasil menyelesaikan seluruh soal dan Game.

atau

- Durasi Tes telah habis.

---

# 4.18 Halaman Selesai

## Tes Berhasil Diselesaikan

Sistem menampilkan:
- Ucapan Terima Kasih.
- Tombol **Kirim Bukti Tes ke Admin**.

---

## Waktu Tes Habis

Sistem menampilkan:
- Ucapan Maaf.
- Tombol **Kirim Bukti Tes ke Admin**.


Isi kedua pesan dapat diubah melalui halaman Settings oleh admininstrator.

---

# 4.19 Kirim Bukti Tes

Saat tombol **Kirim Bukti Tes ke Admin** dipilih:

- Sistem membuka WhatsApp menggunakan **https://wa.me/6281318138660**.
- Sistem menggunakan Template Pesan yang telah ditentukan.
- Nomor WhatsApp Administrator diambil dari konfigurasi Backend.

Isi Template Pesan bukan bagian dari Business Rules.

---

# 4.20 Status Participant

Participant memiliki salah satu status berikut:

- Belum Mulai
- Sedang Mengerjakan
- Selesai
- Waktu Habis

Status diperbarui secara otomatis oleh sistem.

---