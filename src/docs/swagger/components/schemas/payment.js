module.exports = {
  BankAccount: {
    type: "object",
    properties: {
      id_account: { type: "integer" },
      id_shops: { type: "integer" },
      bank_name: { type: "string" },
      account_number: { type: "string" },
      account_name: { type: "string" },
    },
  },
  BankAccountsResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/BankAccount" },
      },
    },
    required: ["status", "message", "data"],
  },
  ConfirmPaymentResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      message: { type: "string" },
      data: {
        type: "object",
        properties: {
          kode_order: { type: "string" },
          total_ongkir: { type: "number" },
        },
      },
    },
    required: ["status", "message", "data"],
  },
};
