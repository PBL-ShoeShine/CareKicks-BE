module.exports = {
  User: {
    type: "object",
    properties: {
      id_user: { type: "integer" },
      username: { type: "string" },
      password: {
        type: "string",
        description: "Hashed password stored in DB.",
      },
      jenis_role: { type: "string" },
      path_gambar: { type: "string", nullable: true },
      no_hp: { type: "string", nullable: true },
      nama: { type: "string", nullable: true },
      email: { type: "string", nullable: true },
    },
  },
  AuthRegisterRequest: {
    type: "object",
    properties: {
      nama: { type: "string" },
      no_hp: { type: "string" },
      email: { type: "string" },
      password: { type: "string" },
    },
    required: ["email", "password"],
  },
  AuthLoginRequest: {
    type: "object",
    properties: {
      email: { type: "string" },
      password: { type: "string" },
    },
    required: ["email", "password"],
  },
  AuthResponse: {
    type: "object",
    properties: {
      message: { type: "string" },
      token: { type: "string" },
      user: { $ref: "#/components/schemas/User" },
    },
    required: ["message", "token", "user"],
  },
};
