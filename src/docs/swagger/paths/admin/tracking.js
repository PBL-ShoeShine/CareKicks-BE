module.exports = {
  "/admin/tracking": {
    get: {
      tags: ["Admin Tracking"],
      summary: "List tracking orders",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "search",
          in: "query",
          description: "Filter by kode_order (partial match).",
          schema: { type: "string" },
        },
        {
          name: "status",
          in: "query",
          description: "Filter by status_order.",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Tracking orders retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TrackingListResponse" },
              example: {
                success: true,
                message: "Tracking orders retrieved successfully",
                data: [
                  {
                    id_orders: 101,
                    kode_order: "ORD20260516ABCD",
                    status_order: "washing",
                    tgl_order: "2026-05-16T08:15:30.000Z",
                    customers: { nama: "Budi" },
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
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/admin/tracking/{id_orders}": {
    get: {
      tags: ["Admin Tracking"],
      summary: "Get tracking detail for an order",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_orders",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Tracking detail retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TrackingDetailResponse" },
              example: {
                success: true,
                message: "Tracking detail retrieved successfully",
                data: {
                  order: {
                    id_orders: 101,
                    kode_order: "ORD20260516ABCD",
                    id_customer: 33,
                    id_shops: 2,
                    id_staff: 5,
                    tgl_order: "2026-05-16T08:15:30.000Z",
                    status_order: "washing",
                    metode_order: "offline",
                    metode_bayar: "cash",
                    upload_bkt_byr: null,
                    alamat_pengantaran: null,
                    lat_order: null,
                    long_order: null,
                    qr_image: "qr_ORD20260516ABCD.png",
                    link_qr:
                      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORD20260516ABCD",
                    total_ongkir: 0,
                    status_pembayaran: "pending",
                    catatan_pengiriman: null,
                    foto_validasi: null,
                    customers: {
                      nama: "Budi",
                      nomor_hp: "08123456789",
                      alamat: "Jl. Mawar No. 12",
                      latitude: -6.2,
                      longitude: 106.8,
                    },
                    detail_orders: [
                      {
                        id_detail_orders: 501,
                        id_orders: 101,
                        id_services: 3,
                        foto_sebelum:
                          "https://cdn.example.com/tracking/sebelum.jpg",
                        merk: "Nike",
                        jenis_sepatu: "Sneakers",
                        warna: "Hitam",
                        foto_seblum: null,
                        review: null,
                        foto_sesudah: null,
                        total_harga: 120000,
                        services: {
                          id_services: 3,
                          id_shops: 2,
                          nama_layanan: "Deep Clean",
                          harga: 120000,
                          estimasi_waktu: "2 hari",
                          deskripsi: "Cuci mendalam untuk sepatu",
                          is_active: true,
                          foto_layanan: null,
                        },
                      },
                    ],
                  },
                  tracking_logs: [
                    {
                      id_tracking_logs: 9001,
                      status: "washing",
                      id_staff: 5,
                      id_orders: 101,
                      waktu: "2026-05-16T09:00:00.000Z",
                      keterangan: "Sedang dicuci",
                      latitude: -6.2,
                      longitude: 106.8,
                      staff: {
                        id_staff: 5,
                        staff_profile: { nama: "Andi" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    post: {
      tags: ["Admin Tracking"],
      summary: "Update tracking status and add log",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_orders",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: { type: "string" },
                keterangan: { type: "string" },
                latitude: { type: "number" },
                longitude: { type: "number" },
                id_staff: { type: "integer" },
                id_detail_orders: { type: "integer" },
                foto_type: {
                  type: "string",
                  enum: ["sebelum", "sesudah"],
                  description: "Use 'sebelum' or 'sesudah' for washing photos.",
                },
                is_validation: {
                  type: "boolean",
                  description:
                    "Set true for delivery validation photo (accepts true/false or 'true'/'false').",
                },
                foto: {
                  type: "string",
                  format: "binary",
                  description: "Optional image upload.",
                },
              },
            },
            example: {
              status: "washing",
              keterangan: "Sedang dicuci",
              latitude: -6.2,
              longitude: 106.8,
              id_staff: 5,
              id_detail_orders: 501,
              foto_type: "sebelum",
              is_validation: false,
              foto: "<binary file>",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Order status updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TrackingUpdateResponse" },
              example: {
                success: true,
                message: "Order status updated successfully",
                data: {
                  id_orders: 101,
                  kode_order: "ORD20260516ABCD",
                  id_customer: 33,
                  id_shops: 2,
                  id_staff: 5,
                  tgl_order: "2026-05-16T08:15:30.000Z",
                  status_order: "washing",
                  metode_order: "offline",
                  metode_bayar: "cash",
                  upload_bkt_byr: null,
                  alamat_pengantaran: null,
                  lat_order: null,
                  long_order: null,
                  qr_image: "qr_ORD20260516ABCD.png",
                  link_qr:
                    "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORD20260516ABCD",
                  total_ongkir: 0,
                  status_pembayaran: "pending",
                  catatan_pengiriman: null,
                  foto_validasi: null,
                },
              },
            },
          },
        },
        400: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
};
