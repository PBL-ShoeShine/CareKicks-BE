module.exports = {
  CustomerProfileData: {
    type: "object",
    properties: {
      id_user: { type: "integer", example: 1 },
      nama: { type: "string", example: "Budi Santoso" },
      email: { type: "string", format: "email", example: "budi@mail.com" },
      no_hp: { type: "string", example: "081234567890" },
      path_gambar: { type: "string", nullable: true, example: "https://.../profile.jpg" },
      gender: { type: "string", enum: ["L", "P"], nullable: true, example: "L" },
      birthday: { type: "string", format: "date", nullable: true, example: "1995-05-20" },
    },
  },

  CustomerProfileResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/CustomerProfileData" },
    },
  },

  UpdateCustomerProfileRequest: {
    type: "object",
    properties: {
      nama: { type: "string", example: "Budi Santoso" },
      gender: { type: "string", enum: ["L", "P"], example: "L" },
      birthday: { type: "string", format: "date", example: "1995-05-20" },
    },
  },

  RequestEmailChangeRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email", example: "budi_baru@mail.com" },
    },
  },

  UpdateCustomerPhoneRequest: {
    type: "object",
    required: ["no_hp", "password"],
    properties: {
      no_hp: { type: "string", example: "089876543210" },
      password: { type: "string", format: "password", example: "password123" },
    },
  },
};
