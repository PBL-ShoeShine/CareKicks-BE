# Testing Guide for Offline Order Input Endpoint

## Prerequisites
- The CareKicks-BE server running on `http://localhost:3000`
- A valid JWT token from the admin login endpoint
- Postman or similar API testing tool

## Step 1: Get Admin JWT Token

**Endpoint**: `POST /api/v1/user/login`

**Request**:
```bash
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carekicks.com",
    "password": "your_password"
  }'
```

**Response** (save the token):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@carekicks.com",
      "role": "admin"
    }
  }
}
```

## Step 2: Create Offline Order

**Endpoint**: `POST /api/v1/admin/inputoff`

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**Request Body - Example 1 (Tunai Payment)**:
```json
{
  "nama_customer": "Ahmad Suryanto",
  "nomor_telepon": "081234567890",
  "jenis_sepatu": "Sneakers",
  "services": [
    {
      "id_services": 1,
      "price": 30000
    }
  ],
  "merk": "Nike",
  "warna": "Putih",
  "catatan": "Ada noda di bagian toe, mohon dibersihkan dengan teliti",
  "metode_bayar": "tunai",
  "foto_sebelum_url": "https://storage.example.com/before_photo_1.jpg"
}
```

**Request Body - Example 2 (QRIS Payment, Multiple Services)**:
```json
{
  "nama_customer": "Siti Nurhaliza",
  "nomor_telepon": "082123456789",
  "jenis_sepatu": "Canvas",
  "services": [
    {
      "id_services": 1,
      "price": 30000
    },
    {
      "id_services": 4,
      "price": 50000
    }
  ],
  "merk": "Converse",
  "warna": "Biru",
  "catatan": "Kuning di bagian kanvas, mohon di-unyellowing",
  "metode_bayar": "qris",
  "foto_sebelum_url": "https://storage.example.com/before_photo_2.jpg"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Order offline berhasil dibuat",
  "data": {
    "id_orders": 3,
    "kode_order": "ORD1735316640123ABCDEF",
    "nama_customer": "Ahmad Suryanto",
    "nomor_telepon": "081234567890",
    "jenis_sepatu": "Sneakers",
    "total_harga": 30000,
    "metode_bayar": "tunai",
    "qr_code": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORD1735316640123ABCDEF",
    "status_order": "pending",
    "tgl_order": "2026-05-09T21:03:16.281+07:00"
  }
}
```

## Step 3: Verify Order Creation

Check the Supabase database to verify:

1. **Check orders table**:
   - New order record with `kode_order` matching the response
   - `status_order` = "pending"
   - `metode_bayar` = "tunai" or "qris"

2. **Check detail_orders table**:
   - Records for each service selected
   - `foto_sebelum` populated with the image URL
   - `total_harga` matching the service price

3. **Check tracking_logs table**:
   - Initial entry with status = "pending"
   - `keterangan` contains "Order offline dibuat"

4. **Check notification table**:
   - New notification for the admin
   - `title` = "Pesanan Offline Baru"
   - `type_notification` = "order"

## Testing Scenarios

### Scenario 1: Valid Order - Cash Payment
```bash
curl -X POST http://localhost:3000/api/v1/admin/inputoff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nama_customer": "Test Customer 1",
    "nomor_telepon": "081111111111",
    "jenis_sepatu": "Sneakers",
    "services": [{
      "id_services": 1,
      "price": 30000
    }],
    "merk": "Nike",
    "warna": "Putih",
    "catatan": "Test order",
    "metode_bayar": "tunai",
    "foto_sebelum_url": "https://example.com/photo.jpg"
  }'
```

### Scenario 2: Valid Order - QRIS Payment, Multiple Services
```bash
curl -X POST http://localhost:3000/api/v1/admin/inputoff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nama_customer": "Test Customer 2",
    "nomor_telepon": "082222222222",
    "jenis_sepatu": "Leather",
    "services": [
      {"id_services": 1, "price": 30000},
      {"id_services": 2, "price": 50000},
      {"id_services": 4, "price": 75000}
    ],
    "merk": "Adidas",
    "warna": "Hitam",
    "catatan": "Multiple services test",
    "metode_bayar": "qris"
  }'
```

### Scenario 3: Missing Required Field (Should fail)
```bash
curl -X POST http://localhost:3000/api/v1/admin/inputoff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nama_customer": "Test Customer",
    "nomor_telepon": "083333333333"
    // Missing required fields
  }'
```

Expected error:
```json
{
  "success": false,
  "message": "Missing required fields: nama_customer, nomor_telepon, jenis_sepatu, services, metode_bayar"
}
```

### Scenario 4: Invalid Payment Method (Should fail)
```bash
curl -X POST http://localhost:3000/api/v1/admin/inputoff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nama_customer": "Test Customer",
    "nomor_telepon": "084444444444",
    "jenis_sepatu": "Sneakers",
    "services": [{"id_services": 1, "price": 30000}],
    "metode_bayar": "bitcoin"
  }'
```

Expected error:
```json
{
  "success": false,
  "message": "metode_bayar must be 'tunai' or 'qris'"
}
```

### Scenario 5: Invalid Shoe Type (Should fail)
```bash
curl -X POST http://localhost:3000/api/v1/admin/inputoff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nama_customer": "Test Customer",
    "nomor_telepon": "085555555555",
    "jenis_sepatu": "Sandal",
    "services": [{"id_services": 1, "price": 30000}],
    "metode_bayar": "tunai"
  }'
```

Expected error:
```json
{
  "success": false,
  "message": "jenis_sepatu must be 'Sneakers', 'Leather', or 'Canvas'"
}
```

## Expected Service IDs and Prices

Based on the database setup, typical services are:
- `id_services: 1` - Deep Clean - Rp30.000
- `id_services: 2` - Basic Wash - Rp25.000
- `id_services: 3` - Conditioning - Rp20.000
- `id_services: 4` - Unyellowing - Rp50.000

## Postman Collection

You can import this collection directly in Postman:

```json
{
  "info": {
    "name": "CareKicks Offline Order",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Offline Order - Tunai",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"nama_customer\":\"Test User\",\"nomor_telepon\":\"081234567890\",\"jenis_sepatu\":\"Sneakers\",\"services\":[{\"id_services\":1,\"price\":30000}],\"merk\":\"Nike\",\"warna\":\"Putih\",\"catatan\":\"Test\",\"metode_bayar\":\"tunai\"}"
        },
        "url": {
          "raw": "http://localhost:3000/api/v1/admin/inputoff",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "v1", "admin", "inputoff"]
        }
      }
    }
  ]
}
```

## Debugging Tips

1. **Check JWT Token**: Make sure the token is valid and not expired
2. **Check Shop Association**: Verify the admin user has an associated shop in the `shops_admin` table
3. **Check Service IDs**: Verify the service IDs exist in the `services` table
4. **Check Database Logs**: Monitor Supabase real-time updates to see if records are being created
5. **Check Browser Console**: Look for any CORS or network errors

## Performance Notes

- The endpoint performs multiple database operations
- Average response time: 500ms - 1.5s depending on database latency
- Suitable for walk-in order input during peak hours

## Security Notes

- JWT token is required for all requests
- Admin can only create orders for their own shop
- Phone number is used to prevent duplicate customers
- All inputs are validated before database operations
