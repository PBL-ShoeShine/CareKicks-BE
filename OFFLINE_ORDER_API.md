# Offline Order Input Endpoint Documentation

## Endpoint
**POST** `/api/v1/admin/inputoff`

## Description
Creates a new offline order for walk-in customers. This endpoint handles the complete offline order input flow including:
- Customer creation/lookup
- Order creation with unique order code
- Service selection and total price calculation
- QR code generation
- Initial tracking log creation
- Admin notification

## Authentication
**Required**: Bearer Token (JWT)
```
Authorization: Bearer <jwt_token>
```

## Request Body

```json
{
  "nama_customer": "John Doe",
  "nomor_telepon": "081234567890",
  "jenis_sepatu": "Sneakers",
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
  "merk": "Nike",
  "warna": "Putih",
  "catatan": "Ada leci di bagian heel",
  "metode_bayar": "tunai",
  "foto_sebelum_url": "https://storage.example.com/photo1.jpg"
}
```

### Request Fields

| Field | Type | Required | Description | Notes |
|-------|------|----------|-------------|-------|
| `nama_customer` | string | ✓ | Full name of customer | Max 255 chars |
| `nomor_telepon` | string | ✓ | Phone number | Format: 08xx... or +62xx... |
| `jenis_sepatu` | string | ✓ | Shoe type | e.g., Sneakers, Leather, Canvas, Boots, etc. |
| `services` | array | ✓ | Array of selected services | Min 1 service required |
| `services[].id_services` | number | ✓ | Service ID from services table | Must exist in database |
| `services[].price` | number | ✓ | Service price | In IDR (Rupiah) |
| `merk` | string | ✗ | Shoe brand | e.g., Nike, Adidas |
| `warna` | string | ✗ | Shoe color | e.g., Putih, Hitam |
| `catatan` | string | ✗ | Notes/additional information | Max 500 chars |
| `metode_bayar` | string | ✓ | Payment method | Must be: `tunai` or `qris` |
| `foto_sebelum_url` | string | ✗ | Initial condition photo URL | Image URL from cloud storage |

## Response

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Order offline berhasil dibuat",
  "data": {
    "id_orders": 3,
    "kode_order": "ORD1735316640123ABCDEF",
    "nama_customer": "John Doe",
    "nomor_telepon": "081234567890",
    "jenis_sepatu": "Sneakers",
    "total_harga": 80000,
    "metode_bayar": "tunai",
    "qr_code": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORD1735316640123ABCDEF",
    "status_order": "pending",
    "tgl_order": "2026-05-09T21:03:16.281+07:00"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Missing required fields: nama_customer, nomor_telepon, jenis_sepatu, services, metode_bayar"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

## Database Operations

This endpoint performs the following database operations:

1. **Retrieve Admin's Shop**: Gets the shop ID associated with the authenticated admin
2. **Check/Create Customer**: Looks up customer by phone number, creates if not found
3. **Create Order**: Inserts record in `orders` table with status `pending`
4. **Create Detail Orders**: Inserts records in `detail_orders` table for each service
5. **Create Tracking Log**: Inserts initial entry in `tracking_logs` table
6. **Create Notification**: Sends notification to admin about new offline order

## Business Logic

- **Order Code Generation**: Unique code format: `ORD{timestamp}{randomString}`
- **Total Price**: Sum of all selected services' prices
- **Status**: New offline orders start with status `pending`
- **Payment Status**: Starts as `pending`, updated when payment is confirmed
- **QR Code**: Generated using QR Server API (https://api.qrserver.com)
- **Customer Lookup**: Uses phone number to check if customer exists

## Example cURL Request

```bash
curl -X POST http://localhost:3000/api/v1/admin/inputoff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "nama_customer": "Budi Santoso",
    "nomor_telepon": "081512345678",
    "jenis_sepatu": "Sneakers",
    "services": [
      {
        "id_services": 1,
        "price": 30000
      }
    ],
    "merk": "Adidas",
    "warna": "Hitam",
    "catatan": "Bersihkan bagian sol",
    "metode_bayar": "qris",
    "foto_sebelum_url": "https://storage.example.com/shoe1.jpg"
  }'
```

## Related Tables

- `orders` - Main order record
- `detail_orders` - Individual service details
- `customers` - Customer information
- `services` - Available services list
- `tracking_logs` - Order status tracking
- `notification` - Admin notifications
- `shops_admin` - Shop/admin relationship
- `shops` - Store information

## Notes

- The endpoint requires authentication with a valid JWT token
- Admin must have an associated shop (via `shops_admin` table)
- QR code is generated automatically using a public QR code service
- Notification is created for the admin but won't block order creation if it fails
- Phone number is used as the unique identifier for customer lookup
- All timestamps are stored in ISO 8601 format
