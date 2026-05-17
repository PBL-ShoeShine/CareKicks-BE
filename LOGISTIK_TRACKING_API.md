# Tracking API Documentation

Endpoint base: `/api/v1/admin/tracking`

## 1. Get All Tracking Orders
Retrieve a list of all orders for the admin's shop with their current status.

- **URL:** `/`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `search` (optional): Search by `kode_order`
  - `status` (optional): Filter by `status_order`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Tracking orders retrieved successfully",
    "data": [
      {
        "id_orders": 1,
        "kode_order": "ORD-001",
        "status_order": "pending",
        "tgl_order": "2023-10-27T10:00:00Z",
        "customers": { "nama": "John Doe" },
        "detail_orders": [ ... ]
      }
    ]
  }
  ```

## 2. Get Tracking Detail (Includes Maps/Address)
Retrieve complete tracking history and customer address/location for delivery.

- **URL:** `/:id_orders`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Tracking detail retrieved successfully",
    "data": {
      "order": {
        "id_orders": 1,
        "alamat_pengantaran": "...",
        "lat_order": -6.123,
        "long_order": 106.123,
        "foto_validasi": "url_to_photo",
        "customers": {
          "nama": "...",
          "alamat": "...",
          "latitude": -6.456,
          "longitude": 106.456
        },
        "detail_orders": [ ... ]
      },
      "tracking_logs": [
        {
          "status": "delivered",
          "latitude": -6.789,
          "longitude": 106.789,
          "keterangan": "Sampai tujuan",
          "waktu": "..."
        }
      ]
    }
  }
  ```

## 3. Update Tracking & Upload Photo
Update status, log geolocation, and upload validation photos.

- **URL:** `/:id_orders`
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body (form-data):**
  - `status`: (String, required) e.g., `diproses`, `ready`, `delivered`
  - `keterangan`: (String, optional) Note
  - `latitude`: (Numeric, optional) Current location of staff/courier
  - `longitude`: (Numeric, optional) Current location of staff/courier
  - `is_validation`: (Boolean, optional) Set to `true` if this is the final delivery photo (`foto_validasi`)
  - `foto`: (File, optional) The image file
  - `id_detail_orders`: (Integer, optional) Only for washing process photos
  - `foto_type`: (String, optional) `sebelum` or `sesudah`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Order status updated successfully",
    "data": { ... }
  }
  ```

---

## Testing in Postman
1. **Login:** Obtain your admin JWT token.
2. **Set Auth:** In Postman, go to the **Authorization** tab, select **Bearer Token**, and paste your token.
3. **List Orders:** Call `GET /api/v1/admin/tracking`.
4. **Update Status:**
   - Create a `POST` request to `/api/v1/admin/tracking/1` (replace `1` with an actual `id_orders`).
   - Go to the **Body** tab, select **form-data**.
   - Add keys like `status`, `keterangan`, and `foto` (change type to `File`).
   - Send the request.
