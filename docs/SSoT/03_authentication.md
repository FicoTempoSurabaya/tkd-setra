# Authentication

**Status:** 🔒 LOCKED

Seluruh isi pada BAB ini telah disepakati dan tidak boleh diubah tanpa persetujuan pengguna.

---

# 3.1 Tujuan Authentication

Authentication digunakan untuk:

- Melindungi Dashboard Administrator.
- Mengamankan konfigurasi aplikasi.
- Mengamankan Bank Soal.
- Mengamankan data Participant.

Participant tidak menggunakan mekanisme Login.

---

# 3.2 Authentication Administrator

Sistem hanya memiliki satu akun Administrator.

Administrator melakukan Login hanya menggunakan:

- Password

Sistem tidak menggunakan:

- Username
- Email
- Nomor Telepon
- OTP
- Two-Factor Authentication (2FA)
- OAuth
- Single Sign-On (SSO)
- Metode autentikasi lainnya

---

# 3.3 Password Administrator

Password Administrator disimpan menggunakan algoritma hash **Argon2**.

Ketentuan:

- Password asli tidak pernah disimpan.
- Password tidak pernah ditampilkan kembali.
- Password hanya digunakan untuk proses verifikasi Login.
- Lokasi penyimpanan hash merupakan detail implementasi.

---

# 3.4 Session

Session Administrator menggunakan:

- JSON Web Token (JWT)

JWT disimpan menggunakan:

- HttpOnly Cookie

JWT tidak dapat diakses oleh JavaScript.

---

# 3.5 Masa Berlaku Session

Session Administrator berlaku selama:

**24 Jam**

Selama Session masih aktif:

- Administrator tidak perlu Login kembali.
- Refresh Browser tidak mengakhiri Session.

---

# 3.6 Login Berhasil

Apabila Password benar, sistem wajib:

1. Membuat Session Administrator.
2. Mengirim JWT melalui HttpOnly Cookie.
3. Mengarahkan Administrator ke Dashboard.

---

# 3.7 Login Gagal

Apabila Password salah:

- Login ditolak.
- Session tidak dibuat.
- Sistem menampilkan pesan kesalahan kepada Administrator.

---

# 3.8 Pembatasan Login

Untuk menjaga keamanan sistem, Login dibatasi sebagai berikut.

## Tahap Pertama

- Maksimal 3 kali Login gagal.
- Setelah itu Login dikunci selama 5 menit.

---

## Tahap Kedua

Setelah masa tunggu selesai:
- Administrator kembali memperoleh 3 kali percobaan Login.

Apabila kembali gagal sebanyak 3 kali:
- Login dikunci selama 10 menit.

---

## Tahap Ketiga

Setelah masa tunggu selesai:
- Administrator kembali memperoleh 3 kali percobaan Login.

Apabila kembali gagal sebanyak 3 kali:
- Login dikunci selama 24 jam.

---

# 3.9 Remember Login

Sistem tidak menyediakan fitur:

- Remember Me.
- Remember Login.
- Keep Me Signed In.

Session hanya mengikuti masa berlaku JWT.

---

# 3.10 Logout

Administrator dapat melakukan Logout kapan saja.

Saat Logout:
- Session dihapus.
- JWT dihapus.
- HttpOnly Cookie dihapus.

Setelah Logout:
- Administrator diarahkan ke Landing Page.

---

# 3.11 Authentication Participant

- Participant tidak memiliki akun.
- Participant tidak melakukan Login.
- Authentication Participant dilakukan melalui proses berikut:
1. Mengisi Biodata.
2. Menekan tombol **Ajukan Tes**.
3. Sistem membuat URL Tes yang unik.
4. Participant menggunakan URL tersebut untuk mengikuti Tes.

---

# 3.12 URL Tes

Setiap Participant memperoleh satu URL Tes yang unik.

Ketentuan:

- URL hanya berlaku untuk Participant tersebut.
- URL tetap dapat digunakan selama Tes masih aktif.
- URL tetap melanjutkan Progress Tes.
- URL tidak dapat digunakan setelah Tes selesai.
- URL tidak dapat digunakan setelah durasi Tes habis.

Cara pembentukan URL merupakan detail implementasi.

---

# 3.13 Refresh Browser

Refresh Browser tidak mengakhiri Session.

## Administrator

Saat Refresh:
- Tetap Login.
- Tetap berada pada Dashboard.
- Filter tetap dipertahankan.
- Search tetap dipertahankan.
- Sorting tetap dipertahankan.
- Pagination tetap dipertahankan.
- State halaman tetap dipertahankan.

---

## Participant

Saat Refresh:
- Tetap berada pada soal terakhir.
- Jawaban yang telah tersimpan tetap tersedia.
- Timer tetap berjalan.
- Progress Tes tetap dipertahankan.
- Biodata tidak perlu diisi kembali.

---

# 3.14 Multi Tab

Participant diperbolehkan membuka URL Tes pada tab baru.

Ketentuan:
- Tetap menggunakan Session Tes yang sama.
- Tidak membuat Tes baru.
- Tidak mengulang Tes dari awal.
- Tetap melanjutkan Progress Tes.
- Timer tetap mengacu pada waktu yang sama.

---

# 3.15 Session Persistence

Selama Session masih aktif, sistem wajib mempertahankan seluruh state aplikasi.
State yang dipertahankan meliputi:

## Administrator

- Filter.
- Search.
- Sorting.
- Pagination.
- Menu Dashboard yang sedang aktif.

---

## Participant

- Soal terakhir.
- Jawaban yang telah dipilih.
- Timer.
- Progress Tes.

State hanya dihapus apabila:
- Administrator Logout.
- Session berakhir.
- Participant menyelesaikan Tes.
- Durasi Tes habis.

---

# 3.16 Prinsip Authentication

Authentication dirancang dengan prinsip:

- Aman.
- Sederhana.
- Ringan.
- Konsisten.
- Mudah dipelihara.

Seluruh implementasi Authentication mengikuti prinsip tersebut.

---