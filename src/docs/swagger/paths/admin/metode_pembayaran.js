module.exports = {
  "/admin/payments": {
    get: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Ambil daftar metode pembayaran",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Data metode pembayaran berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaymentMethodListResponse" },
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
    post: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Tambah metode pembayaran baru",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreatePaymentMethodRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Metode pembayaran berhasil ditambahkan",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaymentMethodResponse" },
            },
          },
        },
        400: {
          description: "Bad request - Kolom wajib tidak diisi",
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

  "/admin/payments/{id}": {
    put: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Update data metode pembayaran",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID Account",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdatePaymentMethodRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Metode pembayaran berhasil diperbarui",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaymentMethodResponse" },
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
    delete: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Hapus metode pembayaran",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID Account",
        },
      ],
      responses: {
        200: {
          description: "Metode pembayaran berhasil dihapus",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
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

  "/admin/payments/{id}/status": {
    patch: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Update status (Aktif/Nonaktif)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID Account",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdatePaymentMethodStatusRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Status berhasil diubah",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaymentMethodResponse" },
            },
          },
        },
        400: {
          description: "Bad request - Status harus boolean",
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

  "/admin/payments/{id}/qris-image": {
    put: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Upload Gambar QRIS",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID Account",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/UploadQrisRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Gambar QRIS berhasil diunggah",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaymentMethodResponse" },
            },
          },
        },
        400: {
          description: "Bad request - File tidak ditemukan atau format salah",
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
