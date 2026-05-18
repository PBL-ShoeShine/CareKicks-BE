module.exports = {
  DashboardResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "object",
        properties: {
          greeting: { type: "string" },
          shop_info: {
            type: "object",
            properties: {
              id_shops: { type: "integer" },
              nm_toko: { type: "string" },
              saldo_toko: { type: "number" },
            },
          },
          pesanan_aktif: {
            type: "object",
            properties: {
              total: { type: "integer" },
              hari_ini: { type: "integer" },
            },
          },
          antrean_cuci: {
            type: "object",
            properties: {
              total: { type: "integer" },
              detail: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    jenis: { type: "string" },
                    jumlah: { type: "integer" },
                  },
                },
              },
            },
          },
          saldo_toko: { type: "number" },
          aktivitas_terkini: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id_orders: { type: "integer" },
                kode_order: { type: "string" },
                tgl_order: { type: "string", format: "date-time" },
                status_order: { type: "string" },
                nama_produk: { type: "string" },
                nama_pelanggan: { type: "string" },
                nama_staff: { type: "string" },
                foto_produk: { type: "string", nullable: true },
                jenis_layanan: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};
