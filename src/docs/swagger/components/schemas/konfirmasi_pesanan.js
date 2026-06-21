module.exports = {
  ConfirmActionRequest: {
    type: "object",
    required: ["action"],
    properties: {
      action: {
        type: "string",
        enum: ["approve", "reject"],
        description: "Action to take on the order or payment",
      },
      reason: {
        type: "string",
        description: "Reason for rejection (mandatory if action is reject)",
      },
    },
    example: {
      action: "approve",
    },
  },

  KonfirmasiPesananResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/AntreanItem" },
      },
    },
  },
};
