module.exports = {
  "/user/register": {
    post: {
      tags: ["User Auth"],
      summary: "Register user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthRegisterRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Register berhasil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
        400: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorMessageResponse" },
            },
          },
        },
      },
    },
  },
  "/user/login": {
    post: {
      tags: ["User Auth"],
      summary: "Login user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthLoginRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Login berhasil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
        400: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorMessageResponse" },
            },
          },
        },
      },
    },
  },
};
