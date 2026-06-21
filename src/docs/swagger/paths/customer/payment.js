module.exports = {
  "/customer/payment/bank-accounts": {
    get: {
      tags: ["Customer - Payment"],
      summary: "Get list of bank accounts for payment transfer",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "order_id",
          in: "query",
          required: true,
          description:
            "ID of the order to get the associated shop's bank accounts",
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Bank accounts retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BankAccountsResponse" },
            },
          },
        },
        400: {
          description: "Bad request - order_id is missing",
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
  "/customer/payment/confirm": {
    post: {
      tags: ["Customer - Payment"],
      summary: "Upload payment proof and confirm payment",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["order_id", "payment_proof"],
              properties: {
                order_id: {
                  type: "integer",
                  description: "ID of the order being paid",
                },
                payment_proof: {
                  type: "string",
                  format: "binary",
                  description:
                    "Image file of the payment proof (e.g., transfer receipt)",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Payment proof uploaded and confirmed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConfirmPaymentResponse" },
            },
          },
        },
        400: {
          description:
            "Bad request - Missing parameters or order status is invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: {
          description: "Server error or file upload failure",
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
