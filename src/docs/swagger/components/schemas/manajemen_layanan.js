module.exports = {
  ServiceManagement: {
    type: "object",
    properties: {
      id_services: { type: "integer" },
      id_shops: { type: "integer" },
      nama_layanan: { type: "string" },
      harga: { type: "number" },
      estimasi_waktu: { type: "string" },
      deskripsi: { type: "string", nullable: true },
      foto_layanan: { type: "string", nullable: true },
      is_active: { type: "boolean" },
    },
  },
  ServiceManagementResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/ServiceManagement" },
    },
  },
  ServicesListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/ServiceManagement" },
      },
    },
  },
  CreateServiceRequest: {
    type: "object",
    required: ["nama_layanan", "harga", "estimasi_waktu"],
    properties: {
      nama_layanan: { type: "string" },
      harga: { type: "number" },
      estimasi_waktu: { type: "string" },
      deskripsi: { type: "string" },
      foto: {
        type: "string",
        format: "binary",
        description: "Service photo file",
      },
    },
  },
  UpdateServiceRequest: {
    type: "object",
    properties: {
      nama_layanan: { type: "string" },
      harga: { type: "number" },
      estimasi_waktu: { type: "string" },
      deskripsi: { type: "string" },
      foto: {
        type: "string",
        format: "binary",
        description: "Service photo file",
      },
    },
  },
  UpdateServiceStatusRequest: {
    type: "object",
    required: ["is_active"],
    properties: {
      is_active: { type: "boolean" },
    },
  },
};
