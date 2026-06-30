module.exports = {
  "/customer/riwayat": {
    get: {
      tags: ["Customer - Riwayat"],
      summary: "Get order history for the current customer",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          description: "Filter order history by status_order",
          schema: { type: "string" },
        },
        {
          name: "search",
          in: "query",
          description: "Search by kode_order or metode_order (partial match)",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Order history retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RiwayatResponse" },
            },
          },
        },
        404: {
          description: "Customer data not found",
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
