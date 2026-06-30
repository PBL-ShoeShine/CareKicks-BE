# Quick Reference - Offline Order API

## Endpoint

```
POST /api/v1/admin/inputoff
```

## Headers Required

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Minimum Valid Request

```json
{
  "nama_customer": "John Doe",
  "nomor_telepon": "081234567890",
  "jenis_sepatu": "Sneakers",
  "services": [{ "id_services": 1, "price": 30000 }],
  "metode_bayar": "tunai"
}
```

## Complete Request Example

```json
{
  "nama_customer": "Ahmad Suryanto",
  "nomor_telepon": "081234567890",
  "jenis_sepatu": "Sneakers",
  "services": [
    { "id_services": 1, "price": 30000 },
    { "id_services": 4, "price": 50000 }
  ],
  "merk": "Nike",
  "warna": "Putih",
  "catatan": "Ada noda di bagian toe",
  "metode_bayar": "tunai",
  "foto_sebelum_url": "https://storage.example.com/photo.jpg"
}
```

## Response (201 Created)

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
    "total_harga": 80000,
    "metode_bayar": "tunai",
    "qr_code": "https://api.qrserver.com/v1/create-qr-code/?...",
    "status_order": "pending",
    "tgl_order": "2026-05-09T21:03:16.281+07:00"
  }
}
```

## Field Requirements

| Field                  | Type   | Required | Valid Values              | Notes                |
| ---------------------- | ------ | -------- | ------------------------- | -------------------- |
| nama_customer          | string | ✓        | Any                       | Customer full name   |
| nomor_telepon          | string | ✓        | Any                       | 08xx or +62xx format |
| jenis_sepatu           | string | ✓        | Any                       | Shoe type            |
| services               | array  | ✓        | Array of objects          | Min 1 service        |
| services[].id_services | number | ✓        | Any                       | Must exist in DB     |
| services[].price       | number | ✓        | > 0                       | In IDR (Rupiah)      |
| merk                   | string | ✗        | Any                       | Brand name           |
| warna                  | string | ✗        | Any                       | Color                |
| catatan                | string | ✗        | Any                       | Notes/comments       |
| metode_bayar           | string | ✓        | tunai, qris               | Payment method       |
| foto_sebelum_url       | string | ✗        | Any URL                   | Initial photo        |

## Error Examples

### Missing Required Field (400)

```json
{
  "success": false,
  "message": "Missing required fields: nama_customer, nomor_telepon, jenis_sepatu, services, metode_bayar"
}
```

### Invalid Payment Method (400)

```json
{
  "success": false,
  "message": "metode_bayar must be 'tunai' or 'qris'"
}
```


### No Authorization (401)

```json
{
  "success": false,
  "message": "Authorization header missing or invalid",
  "error_code": "UNAUTHORIZED"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

## cURL Examples

### Tunai Payment

```bash
curl -X POST http://localhost:3000/api/v1/admin/inputoff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbG..." \
  -d '{
    "nama_customer": "Budi Santoso",
    "nomor_telepon": "081512345678",
    "jenis_sepatu": "Sneakers",
    "services": [{"id_services": 1, "price": 30000}],
    "merk": "Adidas",
    "warna": "Hitam",
    "catatan": "Deep clean",
    "metode_bayar": "tunai"
  }'
```

### QRIS Payment (Multiple Services)

```bash
curl -X POST http://localhost:3000/api/v1/admin/inputoff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbG..." \
  -d '{
    "nama_customer": "Siti Nurhaliza",
    "nomor_telepon": "082123456789",
    "jenis_sepatu": "Canvas",
    "services": [
      {"id_services": 1, "price": 30000},
      {"id_services": 4, "price": 50000}
    ],
    "merk": "Converse",
    "warna": "Biru",
    "catatan": "Unyellow dan deep clean",
    "metode_bayar": "qris"
  }'
```

## Postman Setup

1. **Create new Request**
   - Method: `POST`
   - URL: `http://localhost:3000/api/v1/admin/inputoff`

2. **Set Headers**
   - Key: `Authorization`
   - Value: `Bearer <your_jwt_token>`
   - Key: `Content-Type`
   - Value: `application/json`

3. **Set Body (raw JSON)**
   - Paste any of the request examples above

4. **Send**
   - Click Send button

## Database Tables Affected

✅ **orders** - New order record created  
✅ **detail_orders** - Service detail records created  
✅ **customers** - New customer created (if not exists)  
✅ **tracking_logs** - Initial tracking entry created  
✅ **notification** - Admin notification created

## Business Logic

1. **Order Code**: Auto-generated (`ORD{timestamp}{random}`)
2. **QR Code**: Auto-generated URL pointing to QR code image
3. **Total Price**: Sum of all selected services
4. **Status**: Always starts as `pending`
5. **Customer**: Looked up by phone number, created if not found
6. **Notification**: Sent to admin who created the order

## Files Modified/Created

```
✨ Created: src/features/admin/inputoff_controller.js
✨ Created: src/features/admin/inputoff_service.js
✨ Created: src/features/admin/inputoff_routes.js
✎ Modified: src/features/admin/index.js
```

## Key Features

- ✅ JWT Authentication required
- ✅ Input validation (type & value checks)
- ✅ Customer deduplication by phone number
- ✅ Automatic QR code generation
- ✅ Multi-service order support
- ✅ Order tracking initialization
- ✅ Admin notification system
- ✅ Comprehensive error handling
- ✅ ISO 8601 timestamp format

## Documentation

- 📖 **API Docs**: `OFFLINE_ORDER_API.md`
- 🧪 **Testing Guide**: `OFFLINE_ORDER_TESTING.md`
- 📋 **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- ⚡ **This File**: `OFFLINE_ORDER_QUICK_REFERENCE.md`

---

**Ready to integrate!** 🚀
