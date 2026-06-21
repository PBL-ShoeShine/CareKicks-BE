module.exports = {
  RiwayatItem: {
    type: "object",
    properties: {
      id_orders: { type: "integer" },
      kode_order: { type: "string" },
      metode_order: { type: "string" },
      status_order: { type: "string" },
      tgl_order: { type: "string", format: "date-time" },
      total_ongkir: { type: "number" },
      metode_bayar: { type: "string" },
      status_pembayaran: { type: "string" },
      shops: {
        type: "object",
        properties: {
          nm_toko: { type: "string" },
        },
      },
      detail_orders: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id_detail_orders: { type: "integer" },
            total_harga: { type: "number" },
          },
        },
      },
    },
  },
  RiwayatResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/RiwayatItem" },
      },
    },
    required: ["status", "data"],
  },
};
