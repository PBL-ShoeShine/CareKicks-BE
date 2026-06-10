module.exports = {
  BankAccount: {
    type: "object",
    properties: {
      id_account: { type: "integer", example: 1 },
      id_shops: { type: "integer", example: 1 },
      nama_bank: { type: "string", example: "BCA" },
      no_rek: { type: "string", example: "1234567890" },
      atas_nama: { type: "string", example: "Shoes Clean Semarang" },
    },
  },
  PaymentConfirmResponse: {
    type: "object",
    properties: {
      kode_order: { type: "string", example: "ORD-BUDI-001" },
      total_ongkir: { type: "number", example: 10000 },
    },
  },
};
