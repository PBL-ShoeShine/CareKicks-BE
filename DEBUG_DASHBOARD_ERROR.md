# Checklist untuk Debug Error Dashboard

## Error yang dialami:
```
{
    "success": false,
    "message": "Cannot coerce the result to a single JSON object",
    "error_code": "INTERNAL_SERVER_ERROR"
}
```

## Kemungkinan Penyebab & Solusi:

### 1. ❌ Belum Ada Data di Database
**Cek apakah ada data:**
```sql
-- Di Supabase SQL Editor
SELECT * FROM shops LIMIT 5;
SELECT * FROM orders LIMIT 5;
SELECT * FROM detail_orders LIMIT 5;
```

**Jika belum ada data:**
Perlu insert data dummy terlebih dahulu!

---

### 2. ✅ Foreign Key Error
**Cek relasi:**
- orders.id_shops harus referensi ke shops.id_shops
- orders.id_customer harus referensi ke customers.id_customers
- detail_orders.id_orders harus referensi ke orders.id_orders
- detail_orders.id_services harus referensi ke services.id_services

**Solusi:** Pastikan semua foreign keys sudah benar di Supabase

---

### 3. ✅ RLS Policy Error
**Pastikan RLS disabled atau policy benar**

Di Supabase → Authentication → Policies → Pastikan:
- Tidak ada RLS yang blocking read access
- Atau setup RLS yang proper

---

## Langkah Testing Sekarang:

### Step 1: Start Server dengan Debug Log
```bash
npm run dev
```

Lihat console untuk error detail lebih lengkap.

### Step 2: Cek Console Output
Setelah request, cek di terminal server apakah ada error message yang lebih spesifik.

### Step 3: Test Query Secara Manual
Di Supabase SQL Editor, run query ini:

```sql
-- Cek data shop
SELECT id_shops, nm_toko, saldo_toko FROM shops WHERE id_shops = 1;

-- Cek data orders
SELECT id_orders, kode_order, id_shops, status_order FROM orders WHERE id_shops = 1 LIMIT 5;

-- Cek relasi
SELECT o.id_orders, o.kode_order, s.nm_toko
FROM orders o
LEFT JOIN shops s ON o.id_shops = s.id_shops
WHERE o.id_shops = 1 LIMIT 5;
```

### Step 4: Jika Query Bagus
Kirim request kembali ke endpoint:
```
GET http://localhost:3000/api/v1/admin/dashboard?id_shops=1
Authorization: Bearer {token}
```

---

## Troubleshooting Checklist

- [ ] Server jalan dengan `npm run dev`
- [ ] Database Supabase connected (check .env)
- [ ] Ada data di tabel `shops` dengan id_shops=1
- [ ] Ada data di tabel `orders` dengan id_shops=1
- [ ] Foreign key relations sesuai
- [ ] RLS policy tidak blocking query
- [ ] Token valid dari login
- [ ] Ulang test setelah semua fix

