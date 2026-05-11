const inventarisService = require("./inventaris.service");
const supabase = require("../../../core/config/supabase");

// helper ambil shop id admin
const getShopIdByUser = async (userId) => {
  const { data, error } = await supabase
    .from("shops_admin")
    .select("id_shops")
    .eq("id_user", userId)
    .single();

  if (error || !data) {
    throw new Error("Shop not found for this admin user");
  }

  return data.id_shops;
};

exports.getInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search = "", category = "" } = req.query;

    const shopId = await getShopIdByUser(userId);

    const items = await inventarisService.getInventoryItems(
      shopId,
      search,
      category
    );

    return res.status(200).json({
      success: true,
      message: "Inventory items retrieved successfully",
      data: items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const shopId = await getShopIdByUser(userId);

    const summary = await inventarisService.getInventorySummary(shopId);

    return res.status(200).json({
      success: true,
      message: "Inventory summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const shopId = await getShopIdByUser(userId);

    const { nama_item, kategori, stok_saat_ini, stok_maksimum, stok_minimum, satuan } = req.body;

    if (!nama_item) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: nama_item",
      });
    }

    const newItem = await inventarisService.createInventoryItem(shopId, {
      nama_item,
      kategori,
      stok_saat_ini,
      stok_maksimum,
      stok_minimum,
      satuan
    });

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: newItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const shopId = await getShopIdByUser(userId);

    const updatedItem = await inventarisService.updateInventoryItem(id, shopId, req.body);

    return res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const shopId = await getShopIdByUser(userId);

    const result = await inventarisService.deleteInventoryItem(id, shopId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    const shopId = await getShopIdByUser(userId);

    const updatedItem = await inventarisService.addStock(id, shopId, amount);

    return res.status(200).json({
      success: true,
      message: "Stock added successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
