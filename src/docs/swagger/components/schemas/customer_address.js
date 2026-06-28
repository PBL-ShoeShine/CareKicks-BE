module.exports = {
  CustomerAddress: {
    type: "object",
    properties: {
      id_address: { type: "integer", example: 1 },
      id_user: { type: "integer", example: 1 },
      recipient_name: { type: "string", example: "Budi Santoso" },
      phone_number: { type: "string", example: "081234567890" },
      full_address: { type: "string", example: "Jl. Merdeka No. 10, Semarang" },
      address_label: { type: "string", example: "Rumah" },
      is_default: { type: "boolean", example: true },
      latitude: { type: "number", format: "float", example: -6.9824 },
      longitude: { type: "number", format: "float", example: 110.4323 },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },

  AddCustomerAddressRequest: {
    type: "object",
    required: ["recipient_name", "full_address"],
    properties: {
      recipient_name: { type: "string", example: "Budi Santoso" },
      phone_number: { type: "string", example: "081234567890" },
      full_address: { type: "string", example: "Jl. Merdeka No. 10, Semarang" },
      address_label: { type: "string", example: "Rumah" },
      is_default: { type: "boolean", example: false },
      latitude: { type: "number", format: "float", example: -6.9824 },
      longitude: { type: "number", format: "float", example: 110.4323 },
    },
  },

  UpdateCustomerAddressRequest: {
    type: "object",
    properties: {
      recipient_name: { type: "string", example: "Budi Santoso" },
      phone_number: { type: "string", example: "081234567890" },
      full_address: { type: "string", example: "Jl. Merdeka No. 10, Semarang" },
      address_label: { type: "string", example: "Kantor" },
      is_default: { type: "boolean", example: true },
      latitude: { type: "number", format: "float", example: -6.9824 },
      longitude: { type: "number", format: "float", example: 110.4323 },
    },
  },

  CustomerAddressListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/CustomerAddress" },
      },
    },
  },
};
