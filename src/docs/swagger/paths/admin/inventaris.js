module.exports = {
  "/admin/inventaris": {
    get: {
      tags: ["Admin Inventaris"],
      summary: "List inventory items",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "search",
          in: "query",
          description: "Filter by nama_item (partial match).",
          schema: { type: "string" },
        },
        {
          name: "category",
          in: "query",
          description: "Filter by kategori.",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Inventory items retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InventoryListResponse" },
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
      tags: ["Admin Inventaris"],
      summary: "Create new inventory item",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["nama_item"],
              properties: {
                nama_item: { type: "string" },
                kategori: { type: "string" },
                stok_saat_ini: { type: "number" },
                stok_maksimum: { type: "number" },
                stok_minimum: { type: "number" },
                satuan: { type: "string" },
                foto_inven: {
                  type: "string",
                  format: "binary",
                  description: "Optional inventory item photo upload",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Inventory item created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InventoryItemResponse" },
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
  "/admin/inventaris/summary": {
    get: {
      tags: ["Admin Inventaris"],
      summary: "Get inventory summary",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Inventory summary retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InventorySummaryResponse" },
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
  "/admin/inventaris/{id}": {
    patch: {
      tags: ["Admin Inventaris"],
      summary: "Update inventory item",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                nama_item: { type: "string" },
                kategori: { type: "string" },
                stok_saat_ini: { type: "number" },
                stok_maksimum: { type: "number" },
                stok_minimum: { type: "number" },
                satuan: { type: "string" },
                foto_inven: {
                  type: "string",
                  format: "binary",
                  description: "Optional inventory item photo upload",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Inventory item updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InventoryItemResponse" },
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
    delete: {
      tags: ["Admin Inventaris"],
      summary: "Delete inventory item",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Inventory item deleted successfully",
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
  "/admin/inventaris/{id}/add-stock": {
    post: {
      tags: ["Admin Inventaris"],
      summary: "Add stock to inventory item",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddStockRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Stock added successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InventoryItemResponse" },
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
