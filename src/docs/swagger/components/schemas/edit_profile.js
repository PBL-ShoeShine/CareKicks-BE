module.exports = {
  EditProfileResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { $ref: "#/components/schemas/User" },
    },
    example: {
      success: true,
      data: {
        id_user: 1,
        username: "admin123",
        nama: "Admin CareKicks",
        email: "admin@carekicks.com",
        no_hp: "08123456789",
        jenis_role: "ADMIN",
        path_gambar: "https://example.com/profile.jpg",
      },
    },
  },

  UpdateProfileRequest: {
    type: "object",
    properties: {
      nama: { type: "string" },
      noHp: { type: "string" },
      email: { type: "string", format: "email" },
      password: { 
        type: "string", 
        description: "Required if updating noHp or sensitive data" 
      },
      isRequestEmailOnly: { 
        type: "boolean",
        description: "Set to true if only requesting email change"
      },
    },
    example: {
      nama: "Admin Baru",
      noHp: "08987654321",
      password: "password123",
    },
  },

  UpdateProfileResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      isWaitingVerification: { 
        type: "boolean",
        description: "True if email change verification was sent"
      },
    },
    example: {
      success: true,
      message: "Perubahan profil berhasil disimpan.",
    },
  },

  ChangePasswordRequest: {
    type: "object",
    required: ["oldPassword", "newPassword"],
    properties: {
      oldPassword: { type: "string", format: "password" },
      newPassword: { type: "string", format: "password" },
    },
    example: {
      oldPassword: "oldPassword123",
      newPassword: "newPassword456",
    },
  },
};
