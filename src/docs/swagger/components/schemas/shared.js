module.exports = {
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      error_code: { type: "string" },
    },
    required: ["success", "message"],
  },
  ErrorMessageResponse: {
    type: "object",
    properties: {
      message: { type: "string" },
    },
    required: ["message"],
  },
};
