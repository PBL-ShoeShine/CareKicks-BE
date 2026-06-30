module.exports = {
  "/admin/manajemen_staff/register": {
    post: {
      tags: ["Admin Manajemen Staff"],
      summary: "Tambah staff baru",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/StaffRegisterRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Staff berhasil didaftarkan",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StaffRegisterResponse" },
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
      },
    },
  },

  "/admin/manajemen_staff": {
    get: {
      tags: ["Admin Manajemen Staff"],
      summary: "List semua staff",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "search",
          in: "query",
          description: "Filter berdasarkan nama staff (partial match).",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "List staff berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StaffListResponse" },
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

  "/admin/manajemen_staff/{id}": {
    get: {
      tags: ["Admin Manajemen Staff"],
      summary: "Detail staff berdasarkan ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID staff",
        },
      ],
      responses: {
        200: {
          description: "Detail staff berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StaffDetailResponse" },
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
        404: {
          description: "Staff tidak ditemukan",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },

    patch: {
      tags: ["Admin Manajemen Staff"],
      summary: "Update profil atau status staff",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID staff",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/StaffUpdateRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Data staff berhasil diupdate",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StaffUpdateResponse" },
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
      },
    },

    delete: {
      tags: ["Admin Manajemen Staff"],
      summary: "Hapus staff berdasarkan ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID staff",
        },
      ],
      responses: {
        200: {
          description: "Staff berhasil dihapus",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StaffDeleteResponse" },
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
