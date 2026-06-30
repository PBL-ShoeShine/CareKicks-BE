module.exports = {
  PaymentMethod: {
    type: "object",
    properties: {
      id_account: { type: "integer", example: 1 },
      id_shops: { type: "integer", example: 1 },
      tipe_pembayaran: { type: "string", example: "Transfer Bank" },
      nama_bank: { type: "string", example: "BCA" },
      no_rek: { type: "string", example: "1234567890" },
      atas_nama: { type: "string", example: "CareKicks Official" },
      is_active: { type: "boolean", example: true },
      is_default: { type: "boolean", example: false },
      path_qris: { type: "string", nullable: true, example: "https://.../qris.jpg" },
    },
  },
  PaymentMethodResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/PaymentMethod" },
      },
    },
  },
  PaymentMethodSingleResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/PaymentMethod" },
    },
  },
};