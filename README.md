# Organify API

Selamat datang di Organify API\! Ini adalah backend service yang dibangun menggunakan Hapi.js dan terintegrasi dengan Supabase untuk menyediakan fungsionalitas aplikasi to-do list. API ini menangani otentikasi pengguna, manajemen catatan (tugas), kategori, dan penyediaan data untuk grafik.

Dokumentasi ini ditujukan untuk developer frontend agar dapat dengan mudah memahami dan menggunakan setiap endpoint yang tersedia.

## Daftar Isi

  - [Instalasi](https://www.google.com/search?q=%23instalasi)
  - [Variabel Lingkungan (.env)](https://www.google.com/search?q=%23variabel-lingkungan-env)
  - [Otentikasi](https://www.google.com/search?q=%23otentikasi)
  - [Struktur Respon](https://www.google.com/search?q=%23struktur-respon)
  - [Dokumentasi Endpoint](https://www.google.com/search?q=%23dokumentasi-endpoint)
      - [Root](https://www.google.com/search?q=%23root)
      - [Otentikasi Pengguna](https://www.google.com/search?q=%23otentikasi-pengguna)
      - [Catatan (Catatan)](https://www.google.com/search?q=%23catatan-catatan)
      - [Todo Item](https://www.google.com/search?q=%23todo-item)
      - [Kategori](https://www.google.com/search?q=%23kategori)
      - [Grafik](https://www.google.com/search?q=%23grafik)

## Instalasi

Untuk menjalankan server ini secara lokal, ikuti langkah-langkah berikut:

1.  **Clone repositori:**

    ```bash
    git clone <url-repo-anda>
    cd <nama-folder-repo>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Buat file `.env`:**
    Buat file bernama `.env` di root direktori proyek dan isi dengan variabel yang diperlukan. Lihat bagian [Variabel Lingkungan](https://www.google.com/search?q=%23variabel-lingkungan-env).

4.  **Jalankan server:**
    Server akan berjalan menggunakan `nodemon`, yang akan otomatis me-restart saat ada perubahan file.

    ```bash
    npm start
    ```

    Secara default, server akan berjalan di `http://localhost:3001`.

## Variabel Lingkungan (.env)

File `.env` diperlukan untuk menyimpan kredensial dan konfigurasi. Pastikan untuk tidak memasukkan file ini ke dalam sistem kontrol versi Anda.

```env
# Port untuk server
PORT=3001

# Kredensial Supabase
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

  - `SUPABASE_URL` & `SUPABASE_ANON_KEY`: Diperoleh dari dashboard Supabase Anda di bagian **Project Settings \> API**.
  - `SUPABASE_JWT_SECRET`: Diperoleh dari **Project Settings \> API \> JWT Settings**.
  - `SUPABASE_SERVICE_ROLE_KEY`: Diperoleh dari **Project Settings \> API**. Key ini digunakan untuk operasi yang memerlukan hak akses admin, seperti menghapus akun pengguna.

## Otentikasi

API ini menggunakan strategi otentikasi JWT yang disediakan oleh Supabase.

1.  Untuk mengakses endpoint yang memerlukan otentikasi, pengguna harus terlebih dahulu login melalui endpoint `POST /login`.
2.  Endpoint login akan mengembalikan sebuah `token` JWT jika kredensial valid.
3.  Untuk setiap permintaan ke endpoint yang terproteksi, Anda harus menyertakan token ini dalam header `Authorization`.

**Format Header:**

```
Authorization: Bearer <token-yang-didapat-dari-login>
```

## Struktur Respon

API ini mengadopsi format respon JSend yang disederhanakan.

  - **Respon Sukses:**

    ```json
    {
      "status": "success",
      "message": "Operasi berhasil dilakukan.", // Opsional
      "data": { ... } // Opsional, berisi data yang diminta
    }
    ```

  - **Respon Gagal (Fail):** Terjadi karena kesalahan input dari client (contoh: data tidak ditemukan, validasi gagal).

    ```json
    {
      "status": "fail",
      "message": "Deskripsi kesalahan dari sisi client."
    }
    ```

  - **Respon Error:** Terjadi karena kesalahan di sisi server.

    ```json
    {
      "status": "error",
      "message": "Deskripsi kesalahan dari sisi server."
    }
    ```

-----

## Dokumentasi Endpoint

### Root

#### `GET /`

Endpoint dasar untuk memeriksa apakah API sedang berjalan.

  - **Auth Diperlukan**: Tidak
  - **Respon Sukses (200 OK)**:
    ```
    Organify API with Supabase
    ```

### Otentikasi Pengguna

Endpoint ini diatur dalam `routes/userRoutes.js`.

#### `POST /signup`

Mendaftarkan pengguna baru.

  - **Auth Diperlukan**: Tidak
  - **Request Body**:
    ```json
    {
      "nama": "John Doe",
      "email": "john.doe@example.com",
      "password": "passwordminimal6karakter"
    }
    ```
  - **Respon Sukses (201 Created)**:
    ```json
    {
      "status": "success",
      "message": "Registrasi berhasil. Silakan cek email Anda untuk verifikasi.",
      "data": {
        "id": "...",
        "aud": "authenticated",
        // ... metadata pengguna lainnya dari Supabase
      }
    }
    ```
  - **Respon Gagal (400 Bad Request)**:
    ```json
    {
        "status": "error",
        "message": "User already registered"
    }
    ```

#### `POST /login`

Login pengguna untuk mendapatkan token akses.

  - **Auth Diperlukan**: Tidak
  - **Request Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "passwordanda"
    }
    ```
  - **Respon Sukses (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Login berhasil",
      "token": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "id": "user-uuid",
        "nama": "John Doe",
        "email": "john.doe@example.com"
      }
    }
    ```
  - **Respon Gagal (401 Unauthorized)**:
    ```json
    {
        "status": "fail",
        "message": "Invalid login credentials"
    }
    ```

#### `GET /me`

Mendapatkan detail pengguna yang sedang login.

  - **Auth Diperlukan**: Ya
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "data": {
            "id": "user-uuid",
            "email": "john.doe@example.com",
            "nama": "John Doe"
        }
    }
    ```

#### `POST /forgot-password`

Mengirim email untuk reset password.

  - **Auth Diperlukan**: Tidak
  - **Request Body**:
    ```json
    {
        "email": "john.doe@example.com"
    }
    ```
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "message": "Link reset password telah dikirim ke email Anda."
    }
    ```

#### `DELETE /delete-account`

Menghapus akun pengguna yang sedang login. Operasi ini tidak dapat diurungkan.

  - **Auth Diperlukan**: Ya
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "message": "Akun berhasil dihapus."
    }
    ```
  - **Respon Error (500 Internal Server Error)**:
    ```json
    {
        "status": "error",
        "message": "Gagal menghapus akun: ..."
    }
    ```

### Catatan (Catatan)

Endpoint ini diatur dalam `routes/index.js`.

#### `POST /catatan`

Membuat catatan baru. Jika kategori yang dimasukkan belum ada, kategori tersebut akan dibuat secara otomatis.

  - **Auth Diperlukan**: Ya
  - **Request Body**:
    ```json
    {
      "kategori": "Pekerjaan",
      "nama_list": "Selesaikan Laporan Proyek",
      "tanggal_deadline": "2025-12-31T17:00:00.000Z", // Format ISO Date
      "status": false // Opsional, default false
    }
    ```
  - **Respon Sukses (201 Created)**:
    ```json
    {
        "status": "success",
        "message": "Catatan berhasil ditambahkan",
        "data": {
            "id": "uuid-catatan-baru"
        }
    }
    ```

#### `GET /catatan`

Mendapatkan semua catatan milik pengguna yang sedang login.

  - **Auth Diperlukan**: Ya
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "data": [
            {
                "id": "uuid-catatan-1",
                "user_id": "user-uuid",
                "created_at": "...",
                "kategori": "Pekerjaan",
                "nama_list": "Selesaikan Laporan Proyek",
                "tanggal_deadline": "2025-12-31T17:00:00+00:00",
                "status": false,
                "todo_item": null
            }
        ]
    }
    ```

#### `GET /catatan/{id}`

Mendapatkan detail satu catatan berdasarkan ID.

  - **Auth Diperlukan**: Ya
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "data": {
            "id": "uuid-catatan-1",
            "user_id": "user-uuid",
            // ... detail catatan lainnya
        }
    }
    ```
  - **Respon Gagal (404 Not Found)**:
    ```json
    {
        "status": "fail",
        "message": "Catatan tidak ditemukan"
    }
    ```

#### `PUT /catatan/{id}`

Memperbarui satu atau lebih field dari sebuah catatan.

  - **Auth Diperlukan**: Ya
  - **Request Body** (minimal satu field harus ada):
    ```json
    {
      "kategori": "Pribadi",
      "nama_list": "Belanja Bulanan",
      "tanggal_deadline": "2025-07-15T10:00:00.000Z",
      "status": true
    }
    ```
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "message": "Catatan berhasil diperbarui"
    }
    ```
  - **Respon Gagal (404 Not Found)**:
    ```json
    {
        "status": "fail",
        "message": "Gagal memperbarui. Catatan tidak ditemukan."
    }
    ```

#### `DELETE /catatan/{id}`

Menghapus sebuah catatan berdasarkan ID.

  - **Auth Diperlukan**: Ya
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "message": "Catatan berhasil dihapus"
    }
    ```
  - **Respon Gagal (404 Not Found)**:
    ```json
    {
        "status": "fail",
        "message": "Gagal menghapus. Catatan tidak ditemukan."
    }
    ```

#### `GET /catatan/filter`

Mendapatkan catatan yang belum selesai (`status: false`) dengan filter tambahan.

  - **Auth Diperlukan**: Ya
  - **Query Parameters**:
      - `deadlineWithin7Days` (string): Set ke `'true'` untuk memfilter catatan yang memiliki deadline dalam 7 hari dari sekarang.
  - **Contoh URL**: `/catatan/filter?deadlineWithin7Days=true`
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "data": [
            // ... array of catatan objects
        ]
    }
    ```

#### `DELETE /catatan/hapusBeres`

Menghapus semua catatan yang sudah selesai (`status: true`).

  - **Auth Diperlukan**: Ya
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "message": "Berhasil menghapus 5 catatan."
    }
    ```

### Todo Item

Setiap `catatan` dapat memiliki satu `todo_item` (berformat JSONB) yang berisi detail lebih lanjut.

#### `POST /catatan/{id}/todoItem`

Menambahkan atau mengganti `todo_item` pada sebuah catatan.

  - **Auth Diperlukan**: Ya
  - **Request Body**:
    ```json
    {
      "judul": "Detail Laporan",
      "isi": "Kumpulkan data penjualan Q2 dan analisis tren."
    }
    ```
  - **Respon Sukses (201 Created)**:
    ```json
    {
        "status": "success",
        "message": "Todo item berhasil ditambahkan",
        "data": {
            "judul": "Detail Laporan",
            "isi": "Kumpulkan data penjualan Q2 dan analisis tren.",
            "terakhirDiperbarui": "2025-06-25T12:00:00.000Z"
        }
    }
    ```
  - **Respon Gagal (404 Not Found)**:
    ```json
    {
        "status": "fail",
        "message": "Catatan tidak ditemukan"
    }
    ```

#### `PUT /catatan/{id}/todoItem`

Memperbarui `todo_item` pada sebuah catatan.

  - **Auth Diperlukan**: Ya
  - **Request Body** (minimal satu field):
    ```json
    {
      "isi": "Kumpulkan data penjualan Q2, analisis tren, dan buat presentasi."
    }
    ```
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "message": "Todo item berhasil diperbarui",
        "data": {
            "judul": "Detail Laporan",
            "isi": "Kumpulkan data penjualan Q2, analisis tren, dan buat presentasi.",
            "terakhirDiperbarui": "2025-06-25T12:30:00.000Z"
        }
    }
    ```
  - **Respon Gagal (404 Not Found)**:
    ```json
    {
        "status": "fail",
        "message": "Catatan tidak memiliki todo item"
    }
    ```

#### `DELETE /catatan/{id}/todoItem`

Menghapus `todo_item` dari sebuah catatan (mengatur nilainya menjadi `null`).

  - **Auth Diperlukan**: Ya
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "message": "Todo item berhasil dihapus"
    }
    ```

### Kategori

Endpoint untuk mengelola kategori.

#### `GET /kategori`

Mendapatkan daftar semua kategori milik pengguna beserta jumlah catatan di dalamnya.

  - **Auth Diperlukan**: Ya
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "data": [
            {
                "kategori": "Pekerjaan",
                "jumlahCatatan": 5
            },
            {
                "kategori": "Pribadi",
                "jumlahCatatan": 10
            },
            {
                "kategori": "Olahraga",
                "jumlahCatatan": 0
            }
        ]
    }
    ```

#### `POST /kategori`

Membuat kategori baru. Nama kategori untuk satu pengguna harus unik.

  - **Auth Diperlukan**: Ya
  - **Request Body**:
    ```json
    {
      "kategori": "Belajar"
    }
    ```
  - **Respon Sukses (201 Created)**:
    ```json
    {
        "status": "success",
        "message": "Kategori berhasil ditambahkan",
        "data": {
            "id": 123,
            "user_id": "user-uuid",
            "nama": "Belajar",
            "created_at": "..."
        }
    }
    ```
  - **Respon Gagal (409 Conflict)**:
    ```json
    {
        "status": "fail",
        "message": "Kategori sudah ada"
    }
    ```

### Grafik

Endpoint untuk menyediakan data agregat yang siap digunakan untuk visualisasi.

#### `GET /grafik`

Mendapatkan data jumlah tugas yang selesai per hari untuk rentang 7 hari.

  - **Auth Diperlukan**: Ya
  - **Query Parameters**:
      - `tanggalAwal` (string, format: `YYYY-MM-DD`): Tanggal awal dari rentang 7 hari yang ingin ditampilkan.
  - **Contoh URL**: `/grafik?tanggalAwal=2025-06-18`
  - **Respon Sukses (200 OK)**:
    ```json
    {
        "status": "success",
        "data": [
            {
                "tanggal": "2025-06-18T00:00:00",
                "jumlah_selesai": 2
            },
            {
                "tanggal": "2025-06-19T00:00:00",
                "jumlah_selesai": 0
            },
            {
                "tanggal": "2025-06-20T00:00:00",
                "jumlah_selesai": 5
            }
            // ... data untuk 7 hari
        ]
    }
    ```
  - **Respon Error (500 Internal Server Error)**:
    ```json
    {
        "status": "error",
        "message": "Gagal mengambil data grafik: ..."
    }
    ```