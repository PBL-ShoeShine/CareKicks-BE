module.exports = {
  VerifyOldPasswordRequest: {
    type: "object",
    required: ["oldPassword"],
    properties: {
      oldPassword: { type: "string", format: "password" },
    },
    example: {
      oldPassword: "oldPassword123",
    },
  },

  VerifyOtpRequest: {
    type: "object",
    required: ["email", "otpCode"],
    properties: {
      email: { type: "string", format: "email" },
      otpCode: { type: "string" },
    },
    example: {
      email: "admin@carekicks.com",
      otpCode: "123456",
    },
  },

  ChangePasswordDirectRequest: {
    type: "object",
    required: ["oldPassword", "newPassword"],
    properties: {
      oldPassword: { type: "string", format: "password" },
      newPassword: { type: "string", format: "password" },
    },
    example: {
      oldPassword: "oldPassword123",
      newPassword: "newPassword123",
    },
  },

  RequestOtpRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" },
    },
    example: {
      email: "admin@carekicks.com",
    },
  },

  ChangePasswordOtpRequest: {
    type: "object",
    required: ["email", "otpCode", "newPassword"],
    properties: {
      email: { type: "string", format: "email" },
      otpCode: { type: "string" },
      newPassword: { type: "string", format: "password" },
    },
    example: {
      email: "admin@carekicks.com",
      otpCode: "123456",
      newPassword: "newPassword123",
    },
  },
};
