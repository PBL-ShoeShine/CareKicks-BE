const customerPaymentSchemas = {
  Payment: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      order_id: { type: "string", format: "uuid" },
      payment_method: {
        type: "string",
        enum: ["E-Wallet", "Transfer Bank"],
        example: "Transfer Bank",
      },
      service_fee: { type: "integer", example: 10000 },
      additional_fee: { type: "integer", example: 2000 },
      total_amount: { type: "integer", example: 12000 },
      payment_status: {
        type: "string",
        enum: ["menunggu_pembayaran", "berhasil", "gagal"],
        example: "menunggu_pembayaran",
      },
      payment_proof_url: { type: "string", nullable: true, example: null },
      payment_deadline: {
        type: "string",
        format: "date-time",
        example: "2024-12-05T23:59:59Z",
      },
      paid_at: { type: "string", format: "date-time", nullable: true },
    },
  },

  PaymentConfirmRequest: {
    type: "object",
    required: ["order_id", "payment_proof_url"],
    properties: {
      order_id: { type: "string", format: "uuid" },
      payment_proof_url: {
        type: "string",
        example: "https://supabase.storage/bukti-transfer.jpg",
      },
    },
  },
};

module.exports = customerPaymentSchemas;
