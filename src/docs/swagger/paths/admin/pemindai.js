module.exports = {
  "/admin/pemindai/verify": {
    post: {
      tags: ["Admin Pemindai"],
      summary: "Verify and retrieve order details by QR Code",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/PemindaiVerifyRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Order data retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PemindaiVerifyResponse" },
            },
          },
        },
        400: {
          description: "Bad request",
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
        404: {
          description: "Data not found",
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

  "/admin/pemindai/update-status": {
    put: {
      tags: ["Admin Pemindai"],
      summary: "Update order status",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/PemindaiUpdateStatusRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Order status updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PemindaiUpdateStatusResponse" },
            },
          },
        },
        400: {
          description: "Bad request - missing parameters",
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
        404: {
          description: "Order not found",
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
