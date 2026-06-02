module.exports = {
  "/admin/toko/profil": {
    get: {
      tags: ["Admin Toko"],
      summary: "Get shop profile info",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Shop profile retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ShopProfileResponse" },
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
    patch: {
      tags: ["Admin Toko"],
      summary: "Update shop profile info",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                nm_toko: { type: "string" },
                desk_toko: { type: "string" },
                alamat_toko: { type: "string" },
                lat_toko: { type: "number" },
                long_toko: { type: "number" },
                spesialisasi: { type: "string" },
                tgl_berdiri: { type: "string", format: "date" },
                foto_toko: {
                  type: "string",
                  format: "binary",
                  description: "Optional shop photo upload",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Shop profile updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ShopProfileResponse" },
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
      },
    },
  },
  "/admin/toko/jam-operasional": {
    get: {
      tags: ["Admin Toko"],
      summary: "Get shop operating hours",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Shop operating hours retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OperatingHoursResponse" },
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
    patch: {
      tags: ["Admin Toko"],
      summary: "Update shop operating hours",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateOperatingHoursRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Shop operating hours updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OperatingHoursResponse" },
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
      },
    },
  },
};
