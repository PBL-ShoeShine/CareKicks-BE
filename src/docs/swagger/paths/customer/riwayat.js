module.exports = {
  "/customer/riwayat": {
    get: {
      tags: ["Customer - Riwayat"],
      summary: "Mendapatkan daftar riwayat pesanan customer",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          schema: { type: "string" },
          description: "Filter pesanan berdasarkan status_order (opsional)"
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Pencarian berdasarkan kode_order atau nama toko (opsional)"
        }
      ],
      responses: {
        200: {
          description: "Berhasil mengambil data riwayat",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CustomerOrder" }
                  }
                }
              }
            }
          }
        },
        500: {
          description: "Terjadi kesalahan pada server"
        }
      }
    }
  }
};