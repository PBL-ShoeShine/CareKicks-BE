# API Dokumentasi: Manajemen Inventaris (Admin)

Base URL: `/api/v1/admin/inventaris`

## Persiapan Database (Supabase SQL Editor)
Silakan jalankan query berikut di SQL Editor Supabase Anda untuk membuat tabel yang diperlukan:

```sql
CREATE TABLE public.inventory (
  id_inventory SERIAL PRIMARY KEY,
  id_shops INTEGER NOT NULL REFERENCES public.shops(id_shops),
  nama_item VARCHAR NOT NULL,
  kategori VARCHAR,
  stok_saat_ini NUMERIC DEFAULT 0,
  stok_maksimum NUMERIC DEFAULT 0,
  stok_minimum NUMERIC DEFAULT 0,
  satuan VARCHAR, -- ml, Unit, Pcs, dll
  foto_inven TEXT, -- URL Public dari Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Endpoint API

### 1. Ambil Semua Item Inventaris
Mengambil daftar bahan baku/stok milik toko.

- **URL:** `/`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Query Params:**
  - `search`: (Optional) Mencari nama item.
  - `category`: (Optional) Filter kategori.
- **Success Response:**
```json
{
    "success": true,
    "message": "Inventory items retrieved successfully",
    "data": [
        {
            "id_inventory": 1,
            "id_shops": 5,
            "nama_item": "Sabun Pembersih Premium",
            "kategori": "Cairan Pembersih",
            "stok_saat_ini": 850,
            "stok_maksimum": 1000,
            "stok_minimum": 200,
            "satuan": "ml",
            "foto_inven": "https://...supabase.../services/inventory_123.jpg",
            "created_at": "...",
            "updated_at": "..."
        }
    ]
}
```

### 2. Ambil Ringkasan Stok
Mengambil total jenis produk dan jumlah item yang perlu restock.

- **URL:** `/summary`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Success Response:**
```json
{
    "success": true,
    "message": "Inventory summary retrieved successfully",
    "data": {
        "total_jenis": 42,
        "butuh_restock": 3
    }
}
```

### 3. Tambah Item Baru
Menambahkan item inventaris baru ke dalam daftar.

- **URL:** `/`
- **Method:** `POST`
- **Auth Required:** Yes (Bearer Token)
- **Body Format:** `multipart/form-data`
- **Fields:**
  - `nama_item`: (Required) String
  - `kategori`: String
  - `stok_saat_ini`: Number
  - `stok_maksimum`: Number
  - `stok_minimum`: Number
  - `satuan`: String
  - `foto_inven`: (Optional) File (Image: JPG, PNG, WEBP)

### 4. Update Item
Mengubah informasi item inventaris.

- **URL:** `/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Bearer Token)
- **Body Format:** `multipart/form-data`
- **Fields:** (Semua field optional)
  - `nama_item`: String
  - `kategori`: String
  - `stok_saat_ini`: Number
  - `stok_maksimum`: Number
  - `stok_minimum`: Number
  - `satuan`: String
  - `foto_inven`: File (Image: JPG, PNG, WEBP)

### 5. Tambah Stok (Increment)
Menambahkan jumlah stok ke item yang sudah ada (Fitur "Tambah Stok").

- **URL:** `/:id/add-stock`
- **Method:** `POST`
- **Auth Required:** Yes (Bearer Token)
- **Body Format:** `application/json`
- **Body:**
```json
{
    "amount": 500
}
```

### 6. Kurangi Stok (Decrement)
Mengurangi jumlah stok dari item yang sudah ada.

- **URL:** `/:id/reduce-stock`
- **Method:** `POST`
- **Auth Required:** Yes (Bearer Token)
- **Body Format:** `application/json`
- **Body:**
```json
{
    "amount": 100
}
```

### 7. Hapus Item
Menghapus item dari inventaris. Otomatis menghapus gambar dari storage jika ada.

- **URL:** `/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Bearer Token)

