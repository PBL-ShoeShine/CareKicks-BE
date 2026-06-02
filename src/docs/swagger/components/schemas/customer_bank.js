const customerBankSchemas = {
  BankAccount: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      bank_name: { type: "string", example: "Bank BCA" },
      account_holder: { type: "string", example: "PT ShoeShine Atelier" },
      account_number: { type: "string", example: "8830123456" },
      is_active: { type: "boolean", example: true },
    },
  },
};

module.exports = customerBankSchemas;
