# AI_RULES.md

# AI Implementation Rules

**Status:** 🔒 LOCKED

Dokumen ini merupakan aturan permanen yang wajib dipatuhi oleh seluruh AI Agent yang mengerjakan proyek ini.

Dokumen ini **bukan** merupakan Business Requirement.

Dokumen ini merupakan aturan implementasi.

---

# 1. Source of Truth

Seluruh implementasi wajib mengikuti dokumen proyek.

Urutan prioritas pengerjaan adalah sebagai berikut.

1. Database SQL
2. Backend & API
3. Frontend

---

# 2. Requirement Freeze

Seluruh requirement telah dikunci.

AI dilarang:

- Mengubah requirement.
- Menambah requirement.
- Mengurangi requirement.
- Mengganti alur sistem.
- Mengubah Business Rules.
- Mengubah Database Design.
- Mengubah API Specification.

Apabila menemukan ketidaksesuaian, hentikan proses dan minta konfirmasi pengguna.

---

# 3. Database Rules

Gunakan PostgreSQL Native.

Jangan menggunakan:

- Prisma
- Drizzle
- Sequelize
- TypeORM
- ORM lainnya

Database harus mengikuti:

- 01_tables.sql
- 02_constraints.sql
- 03_indexes.sql
- 04_seed.sql
- schema.sql

Jangan membuat tabel baru.

Jangan menghapus tabel.

Jangan mengubah struktur tabel.

Jangan mengubah nama kolom.

Jangan mengubah tipe data.

Jangan mengubah Constraint.

Jangan mengubah Index.

Seluruh perubahan Database hanya boleh dilakukan atas instruksi pengguna.

---

# 4. API Rules

Seluruh endpoint harus mengikuti BAB 14.

AI dilarang:

- Membuat endpoint baru.
- Menghapus endpoint.
- Mengubah URL.
- Mengubah HTTP Method.
- Mengubah Request Body.
- Mengubah Response.
- Mengubah Business Logic API.

Gunakan REST API.

Gunakan JSON.

Gunakan HTTPS.

---

# 5. Coding Rules

Gunakan:

- TypeScript
- ESLint
- Clean Code
- SOLID
- DRY
- KISS

Kode harus:

- Production Ready.
- Mudah dipelihara.
- Mudah dibaca.
- Konsisten.

Tidak boleh:

- TODO
- FIXME
- Placeholder
- Mock Data
- Fake Data
- Dummy Implementation
- Empty Function

Seluruh implementasi harus lengkap.

---

# 6. Development Rules

Kerjakan hanya sesuai task yang diminta.

Jangan mengerjakan task lain.

Jangan melakukan refactoring besar tanpa instruksi.

Jangan mengubah file yang tidak berkaitan.

Minimalkan dampak perubahan.

---

# 7. UI Rules

Seluruh UI harus konsisten.

Gunakan satu Design Language untuk seluruh aplikasi.

Prioritaskan:

- Readability.
- Consistency.
- Accessibility.
- Responsive Design.

Jangan membuat halaman dengan gaya berbeda.

---

# 8. Game Rules

Seluruh implementasi Game wajib mengikuti 07_game_engine.md

Jangan mengubah:

- Algoritma Sliding Puzzle.
- Algoritma Search Word.
- Mekanisme Random.
- Snapshot.
- Penyimpanan hasil Game.

---

# 9. Settings Rules

Seluruh konfigurasi harus sesuai 02_user_role.md

Nomor WhatsApp Administrator dikelola Backend.

Tidak boleh dibuat halaman pengaturannya di Frontend.

---

# 10. Snapshot Rules

Snapshot dibuat ketika Participant memulai Tes.

Snapshot tidak boleh berubah selama Tes berlangsung.

Perubahan:

- Question
- Game
- Settings

tidak boleh memengaruhi Participant yang sedang Tes.

---

# 11. Security Rules

Gunakan:

- HttpOnly Cookie
- Secure Cookie
- SameSite
- Argon2 Password Hash

Jangan menyimpan Password dalam bentuk Plain Text.

Jangan mengembalikan Internal Error kepada Client.

---

# 12. Error Handling

Gunakan Error Response yang konsisten.

Jangan menampilkan:

- Stack Trace
- SQL Error
- Internal Path
- Sensitive Information

kepada Frontend.

---

# 13. Documentation Rules

Sebelum menulis kode:

- Pelajari dokumen terkait.
- Pastikan implementasi sesuai spesifikasi.
- Jangan membuat asumsi.

Jika spesifikasi tidak ditemukan pada dokumen:

Berhenti.

Ajukan pertanyaan kepada pengguna.

---

# 14. Workflow Rules

Setiap pekerjaan harus mengikuti urutan berikut.

1. Pelajari Requirement.
2. Analisis.
3. Jelaskan rencana implementasi.
4. Tunggu persetujuan pengguna.
5. Mulai implementasi.
6. Lakukan validasi.
7. Selesaikan Task.

Jangan melompati tahapan.

---

# 15. Final Principle

AI bertugas menerjemahkan spesifikasi menjadi kode.

AI bukan pengambil keputusan.

AI tidak boleh mengubah desain sistem.

AI tidak boleh mengubah arsitektur.

AI tidak boleh mengubah Database.

AI tidak boleh mengubah Business Rules.

Jika terdapat keraguan sekecil apa pun, hentikan implementasi dan minta klarifikasi kepada pengguna.

---

# 16. Internet & MCP Rules

AI Agent diperbolehkan menggunakan Internet dan MCP hanya untuk:

- Membaca dokumentasi resmi framework.
- Membaca dokumentasi resmi library yang digunakan proyek.
- Memverifikasi sintaks API.
- Menyelesaikan error build, compile, runtime, atau dependency.
- Memastikan kompatibilitas versi library.

AI Agent dilarang menggunakan Internet atau MCP untuk:

- Mengubah requirement proyek.
- Mengubah Business Rules.
- Mengubah Database Design.
- Mengubah API Specification.
- Mengubah Stack Technology.
- Menambahkan fitur baru.
- Mengganti arsitektur.
- Mengadopsi implementasi dari tutorial, blog, atau proyek lain yang bertentangan dengan dokumentasi proyek.

Apabila informasi dari Internet bertentangan dengan dokumentasi proyek, maka dokumentasi proyek selalu memiliki prioritas yang lebih tinggi.

Internet berfungsi sebagai referensi teknis, bukan sebagai sumber kebenaran proyek.

---

# END OF FILE