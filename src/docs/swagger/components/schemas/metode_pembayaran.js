module.exports = {
  PaymentMethod: {
    type: "object",
    properties: {
      id_account: { type: "integer" },
      id_shops: { type: "integer" },
      tipe_pembayaran: { type: "string" },
      nama_bank: { type: "string" },
      no_rek: { type: "string" },
      atas_nama: { type: "string" },
      path_qris: { type: "string", nullable: true },
      is_active: { type: "boolean" },
      is_default: { type: "boolean" },
      created_at: { type: "string", format: "date-time" },
    },
  },

  PaymentMethodListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/PaymentMethod" },
      },
    },
  },

  PaymentMethodResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/PaymentMethod" },
    },
  },

  CreatePaymentMethodRequest: {
    type: "object",
    required: ["tipe_pembayaran", "nama_bank", "no_rek", "atas_nama"],
    properties: {
      tipe_pembayaran: { type: "string" },
      nama_bank: { type: "string" },
      no_rek: { type: "string" },
      atas_nama: { type: "string" },
      is_default: { type: "boolean" },
    },
    example: {
      tipe_pembayaran: "Transfer Bank",
      nama_bank: "BCA",
      no_rek: "1234567890",
      atas_nama: "John Doe",
      is_default: true,
    },
  },

  UpdatePaymentMethodRequest: {
    type: "object",
    properties: {
      nama_bank: { type: "string" },
      no_rek: { type: "string" },
      atas_nama: { type: "string" },
      is_default: { type: "boolean" },
    },
    example: {
      nama_bank: "Mandiri",
      no_rek: "0987654321",
    },
  },

  UpdatePaymentMethodStatusRequest: {
    type: "object",
    required: ["is_active"],
    properties: {
      is_active: { type: "boolean" },
    },
    example: {
      is_active: false,
    },
  },

  UploadQrisRequest: {
    type: "object",
    required: ["image"],
    properties: {
      image: {
        type: "string",
        format: "binary",
        description: "QRIS image file (max 5MB)",
      },
    },
  },
};
