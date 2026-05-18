module.exports = {
  "/admin/dashboard": {
    get: {
      tags: ["Admin Dashboard"],
      summary: "Get dashboard data",
      security: [{ bearerAuth: [] }],
      parameters: [
        // {
        //   name: "id_shops",
        //   in: "query",
        //   required: true,
        //   schema: { type: "integer" },
        //   description: "ID of the shop",
        // },
        // {
        //   name: "id_staff",
        //   in: "query",
        //   required: false,
        //   schema: { type: "integer" },
        //   description: "ID of the staff (optional)",
        // },
      ],
      responses: {
        200: {
          description: "Dashboard data retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DashboardResponse" },
            },
          },
        },
        400: {
          description: "Bad request - Missing parameters",
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
          description: "Internal server error",
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
