const customerProfileSchemas = {
  CustomerProfile: {
    type: "object",
    properties: {
      id_user: { type: "integer" },
      nama: { type: "string" },
      email: { type: "string", format: "email" },
      no_hp: { type: "string" },
      path_gambar: { type: "string", nullable: true },
      gender: { type: "string", enum: ["L", "P"], nullable: true },
      birthday: { type: "string", format: "date", nullable: true },
    },
  },

  CustomerProfileResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { $ref: "#/components/schemas/CustomerProfile" },
    },
    example: {
      success: true,
      data: {
        id_user: 33,
        nama: "Budi Santoso",
        email: "budi@example.com",
        no_hp: "08123456789",
        path_gambar: "https://example.com/profiles/33.jpg",
        gender: "L",
        birthday: "1995-05-15",
      },
    },
  },

  UpdateCustomerProfileRequest: {
    type: "object",
    properties: {
      nama: { type: "string" },
      gender: { type: "string", enum: ["L", "P"] },
      birthday: { type: "string", format: "date" },
    },
    example: {
      nama: "Budi Santoso Updated",
      gender: "L",
      birthday: "1995-05-20",
    },
  },

  UpdateCustomerNoHpRequest: {
    type: "object",
    required: ["no_hp", "password"],
    properties: {
      no_hp: { type: "string" },
      password: { type: "string", format: "password" },
    },
    example: {
      no_hp: "08987654321",
      password: "password123",
    },
  },

  CustomerRequestEmailChangeRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" },
    },
    example: {
      email: "newemail@example.com",
    },
  },

  CustomerAddress: {
    type: "object",
    properties: {
      id_address: { type: "integer" },
      id_user: { type: "integer" },
      recipient_name: { type: "string" },
      phone_number: { type: "string", nullable: true },
      full_address: { type: "string" },
      address_label: { type: "string", nullable: true },
      is_default: { type: "boolean" },
      latitude: { type: "number", nullable: true },
      longitude: { type: "number", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },

  AddCustomerAddressRequest: {
    type: "object",
    required: ["recipient_name", "full_address"],
    properties: {
      recipient_name: { type: "string" },
      phone_number: { type: "string" },
      full_address: { type: "string" },
      address_label: { type: "string" },
      is_default: { type: "boolean" },
      latitude: { type: "number" },
      longitude: { type: "number" },
    },
    example: {
      recipient_name: "Budi Santoso",
      phone_number: "08123456789",
      full_address: "Jl. Merdeka No. 123, Jakarta",
      address_label: "Rumah",
      is_default: true,
      latitude: -6.2,
      longitude: 106.8,
    },
  },

  UpdateCustomerAddressRequest: {
    type: "object",
    properties: {
      recipient_name: { type: "string" },
      phone_number: { type: "string" },
      full_address: { type: "string" },
      address_label: { type: "string" },
      is_default: { type: "boolean" },
      latitude: { type: "number" },
      longitude: { type: "number" },
    },
  },

  CustomerAddressListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/CustomerAddress" },
      },
    },
  },

  CustomerAddressResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/CustomerAddress" },
    },
  },

  CustomerVerifyOldPasswordRequest: {
    type: "object",
    required: ["old_password"],
    properties: {
      old_password: { type: "string", format: "password" },
    },
    example: {
      old_password: "oldPassword123",
    },
  },

  CustomerChangePasswordDirectRequest: {
    type: "object",
    required: ["old_password", "new_password"],
    properties: {
      old_password: { type: "string", format: "password" },
      new_password: { type: "string", format: "password" },
    },
    example: {
      old_password: "oldPassword123",
      new_password: "newPassword123",
    },
  },

  CustomerVerifyOtpRequest: {
    type: "object",
    required: ["otp"],
    properties: {
      otp: { type: "string" },
    },
    example: {
      otp: "123456",
    },
  },

  CustomerChangePasswordOtpRequest: {
    type: "object",
    required: ["otp", "new_password"],
    properties: {
      otp: { type: "string" },
      new_password: { type: "string", format: "password" },
    },
    example: {
      otp: "123456",
      new_password: "newPassword123",
    },
  },
};

module.exports = customerProfileSchemas;
