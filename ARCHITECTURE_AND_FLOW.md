# Offline Order Input - Architecture & Flow

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Mobile App)                         │
│                   Input Pesanan Offline Form                     │
├─────────────────────────────────────────────────────────────────┤
│ Data Pelanggan    │ Jenis Sepatu │ Layanan │ Kondisi Awal │     │
│ - Nama Lengkap    │ - Sneakers   │ - List  │ - Photo      │     │
│ - Nomor Telepon   │ - Leather    │ - Price │ - Upload     │     │
│                   │ - Canvas     │ - Multi │              │     │
└────────────────────────┬──────────────────────────────────────────┘
                        ▼
         ┌──────────────────────────────┐
         │   POST Request JSON          │
         │  /api/v1/admin/inputoff      │
         │  (with Bearer JWT token)     │
         └──────────────┬───────────────┘
                        ▼
╔═════════════════════════════════════════════════════════════════╗
║              BACKEND - Node.js/Express                          ║
╠═════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  ┌──────────────────────────────────────────────────────────┐  ║
║  │ inputoff_routes.js                                       │  ║
║  │ POST / → authMiddleware → inputoff_controller            │  ║
║  └────────────────┬─────────────────────────────────────────┘  ║
║                   ▼                                             ║
║  ┌──────────────────────────────────────────────────────────┐  ║
║  │ inputoff_controller.js                                   │  ║
║  │ - Extract request body                                   │  ║
║  │ - Validate required fields                               │  ║
║  │ - Validate field values (enums)                          │  ║
║  │ - Call inputoff_service.createOfflineOrder()             │  ║
║  └────────────────┬─────────────────────────────────────────┘  ║
║                   ▼                                             ║
║  ┌──────────────────────────────────────────────────────────┐  ║
║  │ inputoff_service.js - Business Logic                     │  ║
║  │                                                          │  ║
║  │  1. Get Admin's Shop                                     │  ║
║  │     shops_admin.select() → get id_shops                  │  ║
║  │                                                          │  ║
║  │  2. Check/Create Customer                                │  ║
║  │     customers.select(nomor_hp) → if exists: use id      │  ║
║  │     if not: customers.insert() → get id_customers       │  ║
║  │                                                          │  ║
║  │  3. Generate Order Code & QR                             │  ║
║  │     kode_order = "ORD{timestamp}{random}"               │  ║
║  │     qr_code = QR Server API                              │  ║
║  │                                                          │  ║
║  │  4. Calculate Total Price                                │  ║
║  │     total = sum(services[].price)                        │  ║
║  │                                                          │  ║
║  │  5. Create Order Record                                  │  ║
║  │     orders.insert({kode_order, id_customer, id_shops,    │  ║
║  │                    status: 'pending', ...})              │  ║
║  │                                                          │  ║
║  │  6. Create Detail Orders (per service)                   │  ║
║  │     detail_orders.insert({id_orders, id_services, ...})  │  ║
║  │                                                          │  ║
║  │  7. Create Tracking Log                                  │  ║
║  │     tracking_logs.insert({status: 'pending', ...})       │  ║
║  │                                                          │  ║
║  │  8. Create Admin Notification                            │  ║
║  │     notification.insert({id_user, title, id_orders, ...})│  ║
║  │                                                          │  ║
║  │  9. Return Success Response                              │  ║
║  │     {success, message, data: {...}}                      │  ║
║  │                                                          │  ║
║  └───────────────────────────────────────────────────────────┘  ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════╝
                        ▼
         ┌──────────────────────────────┐
         │   Response (201 Created)     │
         │   {success, message, data}   │
         └──────────────┬───────────────┘
                        ▼
        ┌───────────────────────────────┐
        │     Frontend Updates UI       │
        │ - Show success message        │
        │ - Display order code          │
        │ - Show QR code image          │
        │ - Update UI state             │
        └───────────────────────────────┘
```

## 🔄 Sequence Diagram

```
Frontend          Controller          Service           Supabase
   │                 │                   │                 │
   │ POST request    │                   │                 │
   ├────────────────→│                   │                 │
   │                 │ Validate input    │                 │
   │                 │ ✓ JWT token       │                 │
   │                 │ ✓ Required fields │                 │
   │                 │ ✓ Enum values     │                 │
   │                 │                   │                 │
   │                 │ Call service      │                 │
   │                 ├──────────────────→│                 │
   │                 │                   │ Get shop        │
   │                 │                   ├────────────────→│
   │                 │                   │←────────────────┤
   │                 │                   │ id_shops        │
   │                 │                   │                 │
   │                 │                   │ Check customer  │
   │                 │                   ├────────────────→│
   │                 │                   │←────────────────┤
   │                 │                   │ if exists: id   │
   │                 │                   │                 │
   │                 │                   │ if not: create  │
   │                 │                   ├────────────────→│
   │                 │                   │←────────────────┤
   │                 │                   │ id_customers    │
   │                 │                   │                 │
   │                 │                   │ Create order    │
   │                 │                   ├────────────────→│
   │                 │                   │←────────────────┤
   │                 │                   │ id_orders       │
   │                 │                   │                 │
   │                 │                   │ Create detail   │
   │                 │                   ├────────────────→│
   │                 │                   │←────────────────┤
   │                 │                   │ ok              │
   │                 │                   │                 │
   │                 │                   │ Create tracking │
   │                 │                   ├────────────────→│
   │                 │                   │←────────────────┤
   │                 │                   │ ok              │
   │                 │                   │                 │
   │                 │                   │ Create notif    │
   │                 │                   ├────────────────→│
   │                 │                   │←────────────────┤
   │                 │                   │ ok              │
   │                 │                   │                 │
   │                 │ Return response   │                 │
   │                 │←──────────────────┤                 │
   │                 │                   │                 │
   │ 201 + data      │                   │                 │
   │←────────────────┤                   │                 │
   │                 │                   │                 │
   └─────────────────┴───────────────────┴─────────────────┘
```

## 📁 File Structure

```
CareKicks-BE/
│
├── src/
│   ├── features/
│   │   └── admin/
│   │       ├── dashboard/
│   │       │   ├── dashboard.controller.js
│   │       │   ├── dashboard.service.js
│   │       │   └── dashboard.routes.js
│   │       │
│   │       ├── antrean/
│   │       │   └── antrean.routes.js
│   │       │
│   │       ├── inputoff_controller.js  ✨ NEW
│   │       ├── inputoff_service.js     ✨ NEW
│   │       ├── inputoff_routes.js      ✨ NEW
│   │       │
│   │       └── index.js (UPDATED)
│   │           └── Routes: /dashboard, /antrean, /inputoff
│   │
│   ├── core/
│   │   ├── config/
│   │   │   └── supabase.js
│   │   └── services/
│   │       ├── auth.middleware.js
│   │       └── jwt.service.js
│   │
│   ├── routes/
│   │   └── index.js
│   │
│   └── app.js
│
├── .env (existing configuration)
│
└── Documentation/
    ├── OFFLINE_ORDER_API.md           ✨ NEW
    ├── OFFLINE_ORDER_TESTING.md       ✨ NEW
    ├── OFFLINE_ORDER_QUICK_REFERENCE.md ✨ NEW
    ├── IMPLEMENTATION_SUMMARY.md      ✨ NEW
    └── This file
```

## 🗄️ Database Schema Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                          Supabase (PostgreSQL)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │   customers     │         │     orders      │               │
│  ├─────────────────┤         ├─────────────────┤               │
│  │ id_customers    │◄───────┤ id_orders       │               │
│  │ nama       ✓    │         │ kode_order  ✓   │               │
│  │ nomor_hp   ✓    │         │ id_customer ✓   │               │
│  │ created_at      │         │ id_shops    ✓   │               │
│  └─────────────────┘         │ tgl_order   ✓   │               │
│                              │ status_order✓   │               │
│  ┌─────────────────┐         │ metode_order✓   │               │
│  │   services      │         │ metode_bayar✓   │               │
│  ├─────────────────┤         │ qr_image    ✓   │               │
│  │ id_services     │         │ link_qr     ✓   │               │
│  │ nama_layanan    │         │ total_ongkir✓   │               │
│  │ harga           │         │ status_pembayaran│               │
│  └─────────────────┘         └────────┬────────┘               │
│         ▲                             │                        │
│         │                             │                        │
│  ┌──────┴──────────────┐     ┌────────▼────────┐              │
│  │  detail_orders      │     │  tracking_logs  │              │
│  ├─────────────────────┤     ├─────────────────┤              │
│  │ id_detail_orders    │     │ id_tracking_logs│              │
│  │ id_orders       ✓   ├────→│ id_orders   ✓   │              │
│  │ id_services     ✓   │     │ status      ✓   │              │
│  │ foto_sebelum    ✓   │     │ waktu       ✓   │              │
│  │ merk            ✓   │     │ keterangan  ✓   │              │
│  │ jenis_sepatu    ✓   │     │ latitude        │              │
│  │ warna           ✓   │     │ longitude       │              │
│  │ review              │     └─────────────────┘              │
│  │ foto_sesudah        │                                      │
│  │ total_harga     ✓   │     ┌─────────────────┐             │
│  └─────────────────────┤     │ notification    │             │
│                        │     ├─────────────────┤             │
│                        └────→│ id_notification │             │
│                              │ id_user         │             │
│  ┌─────────────────┐         │ id_orders   ✓   │             │
│  │  shops_admin    │         │ title       ✓   │             │
│  ├─────────────────┤         │ message     ✓   │             │
│  │ id_user     ✓   │         │ type_notification              │
│  │ id_shops    ✓   │         │ is_read         │             │
│  └─────────────────┘         │ created_at      │             │
│                              └─────────────────┘             │
│                                                              │
│  Legend:                                                     │
│  ✓ = Field populated by inputoff endpoint                   │
│  ─→ = Foreign key relationship                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Data Flow for Single Request

```
REQUEST DATA:
{
  "nama_customer": "Ahmad",
  "nomor_telepon": "081234567890",
  "jenis_sepatu": "Sneakers",
  "services": [
    {"id_services": 1, "price": 30000},
    {"id_services": 4, "price": 50000}
  ],
  "merk": "Nike",
  "warna": "Putih",
  "catatan": "Deep clean",
  "metode_bayar": "tunai"
}

PROCESSING:
│
├─► Check shop: admin → shops_admin → shops
│   Result: id_shops = 1
│
├─► Check customer: nomor_telepon = "081234567890"
│   Result: NOT found → CREATE new customer
│           → id_customers = 45
│
├─► Generate codes:
│   kode_order = "ORD1735316640123ABCDEF"
│   qr_image = "qr_ORD1735316640123ABCDEF_1735316640123.png"
│   link_qr = "https://api.qrserver.com/v1/create-qr-code/..."
│
├─► Calculate total:
│   30000 + 50000 = 80000
│
├─► Create orders record:
│   {
│     id_orders: 3,
│     kode_order: "ORD1735316640123ABCDEF",
│     id_customer: 45,
│     id_shops: 1,
│     tgl_order: "2026-05-09T21:03:16.281Z",
│     status_order: "pending",
│     metode_order: "offline",
│     metode_bayar: "tunai",
│     qr_image: "qr_ORD1735316640123ABCDEF_1735316640123.png",
│     link_qr: "https://api.qrserver.com/...",
│     status_pembayaran: "pending"
│   }
│
├─► Create detail_orders records (2 records):
│   Record 1:
│   {
│     id_orders: 3,
│     id_services: 1,
│     merk: "Nike",
│     jenis_sepatu: "Sneakers",
│     warna: "Putih",
│     total_harga: 30000
│   }
│   Record 2:
│   {
│     id_orders: 3,
│     id_services: 4,
│     merk: "Nike",
│     jenis_sepatu: "Sneakers",
│     warna: "Putih",
│     total_harga: 50000
│   }
│
├─► Create tracking_logs record:
│   {
│     id_orders: 3,
│     status: "pending",
│     waktu: "2026-05-09T21:03:16.281Z",
│     keterangan: "Order offline dibuat - Deep clean"
│   }
│
├─► Create notification:
│   {
│     id_user: 1 (admin ID),
│     title: "Pesanan Offline Baru",
│     id_orders: 3,
│     message: "Pesanan baru dari Ahmad (081234567890)",
│     type_notification: "order",
│     is_read: false,
│     created_at: "2026-05-09T21:03:16.281Z"
│   }
│
└─► RESPONSE (201 Created):
    {
      "success": true,
      "message": "Order offline berhasil dibuat",
      "data": {
        "id_orders": 3,
        "kode_order": "ORD1735316640123ABCDEF",
        "nama_customer": "Ahmad",
        "nomor_telepon": "081234567890",
        "jenis_sepatu": "Sneakers",
        "total_harga": 80000,
        "metode_bayar": "tunai",
        "qr_code": "https://api.qrserver.com/v1/create-qr-code/?...",
        "status_order": "pending",
        "tgl_order": "2026-05-09T21:03:16.281Z"
      }
    }
```

---

**This architecture ensures:**
- ✅ Clean separation of concerns (Controller → Service → Database)
- ✅ Secure access (JWT authentication)
- ✅ Data integrity (validation at multiple levels)
- ✅ Proper error handling at each layer
- ✅ Scalability for future enhancements
- ✅ Maintainability through modular structure
