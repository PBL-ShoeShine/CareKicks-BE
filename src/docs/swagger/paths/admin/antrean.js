module.exports = {
  "/admin/antrean": {
    get: {
      tags: ["Admin Antrean"],
      summary: "List semua antrean",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          description: "Filter berdasarkan status order.",
          schema: {
            type: "string",
            enum: ["pending", "diproses", "selesai"],
          },
        },
      ],
      responses: {
        200: {
          description: "Data antrean berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AntreanListResponse" },
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

  "/admin/antrean/total": {
    get: {
      tags: ["Admin Antrean"],
      summary: "Total antrean hari ini beserta selisih dari kemarin",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Total antrean berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AntreanTotalResponse" },
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

  "/admin/antrean/{id}": {
    get: {
      tags: ["Admin Antrean"],
      summary: "Detail satu antrean berdasarkan ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID order",
        },
      ],
      responses: {
        200: {
          description: "Detail antrean berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AntreanDetailResponse" },
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

  "/admin/antrean/{id}/status": {
    patch: {
      tags: ["Admin Antrean"],
      summary: "Update status antrean",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "ID order",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AntreanUpdateStatusRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Status berhasil diubah",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AntreanUpdateStatusResponse" },
            },
          },
        },
        400: {
          description: "Bad request – field 'status' wajib diisi",
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