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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing untuk performa
CREATE INDEX idx_inventory_shop ON public.inventory(id_shops);
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
- **Body:**
```json
{
    "nama_item": "Sikat Bulu Kuda",
    "kategori": "Alat Gosok",
    "stok_saat_ini": 3,
    "stok_maksimum": 10,
    "stok_minimum": 5,
    "satuan": "Unit"
}
```

### 4. Update Item
Mengubah informasi item inventaris.

- **URL:** `/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Bearer Token)
- **Body:** (Semua field optional)
```json
{
    "stok_saat_ini": 15
}
```

### 5. Tambah Stok (Increment)
Menambahkan jumlah stok ke item yang sudah ada (Fitur "Tambah Stok").

- **URL:** `/:id/add-stock`
- **Method:** `POST`
- **Auth Required:** Yes (Bearer Token)
- **Body:**
```json
{
    "amount": 500
}
```

### 6. Hapus Item
Menghapus item dari inventaris.

- **URL:** `/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Bearer Token)
