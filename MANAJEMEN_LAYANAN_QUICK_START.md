# Manajemen Layanan - Quick Start Guide

## Fix for Your Error

### Error You Got:
```
{
  "success": false,
  "message": "Cannot destructure property 'nama_layanan' of 'req.body' as it is undefined."
}
```

### Root Cause
You were sending the request with `Content-Type: application/json` instead of `multipart/form-data`.

### Solution

#### In Insomnia:

1. **Go to Body tab** → Select **Multipart Form** (NOT JSON)
2. **Add fields:**
   - `nama_layanan`: Deep Cleaning
   - `harga`: 35000
   - `estimasi_waktu`: Sneakers
   - `deskripsi`: Professional deep cleaning
   - `foto`: [Select your image file]
3. **Auth tab** → Bearer Token
4. **Send**

#### Key Points:
✅ Use **Multipart Form** (not JSON) when sending files  
✅ File field is **`foto`** (not `foto_layanan`)  
✅ Harga should be a number: `35000` (not `"35000"`)  
✅ All form fields are sent as text, multer converts harga to number

---

## Test Flow

### 1. Create Service with Image
```
POST http://localhost:3000/api/v1/admin/manajemen_layanan
Auth: Bearer {your_jwt_token}
Body: Multipart Form
  - nama_layanan: Deep Cleaning
  - harga: 35000
  - estimasi_waktu: Sneakers
  - deskripsi: Professional deep cleaning for sneakers
  - foto: [your-image.jpg]
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
    "deskripsi": "Professional deep cleaning for sneakers",
    "foto_layanan": "https://your-project.supabase.co/storage/v1/object/public/services/1715363050000_ABC123.jpg",
    "is_active": true
  }
}
```

### 2. View Services
```
GET http://localhost:3000/api/v1/admin/manajemen_layanan
Auth: Bearer {your_jwt_token}
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
      "deskripsi": "Professional deep cleaning for sneakers",
      "foto_layanan": "https://..../services/1715363050000_ABC123.jpg",
      "is_active": true,
      "id_shops": 1
    }
  ]
}
```

### 3. Update Service (Change Image)
```
PATCH http://localhost:3000/api/v1/admin/manajemen_layanan/1
Auth: Bearer {your_jwt_token}
Body: Multipart Form
  - harga: 40000
  - foto: [new-image.jpg]
```

Old image automatically deleted, new one uploaded!

### 4. Toggle Service On/Off
```
PATCH http://localhost:3000/api/v1/admin/manajemen_layanan/1/status
Auth: Bearer {your_jwt_token}
Body: JSON
{
  "is_active": false
}
```

**Note:** Status endpoint uses JSON, not Multipart Form!

### 5. Delete Service
```
DELETE http://localhost:3000/api/v1/admin/manajemen_layanan/1
Auth: Bearer {your_jwt_token}
```

Image automatically deleted from Supabase Storage!

---

## Important: Multipart Form vs JSON

| Endpoint | Body Type | Notes |
|----------|-----------|-------|
| `POST /` (create) | **Multipart Form** | File upload required field named `foto` |
| `PATCH /:id` (update) | **Multipart Form** | File upload optional field named `foto` |
| `PATCH /:id/status` | **JSON** | NO files, just `{"is_active": true/false}` |
| `GET /` (list) | None | Query params only |
| `DELETE /:id` | None | No body |

---

## Insomnia Step-by-Step

### Step 1: Set Up Environment
1. Click **Manage Environments**
2. Create new environment called "CareKicks-Dev"
3. Add variables:
   ```json
   {
     "base_url": "http://localhost:3000/api/v1",
     "token": "your_jwt_token_here"
   }
   ```

### Step 2: Create Request
1. New → HTTP Request
2. Name: "Create Service"
3. Method: **POST**
4. URL: `{{base_url}}/admin/manajemen_layanan`

### Step 3: Set Auth
1. Auth tab
2. Type: **Bearer Token**
3. Token: `{{token}}`

### Step 4: Set Body
1. Body tab
2. Type: **Multipart Form**
3. Click **Multipart Form** and add:
   - Key: `nama_layanan`, Value: `Deep Cleaning`, Type: `Text`
   - Key: `harga`, Value: `35000`, Type: `Text`
   - Key: `estimasi_waktu`, Value: `Sneakers`, Type: `Text`
   - Key: `deskripsi`, Value: `Professional service`, Type: `Text`
   - Key: `foto`, Type: `File`, then select image

### Step 5: Send
1. Click **Send**
2. Check response (should be 201 with service data)
3. Copy `foto_layanan` URL and open in browser to verify image

---

## Verify Everything Works

### Check 1: Service Created
✅ Response shows 201 status  
✅ Response includes `foto_layanan` URL  

### Check 2: Image Uploaded
✅ Open `foto_layanan` URL in browser  
✅ Image displays correctly  

### Check 3: Image in Supabase
✅ Go to Supabase console  
✅ Storage → services bucket  
✅ See your uploaded files  

### Check 4: Get Services Works
✅ GET request shows all services  
✅ All `foto_layanan` URLs are visible  

### Check 5: Update Works
✅ PATCH with new image  
✅ Old image gone from Supabase  
✅ New image appears  

### Check 6: Delete Works
✅ DELETE service  
✅ Image deleted from Supabase  
✅ Service deleted from database  

---

## Troubleshooting

### Problem: Still getting "Cannot destructure" error
**Solution:** 
- Make sure you're using **Multipart Form**, not JSON
- Restart the server (`npm run dev`)
- Clear Insomnia cache

### Problem: 400 Missing required fields
**Solution:**
- Check all required fields are in form:
  - `nama_layanan` ✓
  - `harga` ✓
  - `estimasi_waktu` ✓
- `deskripsi` is optional
- `foto` is optional

### Problem: 500 Failed to upload image
**Solution:**
- Check Supabase bucket "services" exists
- Check .env has SUPABASE_URL and SUPABASE_KEY
- Try with PNG instead of JPG
- Keep image size under 5MB

### Problem: Image URL is null but request succeeded
**Solution:**
- That's OK! You didn't upload a file
- `foto` is optional
- You can upload image later with PATCH

### Problem: Image displays in browser but wrong size/format
**Solution:**
- Supabase serves original file as-is
- Add image processing on frontend if needed
- Or resize image before uploading

---

## Files That Were Updated

1. **src/app.js**
   - Added multer middleware
   - Added express.urlencoded middleware

2. **src/features/admin/manajemen_layanan/manajemen_layanan.service.js**
   - Added `uploadServiceImage()` function
   - Added `deleteServiceImage()` function
   - Updated `deleteService()` to delete images

3. **src/features/admin/manajemen_layanan/manajemen_layanan.controller.js**
   - Updated `createService()` to handle file uploads
   - Updated `updateService()` to handle file uploads
   - Removed URL validation (now using multer)

4. **src/features/admin/manajemen_layanan/manajemen_layanan.routes.js**
   - Added multer middleware to POST and PATCH routes
   - File field name is `foto`

---

## API Reference

### Query Params
- `GET ?search=deep` → Find services with "deep" in name
- `GET ?category=Sneakers` → Filter by category
- `GET ?search=deep&category=Sneakers` → Both filters

### Response Fields
All responses have this structure:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": { ... }
}
```

### Service Object
```json
{
  "id_services": 1,
  "id_shops": 1,
  "nama_layanan": "Deep Cleaning",
  "harga": 35000,
  "estimasi_waktu": "Sneakers",
  "deskripsi": "Professional deep cleaning",
  "foto_layanan": "https://...supabase.../services/1715363050000_ABC123.jpg",
  "is_active": true
}
```

---

## Next: Frontend Integration

When you build the frontend:
1. Use `multipart/form-data` for file uploads
2. Send file in field named `foto`
3. Display `foto_layanan` URL directly in `<img src>`
4. Handle null `foto_layanan` (no image yet)

---

## Support

If you get stuck:
1. Check the error message carefully
2. Verify request body type (Multipart vs JSON)
3. Check all required fields are included
4. Verify JWT token is valid
5. Check server logs for detailed errors
