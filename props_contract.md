# API Contract Documentation - CareKicks

## Base URL
```
http://localhost:3000/api
```

---

## 1. DASHBOARD ENDPOINTS

### 1.1 GET /dashboard
**Description:** Mendapatkan summary dashboard untuk shop/staff (digunakan di halaman Dashboard utama)

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
- id_shops: number (required) - ID toko
- id_staff: number (optional) - ID staff jika role staff
```

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "greeting": "Halo, Kurator.",
    "shop_info": {
      "id_shops": 1,
      "nm_toko": "Bengkel Sepatu",
      "saldo_toko": 4250000
    },
    "pesanan_aktif": {
      "total": 12,
      "hari_ini": 2
    },
    "antrean_cuci": {
      "total": 8,
      "detail": [
        {
          "jenis": "Deep Cleaning",
          "jumlah": 4
        },
        {
          "jenis": "Unyellowing",
          "jumlah": 3
        }
      ]
    },
    "saldo_toko": 4250000,
    "aktivitas_terkini": [
      {
        "id_orders": 1,
        "kode_order": "#RSK-8821",
        "tgl_order": "2024-05-05T10:30:00Z",
        "status_order": "SEDANG DICUCI",
        "nama_produk": "Nike Air Jordan 1 Retro",
        "nama_pelanggan": "Budi Santoso",
        "nama_staff": "Andi Wijaya",
        "foto_produk": "https://...",
        "jenis_layanan": "Deep Cleaning"
      },
      {
        "id_orders": 2,
        "kode_order": "#RSK-8819",
        "tgl_order": "2024-05-05T09:15:00Z",
        "status_order": "SELESAI",
        "nama_produk": "Adidas Stan Smith",
        "nama_pelanggan": "Siti Aminah",
        "nama_staff": "Ratna Sari",
        "foto_produk": "https://...",
        "jenis_layanan": "Regular Cleaning"
      }
    ]
  }
}
```

**Error Response (400/401/500):**
```json
{
  "success": false,
  "message": "Error message",
  "error_code": "INVALID_SHOP_ID"
}
```

---

## 2. ORDERS/HISTORY ENDPOINTS

### 2.1 GET /orders
**Description:** Mendapatkan list pesanan dengan filter dan pagination (Riwayat Aktivitas)

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
- id_shops: number (required)
- status: string (optional) - "SEMUA", "ANTREAN", "DICUCI", "SIAP_AMBIL", "SELESAI", "DIBATALKAN"
- search: string (optional) - search by order ID or customer name
- page: number (default: 1)
- limit: number (default: 10, max: 50)
- sort_by: string (default: "tgl_order") - "tgl_order", "status_order"
- sort_order: string (default: "DESC") - "ASC", "DESC"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "total_pages": 5,
    "orders": [
      {
        "id_orders": 1,
        "kode_order": "#RSK-8821",
        "tgl_order": "2024-05-05T10:30:00Z",
        "status_order": "SEDANG_DICUCI",
        "nama_pelanggan": "Budi Santoso",
        "no_hp_pelanggan": "081234567890",
        "nama_produk": "Nike Air Jordan 1 Retro",
        "jenis_layanan": [
          {
            "nama_layanan": "Deep Cleaning",
            "harga": 30000
          }
        ],
        "total_harga": 30000,
        "nama_staff": "Andi Wijaya",
        "foto_produk": "https://...",
        "metode_bayar": "TUNAI",
        "status_pembayaran": "LUNAS"
      },
      {
        "id_orders": 2,
        "kode_order": "#RSK-8819",
        "tgl_order": "2024-05-05T09:15:00Z",
        "status_order": "SELESAI",
        "nama_pelanggan": "Siti Aminah",
        "no_hp_pelanggan": "081987654321",
        "nama_produk": "Adidas Stan Smith",
        "jenis_layanan": [
          {
            "nama_layanan": "Regular Cleaning",
            "harga": 25000
          }
        ],
        "total_harga": 25000,
        "nama_staff": "Ratna Sari",
        "foto_produk": "https://...",
        "metode_bayar": "QRIS",
        "status_pembayaran": "LUNAS"
      }
    ]
  }
}
```

---

### 2.2 GET /orders/:id
**Description:** Mendapatkan detail order spesifik

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Path Parameters:**
```
- id: number - ID order
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order detail retrieved successfully",
  "data": {
    "order": {
      "id_orders": 1,
      "kode_order": "#RSK-8821",
      "tgl_order": "2024-05-05T10:30:00Z",
      "status_order": "SEDANG_DICUCI",
      "metode_order": "MANUAL",
      "metode_bayar": "TUNAI",
      "status_pembayaran": "LUNAS"
    },
    "customer": {
      "id_customers": 5,
      "nama": "Budi Santoso",
      "no_hp": "081234567890",
      "alamat": "Jl. Merdeka No. 123",
      "latitude": -6.2088,
      "longitude": 106.8456
    },
    "detail_items": [
      {
        "id_detail_orders": 1,
        "id_services": 1,
        "nama_layanan": "Deep Cleaning",
        "harga_layanan": 30000,
        "merk": "Nike",
        "jenis_sepatu": "Sneaker",
        "warna": "Red",
        "foto_sebelum": "https://...",
        "foto_sesudah": "https://...",
        "catatan": "Ada lecet di bagian heel",
        "review": "Sangat puas dengan hasilnya",
        "total_harga": 30000
      }
    ],
    "tracking": [
      {
        "status": "ORDER_MASUK",
        "waktu": "2024-05-05T10:30:00Z",
        "keterangan": "Pesanan diterima",
        "nama_staff": "Admin"
      },
      {
        "status": "SEDANG_DICUCI",
        "waktu": "2024-05-05T11:00:00Z",
        "keterangan": "Proses cuci dimulai",
        "nama_staff": "Andi Wijaya",
        "latitude": -6.2088,
        "longitude": 106.8456
      }
    ],
    "qr_info": {
      "kode_qr": "https://...",
      "link_qr": "https://carekicks.com/track/RSK-8821"
    }
  }
}
```

---

## 3. SERVICES ENDPOINTS

### 3.1 GET /services
**Description:** Mendapatkan list services yang tersedia di shop (untuk form input pesanan)

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
- id_shops: number (required)
- is_active: boolean (default: true)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": {
    "services": [
      {
        "id_services": 1,
        "nama_layanan": "Deep Cleaning",
        "harga": 30000,
        "estimasi_waktu": "2-3 hari",
        "deskripsi": "Pembersihan menyeluruh dengan chemical treatment",
        "is_active": true
      },
      {
        "id_services": 2,
        "nama_layanan": "Unyellowing",
        "harga": 50000,
        "estimasi_waktu": "3-4 hari",
        "deskripsi": "Menghilangkan noda kuning pada sepatu putih",
        "is_active": true
      },
      {
        "id_services": 3,
        "nama_layanan": "Waterproofing",
        "harga": 25000,
        "estimasi_waktu": "1 hari",
        "deskripsi": "Perlindungan dari air dan noda",
        "is_active": true
      }
    ]
  }
}
```

---

## 4. CREATE ORDER ENDPOINTS

### 4.1 POST /orders
**Description:** Membuat pesanan baru (digunakan di halaman Input Pesanan Baru)

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "id_shops": 1,
  "id_customer": 5,
  "metode_order": "MANUAL",
  "metode_bayar": "TUNAI",
  "alamat_pengantaran": "Jl. Merdeka No. 123",
  "lat_order": -6.2088,
  "long_order": 106.8456,
  "detail_items": [
    {
      "id_services": 1,
      "merk": "Nike",
      "jenis_sepatu": "Sneaker",
      "warna": "Red",
      "catatan": "Ada lecet di bagian heel"
    },
    {
      "id_services": 2,
      "merk": "Nike",
      "jenis_sepatu": "Sneaker",
      "warna": "Red",
      "catatan": ""
    }
  ],
  "total_ongkir": 0
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id_orders": 1,
    "kode_order": "#RSK-8821",
    "tgl_order": "2024-05-05T10:30:00Z",
    "status_order": "ORDER_MASUK",
    "status_pembayaran": "PENDING",
    "total_harga": 80000,
    "qr_info": {
      "kode_qr": "data:image/png;base64,...",
      "link_qr": "https://carekicks.com/track/RSK-8821"
    }
  }
}
```

---

### 4.2 POST /orders/:id/upload-image
**Description:** Upload foto kondisi awal/akhir sepatu

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "multipart/form-data"
}
```

**Path Parameters:**
```
- id: number - ID order
```

**Form Data:**
```
- file: File (required) - Image file (max 5MB, jpg/png)
- type: string (required) - "SEBELUM" atau "SESUDAH"
- id_detail_orders: number (required) - ID detail order
```

**Response (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id_detail_orders": 1,
    "foto_sebelum": "https://...",
    "foto_sesudah": null
  }
}
```

---

### 4.3 POST /orders/:id/process-qr
**Description:** Generate QR code untuk order (proses pesanan & buat QR)

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Path Parameters:**
```
- id: number - ID order
```

**Request Body:**
```json
{
  "status_pembayaran": "LUNAS",
  "bukti_pembayaran": "https://..." (optional untuk QRIS)
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order processed and QR code generated",
  "data": {
    "id_orders": 1,
    "kode_order": "#RSK-8821",
    "qr_code": {
      "image": "data:image/png;base64,...",
      "link": "https://carekicks.com/track/RSK-8821"
    },
    "status_order": "ORDER_MASUK",
    "status_pembayaran": "LUNAS"
  }
}
```

---

## 5. CUSTOMER ENDPOINTS

### 5.1 POST /customers
**Description:** Membuat customer baru (dari form input pesanan)

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "id_user": 1,
  "nama": "Budi Santoso",
  "no_hp": "081234567890",
  "alamat": "Jl. Merdeka No. 123",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id_customers": 5,
    "id_user": 1,
    "nama": "Budi Santoso",
    "no_hp": "081234567890",
    "alamat": "Jl. Merdeka No. 123",
    "latitude": -6.2088,
    "longitude": 106.8456
  }
}
```

---

### 5.2 GET /customers/:id
**Description:** Mendapatkan data customer

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Path Parameters:**
```
- id: number - ID customer
```

**Response (200):**
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "id_customers": 5,
    "nama": "Budi Santoso",
    "no_hp": "081234567890",
    "alamat": "Jl. Merdeka No. 123",
    "latitude": -6.2088,
    "longitude": 106.8456
  }
}
```

---

### 5.3 POST /customers/search
**Description:** Search customer berdasarkan nama atau nomor telepon

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "query": "Budi"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Search results",
  "data": {
    "results": [
      {
        "id_customers": 5,
        "nama": "Budi Santoso",
        "no_hp": "081234567890",
        "alamat": "Jl. Merdeka No. 123"
      }
    ]
  }
}
```

---

## 6. STATUS UPDATE ENDPOINTS

### 6.1 PATCH /orders/:id/status
**Description:** Update status order (untuk tracking)

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Path Parameters:**
```
- id: number - ID order
```

**Request Body:**
```json
{
  "status_order": "SEDANG_DICUCI",
  "id_staff": 1,
  "latitude": -6.2088,
  "longitude": 106.8456,
  "keterangan": "Proses cuci dimulai"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id_orders": 1,
    "status_order": "SEDANG_DICUCI",
    "tracking_log": {
      "id_tracking_logs": 10,
      "status": "SEDANG_DICUCI",
      "waktu": "2024-05-05T11:00:00Z",
      "keterangan": "Proses cuci dimulai"
    }
  }
}
```

---

## 7. NOTIFICATION ENDPOINTS

### 7.1 GET /notifications
**Description:** Mendapatkan notifikasi untuk user

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
- id_user: number (required)
- is_read: boolean (optional)
- limit: number (default: 20)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "id_notification": 1,
        "title": "Pesanan Baru",
        "message": "Pesanan #RSK-8821 dari Budi Santoso telah masuk",
        "type_notification": "ORDER_CREATED",
        "id_orders": 1,
        "is_read": false,
        "created_at": "2024-05-05T10:30:00Z"
      }
    ]
  }
}
```

---

### 7.2 PATCH /notifications/:id/read
**Description:** Mark notifikasi sebagai sudah dibaca

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Path Parameters:**
```
- id: number - ID notification
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id_notification": 1,
    "is_read": true
  }
}
```

---

## Error Response Format

Semua error response mengikuti format:

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "details": {} // optional, untuk error detail
}
```

### Common Error Codes:
- `INVALID_REQUEST` - Request tidak valid
- `UNAUTHORIZED` - Token tidak valid/expired
- `FORBIDDEN` - User tidak memiliki akses
- `NOT_FOUND` - Resource tidak ditemukan
- `CONFLICT` - Data conflict
- `UNPROCESSABLE_ENTITY` - Data validation error
- `INTERNAL_SERVER_ERROR` - Server error

---

## Authentication

Semua endpoint memerlukan **Bearer Token** di header:

```
Authorization: Bearer {JWT_TOKEN}
```

---

## Status Order Values

- `ORDER_MASUK` - Pesanan baru masuk
- `ANTREAN` - Menunggu proses
- `SEDANG_DICUCI` - Sedang dalam proses cuci
- `QUALITY_CHECK` - Pemeriksaan kualitas
- `SIAP_AMBIL` - Siap diambil/dikirim
- `SELESAI` - Pesanan selesai
- `DIBATALKAN` - Pesanan dibatalkan

---

## Status Pembayaran Values

- `PENDING` - Menunggu pembayaran
- `LUNAS` - Pembayaran selesai
- `GAGAL` - Pembayaran gagal

---

## Metode Pembayaran Values

- `TUNAI` - Pembayaran tunai
- `QRIS` - Pembayaran via QRIS
- `TRANSFER` - Transfer bank

---

## Metode Order Values

- `QR_SCAN` - Order via scan QR
- `MANUAL` - Input manual/walk-in

