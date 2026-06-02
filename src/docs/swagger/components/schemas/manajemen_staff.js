module.exports = {
  StaffItem: {
    type: "object",
    properties: {
      id_staff: { type: "integer" },
      email: { type: "string", format: "email" },
      role: {
        type: "string",
        enum: ["WASHER", "COURIER"],
      },
      status: {
        type: "string",
        enum: ["AKTIF", "CUTI", "NONAKTIF"],
      },
      id_shops: { type: "integer" },
      staff_profile: {
        type: "object",
        properties: {
          nama: { type: "string" },
          no_hp: { type: "string", nullable: true },
        },
      },
    },
  },

  StaffListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/StaffItem" },
      },
    },
    example: {
      success: true,
      data: [
        {
          id_staff: 1,
          email: "andi@carekicks.com",
          role: "STAFF",
          status: "AKTIF",
          id_shops: 2,
          staff_profile: { nama: "Andi", no_hp: "08123456789" },
        },
      ],
    },
  },

  StaffDetailResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { $ref: "#/components/schemas/StaffItem" },
    },
    example: {
      success: true,
      data: {
        id_staff: 1,
        email: "andi@carekicks.com",
        role: "STAFF",
        status: "AKTIF",
        id_shops: 2,
        staff_profile: { nama: "Andi", no_hp: "08123456789" },
      },
    },
  },

  StaffRegisterRequest: {
    type: "object",
    required: ["nama", "email", "password", "no_hp", "id_shops", "role"],
    properties: {
      nama: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", format: "password" },
      no_hp: { type: "string" },
      id_shops: { type: "integer" },
      role: {
        type: "string",
        enum: ["ADMIN", "STAFF"],
      },
    },
    example: {
      nama: "Andi",
      email: "andi@carekicks.com",
      password: "secret123",
      no_hp: "08123456789",
      id_shops: 2,
      role: "STAFF",
    },
  },

  StaffRegisterResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { $ref: "#/components/schemas/StaffItem" },
    },
    example: {
      success: true,
      data: {
        id_staff: 1,
        email: "andi@carekicks.com",
        role: "STAFF",
        status: "AKTIF",
        id_shops: 2,
        staff_profile: { nama: "Andi", no_hp: "08123456789" },
      },
    },
  },

  StaffUpdateRequest: {
    type: "object",
    properties: {
      nama: { type: "string" },
      no_hp: { type: "string" },
      role: {
        type: "string",
        enum: ["WASHER", "COURIER"],
      },
      status: {
        type: "string",
        enum: ["AKTIF", "CUTI", "NONAKTIF"],
      },
    },
    example: {
      nama: "Andi Updated",
      no_hp: "08199999999",
      role: "STAFF",
      status: "NONAKTIF",
    },
  },

  StaffUpdateResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/StaffItem" },
    },
    example: {
      success: true,
      message: "Berhasil update data staff",
      data: {
        id_staff: 1,
        email: "andi@carekicks.com",
        role: "STAFF",
        status: "NONAKTIF",
        id_shops: 2,
        staff_profile: { nama: "Andi Updated", no_hp: "08199999999" },
      },
    },
  },

  StaffDeleteResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
    },
    example: {
      success: true,
      message: "Staff berhasil dihapus",
    },
  },
};
