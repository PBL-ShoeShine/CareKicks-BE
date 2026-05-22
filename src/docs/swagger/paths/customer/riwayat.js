const riwayatPaths = {
  "/customer/orders": {
    get: {
      tags: ["Customer - Riwayat"],
      summary: "Ambil daftar riwayat pesanan customer",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["menunggu", "di_proses", "selesai"],
          },
          description: "Filter berdasarkan status pesanan",
        },
        {
          name: "search",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Cari berdasarkan nama layanan atau nomor pesanan",
        },
      ],
      responses: {
        200: {
          description: "Berhasil mengambil daftar pesanan",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Order" },
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
};

module.exports = riwayatPaths;
