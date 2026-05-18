module.exports = {
  AntreanItem: {
    type: "object",
    properties: {
      id_orders: { type: "integer" },
      kode_order: { type: "string" },
      status_order: {
        type: "string",
        enum: ["pending", "diproses", "selesai"],
      },
      tgl_order: { type: "string", format: "date-time" },
      metode_order: { type: "string" },
      metode_bayar: { type: "string" },
      customers: {
        type: "object",
        properties: {
          nama: { type: "string" },
          nomor_hp: { type: "string" },
        },
      },
      detail_orders: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id_detail_orders: { type: "integer" },
            merk: { type: "string" },
            jenis_sepatu: { type: "string" },
            total_harga: { type: "number" },
          },
        },
      },
    },
  },

  AntreanListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/AntreanItem" },
      },
    },
    example: {
      success: true,
      message: "Data antrean berhasil diambil",
      data: [
        {
          id_orders: 101,
          kode_order: "ORD20260516ABCD",
          status_order: "pending",
          tgl_order: "2026-05-16T08:15:30.000Z",
          metode_order: "offline",
          metode_bayar: "cash",
          customers: { nama: "Budi", nomor_hp: "08123456789" },
          detail_orders: [
            {
              id_detail_orders: 501,
              merk: "Nike",
              jenis_sepatu: "Sneakers",
              total_harga: 120000,
            },
          ],
        },
      ],
    },
  },

  AntreanTotalData: {
    type: "object",
    properties: {
      total_hari_ini: {
        type: "integer",
        description: "Total antrean hari ini",
      },
      total_kemarin: { type: "integer", description: "Total antrean kemarin" },
      selisih: {
        type: "integer",
        description: "Selisih antrean hari ini vs kemarin",
      },
      persentase_perubahan: {
        type: "number",
        description: "Persentase perubahan (%)",
      },
    },
  },

  AntreanTotalResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/AntreanTotalData" },
    },
    example: {
      success: true,
      message: "Total antrean berhasil diambil",
      data: {
        total_hari_ini: 12,
        total_kemarin: 8,
        selisih: 4,
        persentase_perubahan: 50,
      },
    },
  },

  AntreanDetailResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/AntreanItem" },
    },
    example: {
      success: true,
      message: "Detail antrean berhasil diambil",
      data: {
        id_orders: 101,
        kode_order: "ORD20260516ABCD",
        status_order: "pending",
        tgl_order: "2026-05-16T08:15:30.000Z",
        metode_order: "offline",
        metode_bayar: "cash",
        customers: { nama: "Budi", nomor_hp: "08123456789" },
        detail_orders: [
          {
            id_detail_orders: 501,
            merk: "Nike",
            jenis_sepatu: "Sneakers",
            total_harga: 120000,
          },
        ],
      },
    },
  },

  AntreanUpdateStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["pending", "diproses", "selesai"],
        description: "Status baru untuk order",
      },
    },
    example: {
      status: "diproses",
    },
  },

  AntreanUpdateStatusResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/AntreanItem" },
    },
    example: {
      success: true,
      message: "Status berhasil diubah ke 'diproses'",
      data: {
        id_orders: 101,
        kode_order: "ORD20260516ABCD",
        status_order: "diproses",
        tgl_order: "2026-05-16T08:15:30.000Z",
        metode_order: "offline",
        metode_bayar: "cash",
        customers: { nama: "Budi", nomor_hp: "08123456789" },
        detail_orders: [
          {
            id_detail_orders: 501,
            merk: "Nike",
            jenis_sepatu: "Sneakers",
            total_harga: 120000,
          },
        ],
      },
    },
  },
};
