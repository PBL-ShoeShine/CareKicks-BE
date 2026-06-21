module.exports = {
  "/admin/konfirmasi_pesanan": {
    get: {
      tags: ["Admin Konfirmasi Pesanan"],
      summary: "Ambil daftar antrean konfirmasi",
      description: "Mengambil pesanan berdasarkan tab: pesanan_masuk, pembayaran, atau pesanan_baru",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "tab",
          in: "query",
          description: "Filter tab antrean",
          schema: {
            type: "string",
            enum: ["pesanan_masuk", "pembayaran", "pesanan_baru"],
            default: "pembayaran",
          },
        },
      ],
      responses: {
        200: {
          description: "Daftar antrean berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/KonfirmasiPesananResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Server Error" },
      },
    },
  },

  "/admin/konfirmasi_pesanan/pembayaran/{id_orders}": {
    patch: {
      tags: ["Admin Konfirmasi Pesanan"],
      summary: "Konfirmasi pembayaran customer",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_orders",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ConfirmActionRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Pembayaran berhasil diproses",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/AntreanItem" },
                },
              },
            },
          },
        },
        400: { description: "Bad Request" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/admin/konfirmasi_pesanan/pesanan/{id_orders}": {
    patch: {
      tags: ["Admin Konfirmasi Pesanan"],
      summary: "Konfirmasi pesanan masuk (tahap awal)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_orders",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ConfirmActionRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Pesanan berhasil diproses",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/AntreanItem" },
                },
              },
            },
          },
        },
        400: { description: "Bad Request" },
        401: { description: "Unauthorized" },
      },
    },
  },
};
