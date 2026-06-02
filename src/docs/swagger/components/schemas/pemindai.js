module.exports = {
  PemindaiVerifyRequest: {
    type: "object",
    required: ["qr_code"],
    properties: {
      qr_code: { type: "string", description: "The QR code string or URL containing the order code" },
    },
    example: {
      qr_code: "ORD20260516ABCD",
    },
  },

  PemindaiCustomer: {
    type: "object",
    properties: {
      nama: { type: "string" },
      alamat: { type: "string", nullable: true },
    },
  },

  PemindaiService: {
    type: "object",
    properties: {
      nama_layanan: { type: "string" },
      harga: { type: "number" },
    },
  },

  PemindaiDetailOrder: {
    type: "object",
    properties: {
      merk: { type: "string", nullable: true },
      jenis_sepatu: { type: "string", nullable: true },
      warna: { type: "string", nullable: true },
      catatan: { type: "string", nullable: true },
      services: { $ref: "#/components/schemas/PemindaiService" },
    },
  },

  PemindaiDetailData: {
    type: "object",
    properties: {
      id_orders: { type: "integer" },
      kode_order: { type: "string" },
      tgl_order: { type: "string", format: "date-time" },
      status_order: { type: "string" },
      metode_pengambilan: { type: "string", nullable: true },
      alamat_pengantaran: { type: "string", nullable: true },
      link_qr: { type: "string", nullable: true },
      customers: { $ref: "#/components/schemas/PemindaiCustomer" },
      detail_orders: {
        type: "array",
        items: { $ref: "#/components/schemas/PemindaiDetailOrder" },
      },
    },
  },

  PemindaiVerifyResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/PemindaiDetailData" },
    },
    example: {
      success: true,
      message: "Data ditemukan",
      data: {
        id_orders: 101,
        kode_order: "ORD20260516ABCD",
        tgl_order: "2026-05-16T08:15:30.000Z",
        status_order: "pending",
        metode_pengambilan: "delivery",
        alamat_pengantaran: "Jl. Mawar No. 12",
        link_qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORD20260516ABCD",
        customers: {
          nama: "Budi",
          alamat: "Jl. Mawar No. 12",
        },
        detail_orders: [
          {
            merk: "Nike",
            jenis_sepatu: "Sneakers",
            warna: "Hitam",
            catatan: null,
            services: {
              nama_layanan: "Deep Clean",
              harga: 120000,
            },
          },
        ],
      },
    },
  },

  PemindaiUpdateStatusRequest: {
    type: "object",
    required: ["kode_order"],
    properties: {
      kode_order: { type: "string", description: "The order code to update" },
      status_baru: { type: "string", description: "The new status (also accepts status or status_order)" },
    },
    example: {
      kode_order: "ORD20260516ABCD",
      status_baru: "dicuci",
    },
  },

  PemindaiUpdateStatusData: {
    type: "object",
    properties: {
      id_orders: { type: "integer" },
    },
  },

  PemindaiUpdateStatusResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/PemindaiUpdateStatusData" },
      },
    },
    example: {
      success: true,
      message: "Status berhasil diperbarui",
      data: [
        {
          id_orders: 101,
        },
      ],
    },
  },
};
