# CareKicks Backend - Offline Order Input Implementation

## ✅ Implementation Complete

The offline order input endpoint has been successfully implemented according to the UI mockup provided.

## 📋 What Was Created

### 1. **Controller File**
**Location**: `src/features/admin/inputoff_controller.js`

- Handles HTTP requests for offline order creation
- Validates all required and optional fields
- Validates shoe types (Sneakers, Leather, Canvas)
- Validates payment methods (tunai, qris)
- Returns proper HTTP status codes and response formats

### 2. **Service File**
**Location**: `src/features/admin/inputoff_service.js`

Core business logic including:
- Customer lookup/creation by phone number
- Admin shop retrieval
- Order code generation (unique format: `ORD{timestamp}{randomString}`)
- QR code generation using QR Server API
- Total price calculation from services
- Database transaction handling:
  - Create/retrieve customer
  - Create order record
  - Create detail orders for each service
  - Create initial tracking log
  - Create admin notification

### 3. **Routes File**
**Location**: `src/features/admin/inputoff_routes.js`

- Defines the POST endpoint: `/api/v1/admin/inputoff`
- Applies JWT authentication middleware
- Routes requests to the controller

### 4. **Route Registration**
**File Updated**: `src/features/admin/index.js`

Added the new inputoff routes to the admin router:
```javascript
router.use("/inputoff", require("./inputoff_routes"));
```

## 🎯 Endpoint Details

### Endpoint URL
```
POST /api/v1/admin/inputoff
```

### Full URL
```
http://localhost:3000/api/v1/admin/inputoff
```

### Authentication
Requires JWT Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Request Body Format
```json
{
  "nama_customer": "string (required)",
  "nomor_telepon": "string (required)",
  "jenis_sepatu": "string (required) - 'Sneakers' | 'Leather' | 'Canvas'",
  "services": [
    {
      "id_services": "number (required)",
      "price": "number (required)"
    }
  ],
  "merk": "string (optional)",
  "warna": "string (optional)",
  "catatan": "string (optional)",
  "metode_bayar": "string (required) - 'tunai' | 'qris'",
  "foto_sebelum_url": "string (optional)"
}
```

### Response Format (Success)
```json
{
  "success": true,
  "message": "Order offline berhasil dibuat",
  "data": {
    "id_orders": "number",
    "kode_order": "string",
    "nama_customer": "string",
    "nomor_telepon": "string",
    "jenis_sepatu": "string",
    "total_harga": "number",
    "metode_bayar": "string",
    "qr_code": "string (URL)",
    "status_order": "string",
    "tgl_order": "ISO8601 timestamp"
  }
}
```

## 🗄️ Database Operations

The endpoint interacts with the following tables:

1. **shops_admin** - Retrieve admin's shop information
2. **customers** - Lookup or create customer record
3. **orders** - Create new order
4. **detail_orders** - Create service detail records
5. **tracking_logs** - Create initial tracking entry
6. **notification** - Create admin notification
7. **services** - (referenced for validation)

## 🔄 Business Logic Flow

```
1. User submits offline order form
   ↓
2. Authentication verified (JWT token checked)
   ↓
3. Request validation (required fields, allowed values)
   ↓
4. Retrieve admin's shop ID
   ↓
5. Check if customer exists by phone number
   └─ If not found → Create new customer
   ↓
6. Generate unique order code & QR code
   ↓
7. Calculate total price from services
   ↓
8. Create order record (status: pending, metode_order: offline)
   ↓
9. Create detail_orders for each service
   ↓
10. Create initial tracking log
   ↓
11. Create admin notification
   ↓
12. Return success response with order details
```

## 📱 UI Form Mapping

The endpoint supports all fields from the UI mockup:

| UI Form Field | Request Field | Type | Required |
|---|---|---|---|
| **Data Pelanggan** | | | |
| Nama Lengkap | `nama_customer` | string | ✓ |
| Nomor Telepon | `nomor_telepon` | string | ✓ |
| **Jenis Sepatu** | `jenis_sepatu` | string | ✓ |
| Sneakers/Leather/Canvas | (radio button value) | string | ✓ |
| **Layanan** | `services` | array | ✓ |
| Service Name & Price | `id_services`, `price` | number | ✓ |
| **Kondisi Awal** | `foto_sebelum_url` | string | ✗ |
| Photo Upload | (image URL) | string | ✗ |
| **Catatan** | `catatan` | string | ✗ |
| Notes Text | (free text) | string | ✗ |
| **Total Biaya** | `total_harga` | number | (calculated) |
| Displayed Total | (sum of services) | number | (auto) |
| **Metode Pembayaran** | `metode_bayar` | string | ✓ |
| Tunai/QRIS | ('tunai' \| 'qris') | string | ✓ |
| **Button** | | | |
| Proses Pesanan & Buat QR | POST request | | |

## 🛠️ Technical Features

- ✅ **Error Handling**: Comprehensive validation with specific error messages
- ✅ **QR Code Generation**: Automatic QR code creation with unique order code
- ✅ **Customer Deduplication**: Prevents duplicate customer creation by phone number
- ✅ **Transaction Safety**: Database operations with proper error handling
- ✅ **Notification System**: Automatic admin notification on order creation
- ✅ **Status Tracking**: Initial tracking log entry for order management
- ✅ **JWT Authentication**: Secure endpoint access control
- ✅ **Input Validation**: Type and value validation for all inputs

## 📖 Documentation Files Created

1. **OFFLINE_ORDER_API.md** - Complete API documentation with examples
2. **OFFLINE_ORDER_TESTING.md** - Testing guide with curl examples and test scenarios
3. This file - Implementation summary

## 🚀 How to Use

### 1. Start the Development Server
```bash
npm run dev
```

Server will run on `http://localhost:3000`

### 2. Get Admin JWT Token
```bash
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

### 3. Create an Offline Order
```bash
curl -X POST http://localhost:3000/api/v1/admin/inputoff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nama_customer": "John Doe",
    "nomor_telepon": "081234567890",
    "jenis_sepatu": "Sneakers",
    "services": [
      {"id_services": 1, "price": 30000}
    ],
    "merk": "Nike",
    "warna": "Putih",
    "catatan": "Clean the toe area",
    "metode_bayar": "tunai",
    "foto_sebelum_url": "https://example.com/photo.jpg"
  }'
```

## ✅ Testing Checklist

- [ ] Server starts without errors
- [ ] Endpoint appears in API list at startup
- [ ] Request with valid token succeeds
- [ ] Request without token returns 401
- [ ] Request with invalid fields returns 400
- [ ] Order record created in `orders` table
- [ ] Detail order records created in `detail_orders` table
- [ ] Tracking log entry created
- [ ] Notification created for admin
- [ ] Customer created if new
- [ ] QR code URL is valid
- [ ] Total price calculated correctly

## 🔍 File Structure

```
CareKicks-BE/
├── src/
│   ├── features/
│   │   └── admin/
│   │       ├── inputoff_controller.js     ← Controller
│   │       ├── inputoff_service.js        ← Service logic
│   │       ├── inputoff_routes.js         ← Routes
│   │       └── index.js                   ← Updated with inputoff route
│   ├── core/
│   │   ├── config/
│   │   │   └── supabase.js                ← Database client
│   │   └── services/
│   │       └── auth.middleware.js         ← Authentication
│   └── app.js                             ← Main app
├── OFFLINE_ORDER_API.md                   ← API Documentation
├── OFFLINE_ORDER_TESTING.md              ← Testing Guide
└── package.json
```

## 🎓 Key Concepts Implemented

1. **MVC Pattern** - Model-View-Controller architecture
   - Controller: Input validation and HTTP handling
   - Service: Business logic and database operations
   - Routes: Endpoint definitions

2. **Authentication** - JWT token validation for secure access

3. **Data Validation** - Multiple levels of validation
   - Required field checks
   - Enum validation (shoe types, payment methods)
   - Array length validation

4. **Error Handling** - Comprehensive error responses with meaningful messages

5. **Automatic Deduplication** - Customer lookup by phone number

6. **Transaction Safety** - Proper error handling for database operations

## 📞 Support Information

- **API Documentation**: See `OFFLINE_ORDER_API.md`
- **Testing Guide**: See `OFFLINE_ORDER_TESTING.md`
- **Configuration**: Check `.env` file for Supabase credentials
- **Database**: Supabase PostgreSQL instance

## 🔐 Security Notes

- All endpoints require JWT authentication
- Admin can only create orders for their own shop
- Input validation prevents malicious data
- Phone number deduplication prevents abuse
- Sensitive data is not exposed in responses

## ⚠️ Important Notes

1. **Supabase Configuration**: Ensure all environment variables are correctly set in `.env`
2. **Service IDs**: Verify that service IDs used in requests exist in the `services` table
3. **Shop Association**: Admin user must be associated with a shop in `shops_admin` table
4. **QR Code**: Generated using external QR Server API (https://api.qrserver.com)
5. **Customer Lookup**: Uses phone number as unique identifier

---

**Status**: ✅ Ready for Testing and Integration  
**Last Updated**: 2026-05-09  
**Version**: 1.0
