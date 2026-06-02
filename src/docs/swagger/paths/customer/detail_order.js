const detailOrderPaths = {
  "/customer/orders/{orderId}": {
    get: {
      tags: ["Customer - Detail Order"],
      summary: "Ambil detail pesanan berdasarkan ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "UUID dari pesanan",
        },
      ],
      responses: {
        200: {
          description: "Berhasil mengambil detail pesanan",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  data: {
                    type: "object",
                    properties: {
                      order: { $ref: "#/components/schemas/Order" },
                      items: {
                        type: "array",
                        items: { $ref: "#/components/schemas/OrderItem" },
                      },
                      payment: { $ref: "#/components/schemas/Payment" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        404: { description: "Pesanan tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};

module.exports = detailOrderPaths;
