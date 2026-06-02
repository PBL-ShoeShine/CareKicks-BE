module.exports = {
  InventoryItem: {
    type: "object",
    properties: {
      id_inventory: { type: "integer" },
      id_shops: { type: "integer" },
      nama_item: { type: "string" },
      kategori: { type: "string", nullable: true },
      stok_saat_ini: { type: "number" },
      stok_maksimum: { type: "number" },
      stok_minimum: { type: "number" },
      satuan: { type: "string", nullable: true },
      foto_inven: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },
  InventorySummary: {
    type: "object",
    properties: {
      total_jenis: { type: "integer" },
      butuh_restock: { type: "integer" },
    },
  },
  InventoryListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/InventoryItem" },
      },
    },
    required: ["success", "message", "data"],
  },
  InventorySummaryResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/InventorySummary" },
    },
    required: ["success", "message", "data"],
  },
  InventoryItemResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { $ref: "#/components/schemas/InventoryItem" },
    },
    required: ["success", "message", "data"],
  },
  AddStockRequest: {
    type: "object",
    properties: {
      amount: { type: "number" },
    },
    required: ["amount"],
  },
};
