// docs/swagger/paths/customer/payment.js
module.exports = {
  "/customer/payment/bank-accounts": {
    get: {
      tags: ["Customer - Payment"],
      summary: "Customer: Ambil daftar rekening bank toko",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "order_id",
          in: "query",
          required: true,
          schema: { type: "string" },
          description: "ID order untuk mencari bank milik toko tersebut",
        },
      ],
      responses: {
        200: {
          description: "Berhasil mengambil data rekening",
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
      },
    },
  },
};
