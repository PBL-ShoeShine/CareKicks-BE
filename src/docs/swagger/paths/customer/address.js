const customerAddressPaths = {
  "/customer/addresses": {
    get: {
      tags: ["Customer - Address"],
      summary: "Get all customer addresses",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Addresses retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerAddressListResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
    post: {
      tags: ["Customer - Address"],
      summary: "Add a new customer address",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddCustomerAddressRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Address added successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerAddressResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/customer/addresses/{id_address}": {
    put: {
      tags: ["Customer - Address"],
      summary: "Update an existing address",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_address",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCustomerAddressRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Address updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerAddressResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
    delete: {
      tags: ["Customer - Address"],
      summary: "Delete an address",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_address",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Address deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/customer/addresses/{id_address}/default": {
    patch: {
      tags: ["Customer - Address"],
      summary: "Set an address as default",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_address",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Default address changed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
  },
};

module.exports = customerAddressPaths;
