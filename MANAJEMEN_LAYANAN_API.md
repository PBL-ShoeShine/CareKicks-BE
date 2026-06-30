# Manajemen Layanan API Documentation

## Overview
The Manajemen Layanan (Service Management) endpoint allows shop admins to manage their services including creating, reading, updating, and toggling service status.

## Base URL
```
/api/v1/admin/manajemen_layanan
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header.

## Endpoints

### 1. Get All Services
Retrieve all services for the authenticated admin's shop with optional search and category filter.

**Endpoint:**
```
GET /api/v1/admin/manajemen_layanan
```

**Query Parameters:**
- `search` (optional): Search for services by name
- `category` (optional): Filter by category (e.g., "Sneakers", "Leather", "Repaint")

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/admin/manajemen_layanan?search=deep&category=Sneakers" \
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
      "foto_layanan": "https://example.com/deep-cleaning.jpg",
      "is_active": true,
      "id_shops": 1
    },
    {
      "id_services": 2,
      "nama_layanan": "Leather Care",
      "harga": 55000,
      "estimasi_waktu": "Leather",
      "deskripsi": "Premium leather care service",
      "foto_layanan": "https://example.com/leather-care.jpg",
      "is_active": true,
      "id_shops": 1
    }
  ]
}
```

---

### 2. Create New Service
Create a new service for the shop.

**Endpoint:**
```
POST /api/v1/admin/manajemen_layanan
```

**Request Body:**
```json
{
  "nama_layanan": "Service Name",
  "harga": 50000,
  "estimasi_waktu": "Category",
  "deskripsi": "Service description",
  "foto_layanan": "https://example.com/service-image.jpg"
}
```

**Required Fields:**
- `nama_layanan` (string): Service name
- `harga` (number): Service price (must be positive)
- `estimasi_waktu` (string): Category or time estimate (e.g., "Sneakers", "Leather", "Repaint")

**Optional Fields:**
- `deskripsi` (string): Service description
- `foto_layanan` (string): Service image URL

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/v1/admin/manajemen_layanan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_layanan": "Unyellowing",
    "harga": 45000,
    "estimasi_waktu": "Sneakers",
    "deskripsi": "Remove yellowing from white sneakers",
    "foto_layanan": "https://example.com/unyellowing.jpg"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id_services": 5,
    "id_shops": 1,
    "nama_layanan": "Unyellowing",
    "harga": 45000,
    "estimasi_waktu": "Sneakers",
    "deskripsi": "Remove yellowing from white sneakers",
    "foto_layanan": "https://example.com/unyellowing.jpg",
    "is_active": true
  }
}
```

**Status Codes:**
- `201`: Service created successfully
- `400`: Missing or invalid required fields
- `404`: Shop not found
- `500`: Server error

---

### 3. Update Service Status (Toggle On/Off)
Toggle a service between active and inactive status.

**Endpoint:**
```
PATCH /api/v1/admin/manajemen_layanan/:id/status
```

**URL Parameters:**
- `id` (number): Service ID

**Request Body:**
```json
{
  "is_active": true
}
```

**Required Fields:**
- `is_active` (boolean): Service status

**Example Request:**
```bash
curl -X PATCH "http://localhost:3000/api/v1/admin/manajemen_layanan/3/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Service status updated successfully",
  "data": {
    "id_services": 3,
    "id_shops": 1,
    "nama_layanan": "Repaint Upper",
    "harga": 120000,
    "estimasi_waktu": "Repaint",
    "deskripsi": "Professional repainting service",
    "is_active": false
  }
}
```

**Status Codes:**
- `200`: Service status updated successfully
- `400`: is_active must be boolean
- `404`: Service not found or unauthorized
- `500`: Server error

---

### 4. Update Service Details
Update service information (name, price, category, description, image).

**Endpoint:**
```
PATCH /api/v1/admin/manajemen_layanan/:id
```

**URL Parameters:**
- `id` (number): Service ID

**Request Body:**
```json
{
  "nama_layanan": "New Service Name",
  "harga": 60000,
  "estimasi_waktu": "Category",
  "deskripsi": "New description",
  "foto_layanan": "https://example.com/new-image.jpg"
}
```

**Fields to Update (all optional):**
- `nama_layanan` (string): Service name
- `harga` (number): Service price (must be positive)
- `estimasi_waktu` (string): Category or time estimate
- `deskripsi` (string): Service description
- `foto_layanan` (string): Service image URL

**Example Request:**
```bash
curl -X PATCH "http://localhost:3000/api/v1/admin/manajemen_layanan/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "harga": 60000,
    "deskripsi": "Premium leather care with conditioning",
    "foto_layanan": "https://example.com/leather-care-new.jpg"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "id_services": 2,
    "id_shops": 1,
    "nama_layanan": "Leather Care",
    "harga": 60000,
    "estimasi_waktu": "Leather",
    "deskripsi": "Premium leather care with conditioning",
    "foto_layanan": "https://example.com/leather-care-new.jpg",
    "is_active": true
  }
}
```

**Status Codes:**
- `200`: Service updated successfully
- `400`: Invalid field values
- `404`: Service not found or unauthorized
- `500`: Server error

---

### 5. Delete Service
Delete a service from the shop.

**Endpoint:**
```
DELETE /api/v1/admin/manajemen_layanan/:id
```

**URL Parameters:**
- `id` (number): Service ID

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/admin/manajemen_layanan/5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
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

**Status Codes:**
- `200`: Service deleted successfully
- `404`: Service not found or unauthorized
- `500`: Server error

---

## Common Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Error Codes

| Status | Message | Description |
|--------|---------|-------------|
| 400 | Missing required fields | Required fields are not provided |
| 400 | harga must be a positive number | Price is negative or not a number |
| 400 | is_active must be a boolean value | is_active is not boolean |
| 404 | Shop not found for this admin user | Admin user has no associated shop |
| 404 | Service not found or unauthorized | Service doesn't exist or doesn't belong to the shop |
| 500 | Server error message | Unexpected server error |

---

## Implementation Files

The following files have been created:

1. **manajemen_layanan.service.js** - Business logic and database queries
2. **manajemen_layanan.controller.js** - Request handlers
3. **manajemen_layanan.routes.js** - Route definitions
4. **admin/index.js** - Updated to include manajemen_layanan routes

---

## Testing with Postman

### Import Collection
You can import these endpoints into Postman for testing.

### Sample Test Cases

**1. Get All Services**
- Method: GET
- URL: `{{base_url}}/api/v1/admin/manajemen_layanan`
- Headers: `Authorization: Bearer {{token}}`

**2. Create Service**
- Method: POST
- URL: `{{base_url}}/api/v1/admin/manajemen_layanan`
- Headers: `Authorization: Bearer {{token}}`
- Body: Raw JSON

**3. Toggle Service Status**
- Method: PATCH
- URL: `{{base_url}}/api/v1/admin/manajemen_layanan/1/status`
- Headers: `Authorization: Bearer {{token}}`
- Body: Raw JSON

**4. Update Service**
- Method: PATCH
- URL: `{{base_url}}/api/v1/admin/manajemen_layanan/1`
- Headers: `Authorization: Bearer {{token}}`
- Body: Raw JSON

**5. Delete Service**
- Method: DELETE
- URL: `{{base_url}}/api/v1/admin/manajemen_layanan/1`
- Headers: `Authorization: Bearer {{token}}`
