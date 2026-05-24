const customerOrderSchemas = {
  Order: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      },
      order_number: { type: "string", example: "SS-2024-0891" },
      customer_id: { type: "string", format: "uuid" },
      service_type: { type: "string", example: "Deep Clean" },
      status: {
        type: "string",
        enum: ["menunggu", "di_proses", "selesai"],
        example: "selesai",
      },
      date: { type: "string", format: "date", example: "2015-01-16" },
      address: { type: "string", example: "Jalan Tembalang, Mulawarman 5" },
      total_price: { type: "integer", example: 12000 },
      created_at: { type: "string", format: "date-time" },
    },
  },

  OrderItem: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      order_id: { type: "string", format: "uuid" },
      product_name: {
        type: "string",
        example: "Nike Air Zoom Pegasus 36 Miami",
      },
      product_image_url: {
        type: "string",
        example: "https://example.com/image.jpg",
      },
      quantity: { type: "integer", example: 3 },
      price: { type: "integer", example: 10000 },
    },
  },
};

module.exports = customerOrderSchemas;
