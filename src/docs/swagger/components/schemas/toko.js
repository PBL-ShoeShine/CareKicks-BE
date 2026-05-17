module.exports = {
  ShopProfile: {
    type: "object",
    properties: {
      id_shops: { type: "integer" },
      nm_toko: { type: "string" },
      desk_toko: { type: "string", nullable: true },
      alamat_toko: { type: "string", nullable: true },
      lat_toko: { type: "number", nullable: true },
      long_toko: { type: "number", nullable: true },
      foto_toko: { type: "string", nullable: true },
      spesialisasi: { type: "string", nullable: true },
      tgl_berdiri: { type: "string", format: "date", nullable: true },
      email_toko: { type: "string" },
      wa_toko: { type: "string", nullable: true },
    },
  },
  OperatingHour: {
    type: "object",
    properties: {
      id_shop_operating_hours: { type: "integer" },
      day_of_week: { type: "integer", description: "1 (Monday) to 7 (Sunday)" },
      day_name: { type: "string" },
      is_open: { type: "boolean" },
      open_time: { type: "string", example: "08:00:00", nullable: true },
      close_time: { type: "string", example: "20:00:00", nullable: true },
    },
  },
  ShopProfileResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/ShopProfile" },
    },
  },
  OperatingHoursResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/OperatingHour" },
      },
    },
  },
  UpdateOperatingHoursRequest: {
    type: "object",
    properties: {
      hours: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day_of_week: { type: "integer" },
            is_open: { type: "boolean" },
            open_time: { type: "string", example: "08:00", nullable: true },
            close_time: { type: "string", example: "20:00", nullable: true },
          },
          required: ["day_of_week", "is_open"],
        },
      },
    },
    required: ["hours"],
    example: {
      hours: [
        { "day_of_week": 1, "is_open": true, "open_time": "09:00", "close_time": "18:00" },
        { "day_of_week": 2, "is_open": true, "open_time": "09:00", "close_time": "18:00" },
        { "day_of_week": 3, "is_open": true, "open_time": "09:00", "close_time": "18:00" },
        { "day_of_week": 4, "is_open": true, "open_time": "09:00", "close_time": "18:00" },
        { "day_of_week": 5, "is_open": true, "open_time": "09:00", "close_time": "16:00" },
        { "day_of_week": 6, "is_open": true, "open_time": "10:00", "close_time": "15:00" },
        { "day_of_week": 7, "is_open": false, "open_time": null, "close_time": null }
      ]
    }
  },
};
