const paymentPaths = {
  "/customer/payments/bank-accounts": {
    get: {
      tags: ["Customer - Payment"],
      summary: "Ambil daftar rekening bank tujuan transfer",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Berhasil mengambil daftar rekening",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/BankAccount" },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Internal Server Error" },
      },
    },
  },

  "/customer/payments/confirm": {
    post: {
      tags: ["Customer - Payment"],
      summary: "Upload bukti transfer dan konfirmasi pembayaran",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/PaymentConfirmRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Pembayaran berhasil dikonfirmasi",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: { type: "string", example: "Pesanan Berhasil" },
                  data: {
                    type: "object",
                    properties: {
                      order_number: { type: "string", example: "SS-2024-0891" },
                      total_amount: { type: "integer", example: 75000 },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Data tidak lengkap" },
        404: { description: "Pesanan tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};

module.exports = paymentPaths;
