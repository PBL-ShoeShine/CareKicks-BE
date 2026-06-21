module.exports = {
  DetailOrderData: {
    type: "object",
    properties: {
      order: {
        type: "object",
        properties: {
          id_orders: { type: "integer" },
          kode_order: { type: "string" },
          id_customer: { type: "integer" },
          id_shops: { type: "integer" },
          metode_order: { type: "string" },
          status_order: { type: "string" },
          tgl_order: { type: "string", format: "date-time" },
          total_ongkir: { type: "number" },
          metode_bayar: { type: "string" },
          status_pembayaran: { type: "string" },
          upload_bkt_byr: { type: "string", nullable: true },
          shops: {
            type: "object",
            properties: {
              id_shops: { type: "integer" },
              nm_toko: { type: "string" },
              alamat_toko: { type: "string" },
              lat_toko: { type: "string", nullable: true },
              long_toko: { type: "string", nullable: true },
            },
          },
        },
      },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id_detail_orders: { type: "integer" },
            id_orders: { type: "integer" },
            id_services: { type: "integer" },
            qty: { type: "integer" },
            total_harga: { type: "number" },
            services: {
              type: "object",
              properties: {
                id_services: { type: "integer" },
                nama_layanan: { type: "string" },
                harga: { type: "number" },
              },
            },
          },
        },
      },
      timeline: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id_history: { type: "integer" },
            status: { type: "string" },
            keterangan: { type: "string", nullable: true },
            changed_by_role: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            nama_staff: { type: "string", nullable: true },
          },
        },
      },
      payment: {
        type: "object",
        properties: {
          status_pembayaran: { type: "string", nullable: true },
          metode_pembayaran: { type: "string", nullable: true },
          bukti_pembayaran: { type: "string", nullable: true },
        },
      },
    },
  },
  DetailOrderResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      data: { $ref: "#/components/schemas/DetailOrderData" },
    },
    required: ["status", "data"],
  },
};
