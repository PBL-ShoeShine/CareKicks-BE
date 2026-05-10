# Manajemen Layanan API - File Upload Guide

## Overview
This guide explains how to use the updated Service Management endpoint with **file upload support** to Supabase Storage.

---

## Setup Requirements

### 1. Supabase Storage Bucket
✅ Bucket name: `services` (already created)  
✅ Multer middleware: Configured in `app.js`  
✅ Storage: Supabase v2

---

## File Upload Implementation

### Files Modified
1. **app.js** - Added multer middleware configuration
2. **manajemen_layanan.controller.js** - Handle file uploads in POST/PATCH
3. **manajemen_layanan.service.js** - Upload/delete files from Supabase
4. **manajemen_layanan.routes.js** - Added multer middleware to routes

### Key Features
✅ Upload JPG, PNG, GIF, WebP images  
✅ Automatic file naming with timestamps  
✅ Automatic public URL generation  
✅ Old image deletion on update  
✅ Image deletion on service deletion  
✅ Error handling for upload failures

---

## Endpoints

### 1. Get All Services
Retrieve all services with optional search and category filter.

**Endpoint:**
```
GET /api/v1/admin/manajemen_layanan
```

**Query Parameters:**
- `search` (optional): Search for services by name
- `category` (optional): Filter by category

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/admin/manajemen_layanan?search=deep" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
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
      "foto_layanan": "https://...supabase.../services/1715363050000_ABC123.jpg",
      "is_active": true,
      "id_shops": 1
    }
  ]
}
```

---

### 2. Create Service with Image Upload

**Endpoint:**
```
POST /api/v1/admin/manajemen_layanan
```

**Request Format:** `multipart/form-data`

**Fields:**
- `nama_layanan` (required, string): Service name
- `harga` (required, number): Service price
- `estimasi_waktu` (required, string): Category/time estimate
- `deskripsi` (optional, string): Service description
- `foto` (optional, file): Image file (JPG, PNG, GIF, WebP)

**Example with cURL:**
```bash
curl -X POST "http://localhost:3000/api/v1/admin/manajemen_layanan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "nama_layanan=Deep Cleaning" \
  -F "harga=35000" \
  -F "estimasi_waktu=Sneakers" \
  -F "deskripsi=Professional deep cleaning" \
  -F "foto=@/path/to/image.jpg"
```

**Example with Insomnia:**
1. Set method to POST
2. Set URL: `http://localhost:3000/api/v1/admin/manajemen_layanan`
3. Go to **Auth** tab → Select **Bearer Token** → Paste JWT token
4. Go to **Body** tab → Select **Multipart Form**
5. Add fields:
   - `nama_layanan`: Deep Cleaning (text)
   - `harga`: 35000 (text, but will be converted to number)
   - `estimasi_waktu`: Sneakers (text)
   - `deskripsi`: Professional deep cleaning (text)
   - `foto`: Select file (file)
6. Click Send

**Example Response:**
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
    "foto_layanan": "https://your-supabase-project.supabase.co/storage/v1/object/public/services/1715363050000_ABC123.jpg",
    "is_active": true
  }
}
```

**Status Codes:**
- `201`: Service created successfully
- `400`: Missing required fields or invalid data
- `404`: Shop not found
- `500`: Upload or server error

---

### 3. Create Service WITHOUT Image

**Example with cURL:**
```bash
curl -X POST "http://localhost:3000/api/v1/admin/manajemen_layanan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "nama_layanan=Leather Care" \
  -F "harga=55000" \
  -F "estimasi_waktu=Leather" \
  -F "deskripsi=Premium leather care"
```

**Response:**
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

### 4. Update Service with New Image

**Endpoint:**
```
PATCH /api/v1/admin/manajemen_layanan/:id
```

**Request Format:** `multipart/form-data`

**Fields (all optional):**
- `nama_layanan` (string): Service name
- `harga` (number): Service price
- `estimasi_waktu` (string): Category/time estimate
- `deskripsi` (string): Service description
- `foto` (file): New image file (old image will be deleted automatically)

**Example with cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/v1/admin/manajemen_layanan/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "harga=40000" \
  -F "foto=@/path/to/new-image.jpg"
```

**Example with Insomnia:**
1. Set method to PATCH
2. Set URL: `http://localhost:3000/api/v1/admin/manajemen_layanan/1`
3. Auth: Bearer Token (same as before)
4. Body: Multipart Form
5. Add fields to update:
   - `harga`: 40000
   - `foto`: Select new image file
6. Click Send

**Response:**
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
    "foto_layanan": "https://...supabase.../services/1715363150000_XYZ789.jpg",
    "is_active": true
  }
}
```

---

### 5. Update Service WITHOUT Image

**Example with cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/v1/admin/manajemen_layanan/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "harga=42000" \
  -F "deskripsi=Updated description"
```

---

### 6. Toggle Service Status (On/Off)

**Endpoint:**
```
PATCH /api/v1/admin/manajemen_layanan/:id/status
```

**Request Format:** `application/json`

**Body:**
```json
{
  "is_active": false
}
```

**Example:**
```bash
curl -X PATCH "http://localhost:3000/api/v1/admin/manajemen_layanan/1/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

---

### 7. Delete Service

Automatically deletes the image from Supabase Storage.

**Endpoint:**
```
DELETE /api/v1/admin/manajemen_layanan/:id
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/admin/manajemen_layanan/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully",
  "data": {
    "success": true,
    "message": "Service deleted successfully"
  }
}
```

---

## Insomnia Setup Instructions

### 1. Create Environment Variables
```
{
  "base_url": "http://localhost:3000/api/v1",
  "token": "your_jwt_token_here"
}
```

### 2. Create Service POST Request
- **Name:** Create Service
- **Method:** POST
- **URL:** `{{base_url}}/admin/manajemen_layanan`
- **Auth:** Bearer Token `{{token}}`
- **Body:** Multipart Form
  - `nama_layanan`: Deep Cleaning
  - `harga`: 35000
  - `estimasi_waktu`: Sneakers
  - `deskripsi`: Professional deep cleaning
  - `foto`: [Select image file]

### 3. Create Service GET Request
- **Name:** Get Services
- **Method:** GET
- **URL:** `{{base_url}}/admin/manajemen_layanan?search=deep`
- **Auth:** Bearer Token `{{token}}`

### 4. Update Service PATCH Request
- **Name:** Update Service
- **Method:** PATCH
- **URL:** `{{base_url}}/admin/manajemen_layanan/1`
- **Auth:** Bearer Token `{{token}}`
- **Body:** Multipart Form
  - `harga`: 40000
  - `foto`: [Select new image file]

### 5. Delete Service DELETE Request
- **Name:** Delete Service
- **Method:** DELETE
- **URL:** `{{base_url}}/admin/manajemen_layanan/1`
- **Auth:** Bearer Token `{{token}}`

---

## Error Handling

### Error: "Cannot destructure property 'nama_layanan' of 'req.body' as it is undefined"
**Cause:** Request body not parsed correctly (likely sending JSON instead of form-data)  
**Solution:** Use `multipart/form-data` format when sending files. Don't use `Content-Type: application/json`

### Error: "Failed to upload service image"
**Cause:** File upload to Supabase failed  
**Possible reasons:**
- Bucket "services" doesn't exist
- Supabase API key not configured
- File too large
- Invalid file format

**Solution:** Check `.env` file has correct Supabase credentials

### Error: "Shop not found for this admin user"
**Cause:** Authenticated user is not an admin or doesn't have associated shop  
**Solution:** Verify user JWT token and admin status

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 400 - Missing required fields | Form fields not sent | Check all required fields are in Multipart Form |
| 500 - Upload failed | Supabase bucket error | Verify bucket "services" exists in Supabase |
| Image URL is null | File not uploaded but request succeeded | File was optional, not provided |
| Old image not deleted | Storage deletion error | Manually delete from Supabase console (non-critical) |

---

## File Storage Details

### Supabase Storage Structure
```
Bucket: services
├── 1715363050000_ABC123.jpg (Deep Cleaning)
├── 1715363150000_XYZ789.jpg (Leather Care)
└── ...
```

### File Naming Convention
```
{timestamp}_{randomString}.{extension}

Example: 1715363050000_ABC123.jpg
```

### Public URL Format
```
https://{project}.supabase.co/storage/v1/object/public/services/{filename}
```

---

## Testing with Postman

### Collection Template
```json
{
  "info": {
    "name": "Manajemen Layanan API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Service",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/admin/manajemen_layanan",
        "header": {
          "Authorization": "Bearer {{token}}"
        },
        "body": {
          "mode": "formdata",
          "formdata": [
            {"key": "nama_layanan", "value": "Deep Cleaning", "type": "text"},
            {"key": "harga", "value": "35000", "type": "text"},
            {"key": "estimasi_waktu", "value": "Sneakers", "type": "text"},
            {"key": "deskripsi", "value": "Professional deep cleaning", "type": "text"},
            {"key": "foto", "type": "file"}
          ]
        }
      }
    }
  ]
}
```

---

## Success Checklist

✅ Multer middleware added to app.js  
✅ File upload functions in service layer  
✅ Controller handles file uploads  
✅ Routes configured with multer  
✅ Supabase storage bucket created  
✅ Public URLs generated correctly  
✅ Old images deleted on update  
✅ Images deleted on service deletion  
✅ Error handling implemented  
✅ Documentation complete  

---

## Next Steps

1. Test in Insomnia with file uploads
2. Verify images appear in Supabase Storage console
3. Verify public URLs are accessible
4. Test image deletion workflow
5. Test error handling with invalid files
