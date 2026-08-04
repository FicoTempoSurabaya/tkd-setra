# User & Role

**Status:** 🔒 LOCKED

Seluruh isi pada BAB ini telah disepakati dan tidak boleh diubah tanpa persetujuan pengguna.

---

# 2.1 User Role

Sistem hanya memiliki dua jenis pengguna.

1. Administrator
2. Participant

Jumlah Role bersifat tetap.

Sistem tidak mendukung penambahan Role baru.

Role berikut tidak digunakan:

- Super Administrator
- Supervisor
- Operator
- Reviewer
- Manager
- Role lainnya

---

# 2.2 Administrator

Sistem hanya memiliki satu akun Administrator.

Karakteristik:

- Hanya terdapat satu akun Administrator.
- Tidak mendukung Multi Administrator.
- Tidak tersedia Registrasi Administrator.
- Tidak tersedia penambahan Administrator.
- Tidak tersedia penghapusan Administrator.

Administrator memiliki hak penuh terhadap pengelolaan aplikasi sesuai Business Rules.

---

# 2.3 Hak Akses Administrator

Administrator dapat melakukan:

## Authentication

- Login.
- Logout.

---

## Dashboard

Mengakses Dashboard Administrator.

---

## Participant

Administrator dapat:

- Melihat daftar Participant.
- Mencari Participant.
- Mengurutkan data Participant.
- Melihat Biodata Participant.
- Melihat seluruh jawaban Quiz Participant.
- Melihat hasil Game Participant.

Administrator tidak dapat:

- Mengubah Biodata Participant.
- Menghapus Participant melalui Frontend.
- Mengaktifkan atau menonaktifkan Participant.

Seluruh data Participant bersifat **Read Only**.

---

## Bank Soal

Administrator dapat:
- Menambah Pertanyaan baru.
- Melakukan Full Preview Pertanyaan untuk perasakan participant's experience.
- Menonaktifkan Pertanyaan yang sudah ada.

Administrator tidak dapat:
- Mengubah Pertanyaan yang telah aktif.
- Mengubah tipe Pertanyaan yang telah aktif.
- Mengubah isi Pertanyaan yang telah aktif.
- Mengubah pilihan jawaban yang telah aktif.
- Mengubah gambar Pertanyaan yang telah aktif.
- Mengaktifkan kembali Pertanyaan yang telah dinonaktifkan.

Apabila diperlukan perubahan, Administrator wajib membuat Pertanyaan baru.

---

## Settings

Administrator dapat mengubah:

- Durasi Tes.
- Isi Instruksi Tes.
- Isi Ucapan Terima Kasih.
default:
>>["Terima Kasih, {nama_lengkap}. Anda berhasil menyelesaikan seluruh tes. Kirim Bukti Penyelesaian ini kepada administrator melalui tombol yang disediakan"]<<

- Isi Ucapan Maaf.
default:
>>["Mohon Ma'af, {nama_lengkap}. Waktu anda telah habis. Seluruh pertanyaan yang berhasil anda jawab tetap memiliki poin. Kirim Bukti Time Out ini kepada administrator melalui tombol yang disediakan"]<<
- Status Maintenance.

---

# 2.4 Administrator Tidak Memiliki Fitur

Administrator tidak memiliki fitur berikut:

- Registrasi Administrator.
- Menambah Administrator.
- Menghapus Administrator.
- Reset Password.
- Ganti Password.
- Profil Administrator.
- Mengubah Nama Aplikasi.
- Mengubah Logo.
- Mengubah Favicon.


---

# 2.5 Password Administrator

Password Administrator disimpan menggunakan algoritma hash **Argon2**.

Ketentuan:

- Password asli tidak pernah disimpan.
- Password tidak dapat ditampilkan kembali.
- Password hanya digunakan untuk proses Login.
- Lokasi penyimpanan hash merupakan detail implementasi.

---

# 2.6 Participant

Participant tidak memiliki akun.

Participant hanya dapat:

- Membuka Landing Page.
- Mengisi Biodata.
- Membaca Instruksi.
- Mengikuti Tes.
- Mengirim hasil Tes.

---

# 2.7 Participant Tidak Memiliki Fitur

Participant tidak dapat:

- Login.
- Logout.
- Mengakses Dashboard.
- Mengubah Biodata setelah Tes dimulai.
- Mengubah jawaban yang telah dikirim.
- Melihat skor.
- Melihat nilai.
- Melihat jawaban benar atau salah.
- Melihat hasil analisis.
- Mengulang Tes menggunakan URL yang sama setelah Tes selesai atau waktu habis.

---

# 2.8 Registrasi

Sistem tidak menyediakan Registrasi.

Ketentuan:

- Tidak ada Registrasi Administrator.
- Tidak ada Registrasi Participant.

Participant cukup mengisi Biodata untuk memulai Tes.

---

# 2.9 Status Pertanyaan

Setiap Pertanyaan memiliki salah satu status berikut.

## Aktif

Pertanyaan:

- Ditampilkan pada Frontend Administrator.
- Digunakan dalam Tes Participant.
- Dapat dilakukan Full Preview oleh Administrator.

---

## Non Aktif

Pertanyaan:

- Tidak digunakan dalam Tes.
- Tidak ditampilkan pada Frontend.
- Tetap tersimpan di Database.

Perubahan status menjadi Non Aktif tidak memengaruhi Participant yang telah memulai Tes.

---

# 2.10 Pertanyaan Immutable

Pertanyaan yang telah digunakan dalam Tes bersifat **Immutable**.

Administrator tidak dapat:
- Mengubah isi Pertanyaan.
- Mengubah pilihan jawaban.
- Mengubah gambar.
- Mengubah tipe Pertanyaan.

Apabila diperlukan perubahan:
Administrator wajib membuat Pertanyaan baru.
Ketentuan ini menjaga konsistensi historis jawaban Participant.

---

# 2.11 Data Visibility

Frontend hanya menampilkan data yang masih digunakan sistem.

Frontend tidak menampilkan:
- Pertanyaan Non Aktif.
- Data internal Backend.
- Data sistem lainnya yang tidak diperlukan Administrator.

Seluruh pengelolaan data dilakukan oleh Backend.

---

# 2.12 Export Data

Frontend tidak menyediakan fitur Export.

Setelah Participant menyelesaikan Tes, Backend secara otomatis:

1. Menyimpan data ke PostgreSQL.

---

# 2.13 Pengelolaan Data

Penghapusan data melalui Frontend tidak dilakukan secara permanen.

Seluruh mekanisme penyimpanan data, pengelolaan status, dan integritas Database menjadi tanggung jawab Backend.

Implementasi teknis bukan merupakan bagian dari Business Rules.

---