const customerProfilePaths = {
  "/customer/profile": {
    get: {
      tags: ["Customer - Profile"],
      summary: "Get customer profile data",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Profile data retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerProfileResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
    put: {
      tags: ["Customer - Profile"],
      summary: "Update customer profile (name, gender, birthday)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCustomerProfileRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/customer/profile/picture": {
    put: {
      tags: ["Customer - Profile"],
      summary: "Update customer profile picture",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                image: {
                  type: "string",
                  format: "binary",
                  description: "Profile picture file",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile picture updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  url: { type: "string" },
                },
              },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/customer/profile/request-email-change": {
    post: {
      tags: ["Customer - Profile"],
      summary: "Request email change",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerRequestEmailChangeRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Verification link sent to new email",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      isWaitingVerification: { type: "boolean" },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/customer/profile/phone": {
    put: {
      tags: ["Customer - Profile"],
      summary: "Update customer phone number",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCustomerNoHpRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Phone number updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/customer/profile/verify-old-password": {
    post: {
      tags: ["Customer - Profile"],
      summary: "Verify old password",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerVerifyOldPasswordRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Old password matches",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/customer/profile/change-password-direct": {
    put: {
      tags: ["Customer - Profile"],
      summary: "Change password directly",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerChangePasswordDirectRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Password changed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/customer/profile/request-otp": {
    post: {
      tags: ["Customer - Profile"],
      summary: "Request OTP for password change",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "OTP sent successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/customer/profile/verify-otp": {
    post: {
      tags: ["Customer - Profile"],
      summary: "Verify OTP code",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerVerifyOtpRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "OTP is valid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/customer/profile/change-password-otp": {
    put: {
      tags: ["Customer - Profile"],
      summary: "Change password using OTP",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerChangePasswordOtpRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Password changed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },
};

module.exports = customerProfilePaths;
