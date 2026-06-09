module.exports = {
  CustomerOrder: {
    type: "object",
    properties: {
      id_orders: { type: "integer", example: 1 },
      kode_order: { type: "string", example: "ORD-BUDI-001" },
      metode_order: { type: "string", example: "online" },
      status_order: { type: "string", example: "menunggu_konfirmasi" },
      tgl_order: {
        type: "string",
        format: "date-time",
        example: "2026-06-07T10:00:00Z",
      },
      total_ongkir: { type: "number", example: 10000 },
      metode_bayar: { type: "string", example: "transfer" },
      status_pembayaran: { type: "string", example: "unpaid" },
      upload_bkt_byr: {
        type: "string",
        nullable: true,
        example: "https://.../payment/123_bukti.jpg",
      },
      alamat_pengantaran: { type: "string", example: "Jl. Merdeka No.10" },
      catatan_pengiriman: {
        type: "string",
        nullable: true,
        example: "Tolong hati-hati",
      },
      shops: {
        type: "object",
        properties: {
          id_shops: { type: "integer", example: 1 },
          nm_toko: { type: "string", example: "Shoes Cleaner Semarang" },
          alamat_toko: { type: "string", example: "Jl. Pemuda No. 12" },
          lat_toko: { type: "number", format: "float", example: -6.9824 },
          long_toko: { type: "number", format: "float", example: 110.4323 },
        },
      },
      detail_orders: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id_detail_orders: { type: "integer", example: 1 },
            total_harga: { type: "number", example: 30000 },
            merk: { type: "string", example: "Adidas" },
            jenis_sepatu: { type: "string", example: "Sneakers" },
            warna: { type: "string", example: "Putih" },
            catatan: {
              type: "string",
              nullable: true,
              example: "Sol agak terkelupas",
            },
            foto_sebelum: { type: "string", nullable: true },
            services: {
              type: "object",
              properties: {
                id_services: { type: "integer", example: 1 },
                nama_layanan: { type: "string", example: "Deep Clean" },
                harga: { type: "number", example: 30000 },
              },
            },
          },
        },
      },
    },
  },
};
