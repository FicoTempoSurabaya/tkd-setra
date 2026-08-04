# Database Design

**Status:** 🔒 LOCKED

Seluruh isi pada BAB ini telah disepakati dan tidak boleh diubah tanpa persetujuan pengguna.

---

# 10.1 Tujuan

BAB ini mendefinisikan standar perancangan Database yang digunakan oleh seluruh sistem.

Seluruh struktur Database harus mengikuti prinsip:

- Konsisten.
- Relasional.
- Mudah dipelihara.
- Mudah dikembangkan.
- Memiliki integritas data yang tinggi.

---

# 10.2 Database Platform

Sistem menggunakan:

- PostgreSQL 17
- Native PostgreSQL
- Python psycopg3
- DBeaver sebagai Database Client

Sistem tidak menggunakan ORM.

Seluruh proses komunikasi Database dilakukan menggunakan SQL Native PostgreSQL.

---

# 10.3 Database Philosophy

Database merupakan Single Source of Truth.

Business Logic berada pada Backend.

Database bertanggung jawab menjaga:

- Integritas Data.
- Konsistensi Relasi.
- Constraint Data.

Database tidak digunakan untuk menyimpan logika bisnis.

---

# 10.4 Primary Key

Seluruh tabel menggunakan Primary Key dengan tipe data:

```sql
BIGINT GENERATED ALWAYS AS IDENTITY
```

Primary Key bersifat internal.

Primary Key tidak pernah ditampilkan kepada Frontend.

---

# 10.5 Public Identifier

Seluruh data yang memerlukan identitas publik menggunakan Public Token yang terpisah dari Primary Key.

Public Token digunakan untuk:

- URL Participant.
- Token Session.
- Keperluan publik lainnya.

Primary Key hanya digunakan sebagai relasi internal Database.

---

# 10.6 Naming Convention

Seluruh objek Database menggunakan format:

```
snake_case
```

Nama tabel menggunakan bentuk tunggal (singular).

Contoh:

```
participant
participant_test
question
question_option
game
game_result
setting
```

Nama kolom juga menggunakan snake_case.

Contoh:

```
full_name
question_order
created_at
updated_at
```

Seluruh penamaan harus konsisten.

---

# 10.7 Data Type Standard

Standar tipe data yang digunakan:

| Data | Tipe |
|------|------|
| Primary Key | BIGINT |
| Foreign Key | BIGINT |
| Short Text | VARCHAR |
| Long Text | TEXT |
| Rich Text Document | JSONB |
| URL | TEXT |
| Status | VARCHAR |
| Boolean | BOOLEAN |
| Date | DATE |
| Timestamp | TIMESTAMPTZ |
| Duration | INTEGER |
| Counter | INTEGER |

---

# 10.8 Time Standard

Seluruh Timestamp disimpan menggunakan:

```
TIMESTAMPTZ
```

Database menyimpan waktu dalam UTC.

Frontend bertanggung jawab menampilkan waktu sesuai zona waktu aplikasi.

Durasi disimpan dalam satuan detik.

---

# 10.9 Foreign Key Strategy

Seluruh Foreign Key menggunakan:

```sql
ON UPDATE RESTRICT
ON DELETE RESTRICT
```

Prinsip:

- Data historis tidak boleh hilang.
- Integritas relasi harus selalu terjaga.
- Penghapusan permanen hanya dilakukan secara manual melalui Database apabila benar-benar diperlukan.

---

# 10.10 Constraint Strategy

Sistem menggunakan CHECK CONSTRAINT sebanyak mungkin untuk menjaga validitas data.

Contoh:

- NIK harus terdiri dari 16 digit.
- Nomor urut harus lebih besar dari 0.
- Durasi harus lebih besar dari 0.
- Jumlah langkah tidak boleh bernilai negatif.
- Jumlah kata ditemukan tidak boleh bernilai negatif.

Validasi Business Rule tetap dilakukan oleh Backend.

---

# 10.11 Index Strategy

Index hanya dibuat pada kolom yang benar-benar digunakan untuk:

- Search.
- Sorting.
- Join.
- Foreign Key.

Contoh:

## participant

- full_name
- nik
- status

## participant_test

- participant_id
- public_token
- status

## question

- question_order
- status

## game

- game_order
- status

## quiz_answer

- participant_test_id
- question_id

## game_result

- participant_test_id
- game_id

Sistem tidak membuat Index yang tidak diperlukan agar performa INSERT dan UPDATE tetap optimal.

---

# 10.12 Status Strategy

Seluruh tabel yang memiliki siklus hidup menggunakan Status:

- Aktif
- Non Aktif

Sistem tidak menggunakan:

- deleted_at
- archive table
- soft delete timestamp

Seluruh perubahan tetap tercatat melalui kolom:

```
updated_at
```

Frontend hanya menampilkan data berstatus Aktif.

Data Non Aktif tetap tersimpan sebagai histori.

---

# 10.13 JSON Strategy

JSON hanya digunakan untuk penyimpanan dokumen Rich Text Editor.

Digunakan pada:

- Halaman Instruksi.
- Halaman Terima Kasih.
- Halaman Maaf.

Seluruh data selain itu menggunakan model relasional.

JSON tidak digunakan untuk:

- Participant.
- Question.
- Question Option.
- Game.
- Search Word.
- Quiz Answer.
- Game Result.

---

# 10.14 Database Structure Strategy

Database menggunakan pendekatan:

**Satu Tabel Utama dengan Tabel Pendukung.**

---

## Question

```
question
└── question_option
```

Seluruh jenis Quiz menggunakan tabel `question`.

Pilihan jawaban menggunakan tabel `question_option`.

Kolom `image_url` berada pada tabel `question`.

Backend menentukan apakah kolom tersebut wajib diisi berdasarkan jenis pertanyaan.

---

## Game

```
game
└── search_word_item
```

Seluruh Game menggunakan tabel `game`.

Khusus Search Word memiliki tabel pendukung `search_word_item` untuk menyimpan daftar kata.

Image Sliding Puzzle tidak memerlukan tabel tambahan.

---

## Result

```
participant_test
├── quiz_answer
├── game_result
└── search_word_found
```

`game_result` digunakan untuk seluruh jenis Game.

Khusus Search Word, kata yang berhasil ditemukan disimpan pada tabel `search_word_found`.

---

# 10.15 Question Strategy

Seluruh jenis Quiz menggunakan tabel `question`.

Jenis Quiz yang didukung:

- Single Choice Question
- Yes / No Question
- Image Based Question
- Image Based Answer
- Likert Scale
- Semantic Differential Scale

Perbedaan antar jenis Quiz ditentukan oleh:

- question_type
- Validasi Backend
- Tampilan Frontend

Bukan oleh struktur tabel yang berbeda.

---

# 10.16 Question Option Strategy

Seluruh pilihan jawaban menggunakan tabel `question_option`.

---

## Single Choice Question

- Selalu memiliki 4 pilihan jawaban.
- Menggunakan teks sebagai pilihan.

---

## Yes / No Question

Selalu memiliki dua pilihan:

- IYA
- TIDAK

Administrator tidak dapat mengubah kedua pilihan tersebut.

---

## Image Based Question

Pertanyaan menggunakan gambar.

Pilihan jawaban berupa teks.

Jumlah pilihan selalu 4.

---

## Image Based Answer

Pertanyaan berupa teks.

Pilihan jawaban berupa gambar.

Jumlah pilihan selalu 4.

---

## Likert Scale

Administrator menentukan jumlah pilihan.

Contoh:

- 3 pilihan.
- 5 pilihan.
- 6 pilihan.

Seluruh label pilihan wajib diisi oleh Administrator.

---

## Semantic Differential Scale

Administrator menentukan jumlah pilihan.

Administrator hanya mengisi:

- Label pertama.
- Label terakhir.

Pilihan di tengah tidak memiliki label.

Frontend menampilkan skala horizontal berdasarkan jumlah pilihan.

Backend tetap menyimpan seluruh pilihan pada tabel `question_option`.

Jawaban Participant tetap mengacu pada `question_option_id`.

---

# 10.17 Prinsip Database

Database dirancang dengan prinsip:

- Relasional.
- Konsisten.
- Ringan.
- Mudah dipelihara.
- Mudah dikembangkan.
- Mengutamakan performa.
- Tidak menyimpan data yang redundan.

Seluruh perubahan Business Rule diupayakan dapat diselesaikan melalui perubahan data, bukan perubahan struktur Database.

---