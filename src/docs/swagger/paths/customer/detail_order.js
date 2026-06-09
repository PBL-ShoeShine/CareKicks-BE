module.exports = {
  "/customer/detail-order/{orderId}": {
    get: {
      tags: ["Customer - Detail Order"],
      summary: "Mendapatkan detail pesanan berdasarkan ID Order",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "ID dari pesanan yang ingin dilihat detailnya"
        }
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
                      order: { $ref: "#/components/schemas/CustomerOrder" },
                      items: {
                        type: "array",
                        description: "Daftar sepatu yang dicuci",
                        items: { type: "object" } 
                      },
                      payment: { type: "object", nullable: true }
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: "Pesanan tidak ditemukan"
        }
      }
    }
  }
};