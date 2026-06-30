# Panduan Testing di Postman - Dashboard API

## ⚙️ Setup Environment di Postman

### Step 1: Buat Environment Baru

1. Buka Postman
2. Klik **Environments** (sebelah kiri)
3. Klik **Create** atau **+** 
4. Nama: `CareKicks Local`
5. Tambahkan Variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | http://localhost:3000/api/v1 | http://localhost:3000/api/v1 |
| `token` | (kosong) | (nanti diisi) |
| `id_shops` | 1 | 1 |

**Screenshot:**
```
Environments → CareKicks Local → Add Variables
├── base_url: http://localhost:3000/api/v1
├── token: (biarkan kosong dulu)
└── id_shops: 1
```

---

## 🔑 Step 1: Login Dulu (Dapatkan Token)

### Request Login

**Method:** `POST`  
**URL:** `{{base_url}}/user/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@carekicks.com",
  "password": "password123"
}
```

### Expected Response (200)

```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzE0OTI5MzAwLCJleHAiOjE3MTU1MzQxMDB9.abc123...",
  "user": {
    "id_user": 1,
    "username": "admin",
    "email": "admin@carekicks.com",
    "jenis_role": "admin",
    "nama": "Administrator",
    "no_hp": "081234567890"
  }
}
```

### Step: Copy Token ke Environment

1. Response didapat ✅
2. Copy nilai dari field `token`
3. Pergi ke **Environments** → **CareKicks Local**
4. Paste di column **Current Value** untuk variable `token`
5. Klik **Save**

**Example:**
```
token (Current Value): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzE0OTI5MzAwLCJleHAiOjE3MTU1MzQxMDB9.abc123...
```

---

## 📊 Step 2: Test Dashboard Endpoint

### Request Configuration

**Method:** `GET`  
**URL:** `{{base_url}}/admin/dashboard?id_shops={{id_shops}}`

**Full URL yang dipanggil:**
```
http://localhost:3000/api/v1/admin/dashboard?id_shops=1
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:** Kosong (GET request tidak perlu body)

### Visual di Postman

```
┌─────────────────────────────────────────────────────────┐
│ GET  {{base_url}}/admin/dashboard?id_shops={{id_shops}}  │
├─────────────────────────────────────────────────────────┤
│ Headers Tab:                                            │
│ ├─ Authorization: Bearer {{token}}                      │
│ └─ Content-Type: application/json                       │
│                                                          │
│ Params Tab:                                             │
│ ├─ id_shops: {{id_shops}}                              │
│                                                          │
│ Body: (kosong - tidak ada body untuk GET)               │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Expected Response (200 OK)

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "greeting": "Halo, Bengkel.",
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
        },
        {
          "jenis": "Regular Cleaning",
          "jumlah": 1
        }
      ]
    },
    "saldo_toko": 4250000,
    "aktivitas_terkini": [
      {
        "id_orders": 1,
        "kode_order": "#RSK-8821",
        "tgl_order": "2024-05-05T10:30:00Z",
        "status_order": "SEDANG_DICUCI",
        "nama_produk": "Deep Cleaning",
        "nama_pelanggan": "Budi Santoso",
        "nama_staff": "Andi Wijaya",
        "foto_produk": "https://via.placeholder.com/150",
        "jenis_layanan": "Deep Cleaning"
      },
      {
        "id_orders": 2,
        "kode_order": "#RSK-8819",
        "tgl_order": "2024-05-05T09:15:00Z",
        "status_order": "SELESAI",
        "nama_produk": "Regular Cleaning",
        "nama_pelanggan": "Siti Aminah",
        "nama_staff": "Ratna Sari",
        "foto_produk": "https://via.placeholder.com/150",
        "jenis_layanan": "Regular Cleaning"
      },
      {
        "id_orders": 3,
        "kode_order": "#RSK-8790",
        "tgl_order": "2024-05-05T08:45:00Z",
        "status_order": "ANTREAN",
        "nama_produk": "Deep Cleaning",
        "nama_pelanggan": "Denny Hermawan",
        "nama_staff": "Not assigned",
        "foto_produk": "https://via.placeholder.com/150",
        "jenis_layanan": "Deep Cleaning"
      }
    ]
  }
}
```

---

## ❌ Error Responses

### 1. Missing id_shops Parameter (400)

**Request:**
```
GET http://localhost:3000/api/v1/admin/dashboard
```

**Response:**
```json
{
  "success": false,
  "message": "id_shops query parameter is required",
  "error_code": "MISSING_PARAMETER"
}
```

---

### 2. Missing Authorization Header (401)

**Request:**
```
GET http://localhost:3000/api/v1/admin/dashboard?id_shops=1
Headers:
  (tanpa Authorization header)
```

**Response:**
```json
{
  "success": false,
  "message": "Authorization header missing or invalid",
  "error_code": "UNAUTHORIZED"
}
```

---

### 3. Invalid Token (401)

**Request:**
```
GET http://localhost:3000/api/v1/admin/dashboard?id_shops=1
Headers:
  Authorization: Bearer invalid_token_xxx
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid token",
  "error_code": "INVALID_TOKEN"
}
```

---

### 4. Token Expired (401)

**Response:**
```json
{
  "success": false,
  "message": "Token expired",
  "error_code": "TOKEN_EXPIRED"
}
```

**Solusi:** Login ulang untuk mendapatkan token baru

---

### 5. Shop Not Found (500)

**Response:**
```json
{
  "success": false,
  "message": "Cannot read property 'nm_toko' of null",
  "error_code": "INTERNAL_SERVER_ERROR"
}
```

**Solusi:** Pastikan `id_shops` yang digunakan ada di database

---

## 📝 Langkah-Langkah Lengkap Testing

### Setup (Lakukan 1x)
1. ✅ Jalankan server: `npm run dev`
2. ✅ Buka Postman
3. ✅ Buat Environment `CareKicks Local`
4. ✅ Set variables: `base_url`, `id_shops`

### Testing (Ulangi setiap testing session)

**Fase 1: Login**
1. Buat request baru dengan method `POST`
2. URL: `{{base_url}}/user/login`
3. Headers: `Content-Type: application/json`
4. Body (raw):
   ```json
   {
     "email": "admin@carekicks.com",
     "password": "password123"
   }
   ```
5. Klik **Send**
6. Copy token dari response
7. Update environment variable `token` dengan token yang di-copy

**Fase 2: Dashboard**
1. Buat request baru dengan method `GET`
2. URL: `{{base_url}}/admin/dashboard?id_shops={{id_shops}}`
3. Headers:
   ```
   Authorization: Bearer {{token}}
   Content-Type: application/json
   ```
4. Body: Kosong
5. Klik **Send**
6. Lihat response di bawah

---

## 🔄 Menggunakan Pre-request Script (Optional)

Buat script otomatis untuk login dan update token:

**Di tab "Pre-request Script":**
```javascript
// Jika belum ada token atau butuh refresh
const loginRequest = {
  url: pm.environment.get("base_url") + "/user/login",
  method: 'POST',
  header: {
    'Content-Type': 'application/json'
  },
  body: {
    mode: 'raw',
    raw: JSON.stringify({
      email: "admin@carekicks.com",
      password: "password123"
    })
  }
};

pm.sendRequest(loginRequest, function (err, response) {
  if (!err) {
    const responseBody = response.json();
    pm.environment.set("token", responseBody.token);
    console.log("✅ Token updated automatically!");
  }
});
```

---

## 💾 Export Collection untuk Share

1. Buka Collection
2. Klik **...**  (3 dots)
3. Pilih **Export**
4. Format: **Collection v2.1**
5. Save as `CareKicks-API.postman_collection.json`

Sekarang team bisa import collection ini!

---

## 📋 Checklist Testing

- [ ] Environment `CareKicks Local` dibuat
- [ ] Variables `base_url`, `token`, `id_shops` diset
- [ ] Server running (`npm run dev`)
- [ ] Login endpoint berhasil & dapat token
- [ ] Token di-copy ke environment
- [ ] Dashboard endpoint berhasil (200 OK)
- [ ] Response sesuai contract
- [ ] Error handling tested

---

## 🚀 Quick Reference - Copy-Paste Ready

### Login Request (POST)
```
Method: POST
URL: http://localhost:3000/api/v1/user/login
Headers:
  Content-Type: application/json

Body (raw):
{
  "email": "admin@carekicks.com",
  "password": "password123"
}
```

### Dashboard Request (GET)
```
Method: GET
URL: http://localhost:3000/api/v1/admin/dashboard?id_shops=1
Headers:
  Authorization: Bearer {PASTE_TOKEN_HERE}
  Content-Type: application/json

Body: (kosong)
```

---

## ⚠️ Troubleshooting

| Problem | Solusi |
|---------|--------|
| **404 Not Found** | Pastikan route sudah diregister di `routes/index.js` |
| **401 Unauthorized** | Login dulu & pastikan token valid |
| **500 Internal Error** | Check console di server & pastikan DB terhubung |
| **Variables tidak bekerja** | Pastikan environment sudah di-select di top-right Postman |
| **Token masih error setelah copy** | Coba format: `Bearer {token}` dengan spasi |

