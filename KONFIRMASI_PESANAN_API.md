# API Dokumentasi: Konfirmasi Pesanan Admin

Endpoint ini digunakan oleh Admin Toko untuk mengelola antrean konfirmasi, baik konfirmasi pembayaran maupun konfirmasi pesanan baru.

**Base URL:** `/api/v1/admin/konfirmasi_pesanan`

---

## 1. Ambil Daftar Antrean
Mengambil daftar pesanan yang memerlukan tindakan konfirmasi.

- **URL:** `/`
- **Method:** `GET`
- **Query Params:**
  - `tab` (optional): `pembayaran` (default) atau `pesanan_baru`
- **Headers:**
  - `Authorization: Bearer <token_admin>`

### Contoh Response (Success)
```json
{
  "success": true,
  "message": "Daftar antrean pembayaran berhasil diambil",
  "data": [
    {
      "id_orders": 12,
      "kode_order": "CK-20231027-001",
      "status_order": "menunggu_konfirmasi",
      "status_pembayaran": "waiting_confirmation",
      "upload_bkt_byr": "https://...",
      "customers": {
        "nama": "Budi Santoso",
        "nomor_hp": "08123456789"
      },
      "detail_orders": [...]
    }
  ]
}
```

---

## 2. Konfirmasi Pembayaran
Menyetujui atau menolak bukti pembayaran yang diunggah customer.

- **URL:** `/pembayaran/:id_orders`
- **Method:** `PATCH`
- **Headers:**
  - `Authorization: Bearer <token_admin>`
- **Body:**
```json
{
  "action": "approve", // atau "reject"
  "reason": "Bukti transfer tidak terbaca" // Opsional, wajib jika reject
}
```

### Efek Action:
- **approve**: 
  - `status_pembayaran` -> `paid`
  - `status_order` -> `dikonfirmasi`
- **reject**:
  - `status_pembayaran` -> `rejected`
  - `status_order` -> `dibatalkan`

---

## 3. Konfirmasi Pesanan Baru
Menyetujui atau menolak pesanan baru (biasanya untuk metode COD atau pesanan yang sudah lunas).

- **URL:** `/pesanan/:id_orders`
- **Method:** `PATCH`
- **Headers:**
  - `Authorization: Bearer <token_admin>`
- **Body:**
```json
{
  "action": "approve", // atau "reject"
  "reason": "Stok bahan sedang habis" // Opsional
}
```

### Efek Action:
- **approve**: `status_order` -> `dikonfirmasi`
- **reject**: `status_order` -> `dibatalkan`

---

## Cara Mencoba di Postman
1. Pastikan sudah login sebagai Admin Toko dan mendapatkan token.
2. Masukkan token di tab **Authorization** -> **Bearer Token**.
3. Gunakan `GET` untuk melihat daftar antrean.
4. Gunakan `PATCH` dengan ID Order yang sesuai untuk melakukan konfirmasi.
