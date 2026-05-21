module.exports = {
  "/admin/profile": {
    get: {
      tags: ["Admin Profile"],
      summary: "Get admin profile data",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Profile data retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EditProfileResponse" },
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
    put: {
      tags: ["Admin Profile"],
      summary: "Update admin profile (name, phone, or email change request)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileResponse" },
            },
          },
        },
        400: {
          description: "Bad request - validation error or wrong password",
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

  "/admin/profile/change-password": {
    put: {
      tags: ["Admin Profile"],
      summary: "Change admin password",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
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
        400: {
          description: "Bad request - validation error or wrong old password",
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
      },
    },
  },

  "/auth/verify-email": {
    get: {
      tags: ["User Auth"],
      summary: "Verify email change from token",
      parameters: [
        {
          name: "token",
          in: "query",
          required: true,
          schema: { type: "string" },
          description: "The verification token sent to the new email",
        },
      ],
      responses: {
        200: {
          description: "Email verified successfully (returns HTML message)",
        },
        400: {
          description: "Invalid or expired token",
        },
        500: {
          description: "Internal server error",
        },
      },
    },
  },
};
