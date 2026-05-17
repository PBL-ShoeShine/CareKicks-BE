# Dashboard API Implementation Guide

## File Structure Created

```
src/
├── features/
│   └── admin/
│       ├── index.js
│       ├── dashboard/
│       │   ├── dashboard.routes.js
│       │   ├── dashboard.controller.js
│       │   └── dashboard.service.js
│       └── antrean/
│           └── antrean.routes.js
├── core/
│   └── services/
│       └── auth.middleware.js
└── routes/
    └── index.js (UPDATED)
```

## Endpoint: GET /dashboard

### URL
```
GET /api/v1/admin/dashboard
```

### Query Parameters

```
id_shops: number (required) - ID toko
id_staff: number (optional) - ID staff jika role staff
```

### Headers

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Example Request

```bash
curl -X GET "http://localhost:3000/api/v1/admin/dashboard?id_shops=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Success Response (200)

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
        }
      ]
    },
    "saldo_toko": 4250000,
    "aktivitas_terkini": [
      {
        "id_orders": 1,
        "kode_order": "#RSK-8821",
        "tgl_order": "2024-05-05T10:30:00Z",
        "status_order": "diproses",
        "nama_produk": "Deep Cleaning",
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
        "nama_produk": "Regular Cleaning",
        "nama_pelanggan": "Siti Aminah",
        "nama_staff": "Ratna Sari",
        "foto_produk": "https://...",
        "jenis_layanan": "Regular Cleaning"
      },
      {
        "id_orders": 3,
        "kode_order": "#RSK-8790",
        "tgl_order": "2024-05-05T08:45:00Z",
        "status_order": "pending",
        "nama_produk": "Deep Cleaning",
        "nama_pelanggan": "Denny Hermawan",
        "nama_staff": "Not assigned",
        "foto_produk": "https://...",
        "jenis_layanan": "Deep Cleaning"
      }
    ]
  }
}
```

### Error Responses

#### Missing Query Parameter (400)

```json
{
  "success": false,
  "message": "id_shops query parameter is required",
  "error_code": "MISSING_PARAMETER"
}
```

#### Unauthorized (401)

```json
{
  "success": false,
  "message": "Authorization header missing or invalid",
  "error_code": "UNAUTHORIZED"
}
```

#### Invalid Token (401)

```json
{
  "success": false,
  "message": "Invalid token",
  "error_code": "INVALID_TOKEN"
}
```

#### Internal Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error",
  "error_code": "INTERNAL_SERVER_ERROR"
}
```

## Implementation Details

### Service Layer (dashboard.service.js)

**Main Functions:**
1. `getDashboardData(idShops, idStaff)` - Fetches all dashboard data

**Data Fetched:**
- Shop info & saldo from `shops` table
- Active orders count from `orders` table
- Queue items by service type from `detail_orders` + `services` tables
- Recent activities (max 3 items) with customer & staff info
- Photos from `detail_orders` table

### Controller Layer (dashboard.controller.js)

**Main Functions:**
1. `getDashboard(req, res)` - Handles incoming request & validation

**Validation:**
- Check `id_shops` query parameter is provided
- Validate JWT token via middleware

### Middleware (auth.middleware.js)

**Functionality:**
- Validates Bearer token from Authorization header
- Verifies JWT signature using JWT_SECRET
- Handles token expiration & invalid tokens
- Sets `req.user` with decoded token payload

---

## How It Works

### 1. Request Flow
```
Client Request
    ↓
auth.middleware (validate JWT token)
    ↓
dashboard.controller (validate params)
    ↓
dashboard.service (fetch data from Supabase)
    ↓
Response (formatted JSON)
```

### 2. Database Queries

**Query 1: Get Shop Info**
```sql
SELECT id_shops, nm_toko, saldo_toko
FROM shops
WHERE id_shops = ?
```

**Query 2: Get Today's Active Orders**
```sql
SELECT id_orders, status_order, tgl_order, kode_order
FROM orders
WHERE id_shops = ? 
  AND status_order != 'SELESAI'
  AND status_order != 'DIBATALKAN'
  AND tgl_order >= TODAY()
```

**Query 3: Get All Active Orders (30 days)**
```sql
SELECT id_orders, status_order
FROM orders
WHERE id_shops = ? 
  AND status_order != 'SELESAI'
  AND status_order != 'DIBATALKAN'
  AND tgl_order >= NOW() - INTERVAL 30 days
```

**Query 4: Get Queue by Service**
```sql
SELECT orders.id_orders, orders.status_order, 
       detail_orders.id_services, services.nama_layanan
FROM orders
JOIN detail_orders ON orders.id_orders = detail_orders.id_orders
JOIN services ON detail_orders.id_services = services.id_services
WHERE orders.id_shops = ? 
  AND orders.status_order IN ('ANTREAN', 'SEDANG_DICUCI', 'QUALITY_CHECK')
```

**Query 5: Get Recent Activities**
```sql
SELECT orders.*, customers.nama, staff_profile.nama, services.nama_layanan, detail_orders.foto_sebelum
FROM orders
LEFT JOIN customers ON orders.id_customer = customers.id_customers
LEFT JOIN staff ON orders.id_staff = staff.id_staff
LEFT JOIN staff_profile ON staff.id_staff_profile = staff_profile.id_staff_profile
LEFT JOIN detail_orders ON orders.id_orders = detail_orders.id_orders
LEFT JOIN services ON detail_orders.id_services = services.id_services
WHERE orders.id_shops = ?
ORDER BY orders.tgl_order DESC
LIMIT 20
```

---

## Testing with Postman

### 1. Create Environment Variable

Set in Postman Environment:
```
{
  "api_url": "http://localhost:3000/api/v1",
  "token": "YOUR_JWT_TOKEN_HERE"
}
```

### 2. Test Request

**Method:** GET  
**URL:** `{{api_url}}/admin/dashboard?id_shops=1`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Send Request and Check Response**

---

## Environment Variables Required

```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

---

## Next Steps

1. ✅ Dashboard endpoint implemented
2. Test with actual database
3. Implement remaining endpoints:
   - Orders list (GET /api/v1/admin/orders)
   - Order detail (GET /api/v1/admin/orders/:id)
   - Create order (POST /api/v1/admin/orders)
   - Update order status (PATCH /api/v1/admin/orders/:id/status)
   - Services list (GET /api/v1/admin/services)
   - Customers (POST/GET /api/v1/admin/customers)
   - Notifications (GET /api/v1/admin/notifications)

