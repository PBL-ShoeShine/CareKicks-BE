# Manajemen Layanan API - Update Verification

## Changes Made

### 1. Service Layer Updates
**File:** `manajemen_layanan.service.js`

- **getServices**: Updated SELECT query to include `foto_layanan` field
- **createService**: Added `foto_layanan` parameter and included in insert data
- **updateService**: Added `foto_layanan` to update logic

### 2. Controller Updates
**File:** `manajemen_layanan.controller.js`

- **createService**: 
  - Extracts `foto_layanan` from request body
  - Added validation: `foto_layanan` must be a valid URL string if provided
  - Passes `foto_layanan` to service layer

- **updateService**: 
  - Extracts `foto_layanan` from request body
  - Added validation: `foto_layanan` must be a valid URL string if provided
  - Passes `foto_layanan` to service layer

### 3. Documentation Updates
**File:** `MANAJEMEN_LAYANAN_API.md`

- Updated POST endpoint examples to include `foto_layanan`
- Updated PATCH endpoint examples to include `foto_layanan`
- Updated response examples to show `foto_layanan` field
- Added `foto_layanan` to field descriptions

---

## Testing Endpoints

### Test 1: Create Service with Image
```bash
curl -X POST "http://localhost:3000/api/v1/admin/manajemen_layanan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_layanan": "Deep Cleaning",
    "harga": 35000,
    "estimasi_waktu": "Sneakers",
    "deskripsi": "Professional deep cleaning",
    "foto_layanan": "https://example.com/deep-cleaning.jpg"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id_services": 1,
    "id_shops": 1,
    "nama_layanan": "Deep Cleaning",
    "harga": 35000,
    "estimasi_waktu": "Sneakers",
    "deskripsi": "Professional deep cleaning",
    "foto_layanan": "https://example.com/deep-cleaning.jpg",
    "is_active": true
  }
}
```

---

### Test 2: Get Services (with Images)
```bash
curl -X GET "http://localhost:3000/api/v1/admin/manajemen_layanan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [
    {
      "id_services": 1,
      "nama_layanan": "Deep Cleaning",
      "harga": 35000,
      "estimasi_waktu": "Sneakers",
      "deskripsi": "Professional deep cleaning",
      "foto_layanan": "https://example.com/deep-cleaning.jpg",
      "is_active": true,
      "id_shops": 1
    }
  ]
}
```

---

### Test 3: Update Service with New Image
```bash
curl -X PATCH "http://localhost:3000/api/v1/admin/manajemen_layanan/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "harga": 40000,
    "foto_layanan": "https://example.com/deep-cleaning-new.jpg"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "id_services": 1,
    "id_shops": 1,
    "nama_layanan": "Deep Cleaning",
    "harga": 40000,
    "estimasi_waktu": "Sneakers",
    "deskripsi": "Professional deep cleaning",
    "foto_layanan": "https://example.com/deep-cleaning-new.jpg",
    "is_active": true
  }
}
```

---

### Test 4: Create Service Without Image (Optional)
```bash
curl -X POST "http://localhost:3000/api/v1/admin/manajemen_layanan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_layanan": "Leather Care",
    "harga": 55000,
    "estimasi_waktu": "Leather",
    "deskripsi": "Premium leather care"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id_services": 2,
    "id_shops": 1,
    "nama_layanan": "Leather Care",
    "harga": 55000,
    "estimasi_waktu": "Leather",
    "deskripsi": "Premium leather care",
    "foto_layanan": null,
    "is_active": true
  }
}
```

---

### Test 5: Invalid foto_layanan Input
```bash
curl -X POST "http://localhost:3000/api/v1/admin/manajemen_layanan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_layanan": "Test Service",
    "harga": 50000,
    "estimasi_waktu": "Sneakers",
    "foto_layanan": 12345
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "foto_layanan must be a valid URL string"
}
```

---

## Database Schema

The `services` table now includes:

```
- id_services (integer, PK)
- id_shops (integer, FK)
- nama_layanan (varchar)
- harga (numeric)
- estimasi_waktu (varchar)
- deskripsi (text)
- foto_layanan (varchar) ← NEW FIELD
- is_active (boolean, default: true)
```

---

## Postman Collection Import

You can import the updated endpoints into Postman:

### Variables
- `base_url`: http://localhost:3000/api/v1
- `token`: Your JWT token

### Requests

#### 1. Get Services
- **Method**: GET
- **URL**: `{{base_url}}/admin/manajemen_layanan`
- **Headers**: Authorization: Bearer {{token}}

#### 2. Create Service with Image
- **Method**: POST
- **URL**: `{{base_url}}/admin/manajemen_layanan`
- **Headers**: Authorization: Bearer {{token}}, Content-Type: application/json
- **Body**:
```json
{
  "nama_layanan": "Deep Cleaning",
  "harga": 35000,
  "estimasi_waktu": "Sneakers",
  "deskripsi": "Professional deep cleaning",
  "foto_layanan": "https://example.com/deep-cleaning.jpg"
}
```

#### 3. Update Service
- **Method**: PATCH
- **URL**: `{{base_url}}/admin/manajemen_layanan/1`
- **Headers**: Authorization: Bearer {{token}}, Content-Type: application/json
- **Body**:
```json
{
  "foto_layanan": "https://example.com/new-image.jpg"
}
```

#### 4. Toggle Service Status
- **Method**: PATCH
- **URL**: `{{base_url}}/admin/manajemen_layanan/1/status`
- **Headers**: Authorization: Bearer {{token}}, Content-Type: application/json
- **Body**:
```json
{
  "is_active": false
}
```

#### 5. Delete Service
- **Method**: DELETE
- **URL**: `{{base_url}}/admin/manajemen_layanan/1`
- **Headers**: Authorization: Bearer {{token}}

---

## Implementation Status

✅ Service layer updated with `foto_layanan` support  
✅ Controller updated with validation  
✅ API documentation updated  
✅ Backward compatible (foto_layanan is optional)  
✅ Ready for production use
