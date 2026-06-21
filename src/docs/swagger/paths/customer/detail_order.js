module.exports = {
  "/customer/detail-order/{orderId}": {
    get: {
      tags: ["Customer - Detail Order"],
      summary: "Get detailed information of a specific order",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          description: "ID of the order to retrieve",
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Order details retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DetailOrderResponse" },
            },
          },
        },
        404: {
          description: "Customer or Order not found",
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
