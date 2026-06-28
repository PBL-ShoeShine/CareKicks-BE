module.exports = {
  "/customer/order": {
    post: {
      tags: ["Customer - Order"],
      summary: "Customer buat pesanan online baru",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/CreateOrderRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Pesanan berhasil dibuat",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrderResponse" },
            },
          },
        },
        400: {
          description: "Bad request - validasi gagal",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "Toko atau data customer tidak ditemukan",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/customer/order/services/{idShops}": {
    get: {
      tags: ["Customer - Order"],
      summary: "Ambil daftar layanan aktif dari toko tertentu",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "idShops",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID toko yang ingin diambil daftar layanannya",
        },
      ],
      responses: {
        200: {
          description: "Daftar layanan berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ShopServicesResponse" },
            },
          },
        },
        400: {
          description: "idShops tidak valid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
};
