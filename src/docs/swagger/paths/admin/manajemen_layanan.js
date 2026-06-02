module.exports = {
  "/admin/manajemen_layanan": {
    get: {
      tags: ["Admin Manajemen Layanan"],
      summary: "Get all services",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "search",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Search services by name",
        },
        // {
        //   name: "category",
        //   in: "query",
        //   required: false,
        //   schema: { type: "string" },
        //   description: "Filter by category",
        // },
      ],
      responses: {
        200: {
          description: "Services retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ServicesListResponse" },
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
    post: {
      tags: ["Admin Manajemen Layanan"],
      summary: "Create a new service",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/CreateServiceRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Service created successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ServiceManagementResponse",
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
      },
    },
  },
  "/admin/manajemen_layanan/{id}": {
    patch: {
      tags: ["Admin Manajemen Layanan"],
      summary: "Update service details",
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
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/UpdateServiceRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Service updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ServiceManagementResponse",
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
        404: {
          description: "Service not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Admin Manajemen Layanan"],
      summary: "Delete service",
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
          description: "Service deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "Service not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/admin/manajemen_layanan/{id}/status": {
    patch: {
      tags: ["Admin Manajemen Layanan"],
      summary: "Toggle service status (active/inactive)",
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
            schema: { $ref: "#/components/schemas/UpdateServiceStatusRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Service status updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ServiceManagementResponse",
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
        404: {
          description: "Service not found",
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
