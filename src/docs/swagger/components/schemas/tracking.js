module.exports = {
  CustomerSummary: {
    type: "object",
    properties: {
      nama: { type: "string" },
    },
  },
  CustomerDetail: {
    type: "object",
    properties: {
      nama: { type: "string" },
      nomor_hp: { type: "string", nullable: true },
      alamat: { type: "string", nullable: true },
      latitude: { type: "number", nullable: true },
      longitude: { type: "number", nullable: true },
    },
  },
  Service: {
    type: "object",
    properties: {
      id_services: { type: "integer" },
      id_shops: { type: "integer" },
      nama_layanan: { type: "string" },
      harga: { type: "number", nullable: true },
      estimasi_waktu: { type: "string", nullable: true },
      deskripsi: { type: "string", nullable: true },
      is_active: { type: "boolean" },
      foto_layanan: { type: "string", nullable: true },
    },
  },
  DetailOrderSummary: {
    type: "object",
    properties: {
      id_detail_orders: { type: "integer" },
      merk: { type: "string", nullable: true },
      jenis_sepatu: { type: "string", nullable: true },
      total_harga: { type: "number", nullable: true },
    },
  },
  DetailOrder: {
    type: "object",
    properties: {
      id_detail_orders: { type: "integer" },
      id_orders: { type: "integer" },
      id_services: { type: "integer" },
      foto_sebelum: { type: "string", nullable: true },
      merk: { type: "string", nullable: true },
      jenis_sepatu: { type: "string", nullable: true },
      warna: { type: "string", nullable: true },
      foto_seblum: { type: "string", nullable: true },
      review: { type: "string", nullable: true },
      foto_sesudah: { type: "string", nullable: true },
      total_harga: { type: "number", nullable: true },
    },
  },
  DetailOrderWithService: {
    allOf: [
      { $ref: "#/components/schemas/DetailOrder" },
      {
        type: "object",
        properties: {
          services: { $ref: "#/components/schemas/Service" },
        },
      },
    ],
  },
  Order: {
    type: "object",
    properties: {
      id_orders: { type: "integer" },
      kode_order: { type: "string" },
      id_customer: { type: "integer" },
      id_shops: { type: "integer" },
      id_staff: { type: "integer", nullable: true },
      tgl_order: { type: "string", format: "date-time" },
      status_order: { type: "string" },
      metode_order: { type: "string", nullable: true },
      metode_bayar: { type: "string", nullable: true },
      upload_bkt_byr: { type: "string", nullable: true },
      alamat_pengantaran: { type: "string", nullable: true },
      lat_order: { type: "number", nullable: true },
      long_order: { type: "number", nullable: true },
      qr_image: { type: "string", nullable: true },
      link_qr: { type: "string", nullable: true },
      total_ongkir: { type: "number", nullable: true },
      status_pembayaran: { type: "string", nullable: true },
      catatan_pengiriman: { type: "string", nullable: true },
      foto_validasi: { type: "string", nullable: true },
    },
  },
  OrderWithRelations: {
    allOf: [
      { $ref: "#/components/schemas/Order" },
      {
        type: "object",
        properties: {
          customers: { $ref: "#/components/schemas/CustomerDetail" },
          detail_orders: {
            type: "array",
            items: { $ref: "#/components/schemas/DetailOrderWithService" },
          },
        },
      },
    ],
  },
  StaffProfileSummary: {
    type: "object",
    properties: {
      nama: { type: "string" },
    },
  },
  StaffSummary: {
    type: "object",
    properties: {
      id_staff: { type: "integer" },
      staff_profile: { $ref: "#/components/schemas/StaffProfileSummary" },
    },
  },
  TrackingLog: {
    type: "object",
    properties: {
      id_tracking_logs: { type: "integer" },
      status: { type: "string" },
      id_staff: { type: "integer", nullable: true },
      id_orders: { type: "integer" },
      waktu: { type: "string", format: "date-time" },
      keterangan: { type: "string", nullable: true },
      latitude: { type: "number", nullable: true },
      longitude: { type: "number", nullable: true },
      staff: { $ref: "#/components/schemas/StaffSummary" },
    },
  },
  TrackingOrderSummary: {
    type: "object",
    properties: {
      id_orders: { type: "integer" },
      kode_order: { type: "string" },
      status_order: { type: "string" },
      tgl_order: { type: "string", format: "date-time" },
      customers: { $ref: "#/components/schemas/CustomerSummary" },
      detail_orders: {
        type: "array",
        items: { $ref: "#/components/schemas/DetailOrderSummary" },
      },
    },
  },
  TrackingListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/TrackingOrderSummary" },
      },
    },
    required: ["success", "message", "data"],
  },
  TrackingDetailData: {
    type: "object",
    properties: {
      order: { $ref: "#/components/schemas/OrderWithRelations" },
      tracking_logs: {
        type: "array",
        items: { $ref: "#/components/schemas/TrackingLog" },
      },
    },
    required: ["order", "tracking_logs"],
  },
  TrackingDetailResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/TrackingDetailData" },
    },
    required: ["success", "message", "data"],
  },
  TrackingUpdateResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/Order" },
    },
    required: ["success", "message", "data"],
  },
};
