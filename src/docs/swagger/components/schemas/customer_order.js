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

  CreateOrderRequest: {
    type: "object",
    required: ["id_shops", "nama_pemilik", "no_hp", "alamat", "services"],
    properties: {
      id_shops: { type: "integer", example: 1 },
      nama_pemilik: { type: "string", example: "Budi Santoso" },
      no_hp: { type: "string", example: "081234567890" },
      alamat: { type: "string", example: "Jl. Ahmad Yani No. 10" },
      lat_order: { type: "number", format: "float", example: -6.9824 },
      long_order: { type: "number", format: "float", example: 110.4323 },
      catatan: { type: "string", example: "Sepatu warna putih" },
      services: {
        type: "string",
        description: "JSON array string of service IDs, e.g., '[{\"id_services\":1}]'",
        example: '[{"id_services":1}]',
      },
      foto_sepatu: {
        type: "string",
        format: "binary",
        description: "Foto sepatu sebelum dicuci",
      },
    },
  },

  CreateOrderResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      message: { type: "string", example: "Pesanan berhasil dibuat. Silakan lakukan pembayaran." },
      data: {
        type: "object",
        properties: {
          id_orders: { type: "integer", example: 101 },
          kode_order: { type: "string", example: "ORD1623830400000ABC" },
          tgl_order: { type: "string", format: "date-time" },
          status_order: { type: "string", example: "pending" },
          status_pembayaran: { type: "string", example: "unpaid" },
          total_harga: { type: "number", example: 50000 },
          qr_code: { type: "string", example: "https://api.qrserver.com/v1/..." },
          foto_sepatu_url: { type: "string", example: "https://.../services/orders/..." },
          nm_toko: { type: "string", example: "Shoes Cleaner Semarang" },
          services: {
            type: "array",
            items: {
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
    },
  },

  ShopServicesResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      message: { type: "string", example: "Daftar layanan berhasil diambil" },
      data: {
        type: "object",
        properties: {
          nm_toko: { type: "string", example: "Shoes Cleaner Semarang" },
          id_shops: { type: "integer", example: 1 },
          services: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id_services: { type: "integer" },
                nama_layanan: { type: "string" },
                harga: { type: "number" },
                estimasi_waktu: { type: "string" },
                deskripsi: { type: "string" },
                is_active: { type: "boolean" },
              },
            },
          },
        },
      },
    },
  },
};
