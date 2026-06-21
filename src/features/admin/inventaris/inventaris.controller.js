const inventarisService = require("./inventaris.service");
const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");

const getShopIdByUser = (authUser) => shopAccess.getShopIdForUser(authUser);

exports.getInventory = async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;

    const shopId = await getShopIdByUser(req.user);

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
    const shopId = await getShopIdByUser(req.user);

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
    const shopId = await getShopIdByUser(req.user);

    const { nama_item, kategori, stok_saat_ini, stok_maksimum, stok_minimum, satuan } = req.body;
    const file = req.file;

    if (!nama_item) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: nama_item",
      });
    }

    // upload foto jika ada
    let fotoUrl = null;
    if (file) {
      fotoUrl = await inventarisService.uploadInventoryImage(file);
    }

    const newItem = await inventarisService.createInventoryItem(shopId, {
      nama_item,
      kategori,
      stok_saat_ini,
      stok_maksimum,
      stok_minimum,
      satuan,
      foto_inven: fotoUrl
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
    const { id } = req.params;
    const { nama_item, kategori, stok_saat_ini, stok_maksimum, stok_minimum, satuan } = req.body;
    const file = req.file;
    const shopId = await getShopIdByUser(req.user);

    let fotoUrl = undefined;
    if (file) {
      // ambil gambar lama
      const { data: existing } = await supabase
        .from("inventory")
        .select("foto_inven")
        .eq("id_inventory", id)
        .eq("id_shops", shopId)
        .single();

      // hapus gambar lama
      if (existing?.foto_inven) {
        await inventarisService.deleteInventoryImage(existing.foto_inven);
      }

      // upload gambar baru
      fotoUrl = await inventarisService.uploadInventoryImage(file);
    }

    const updatedItem = await inventarisService.updateInventoryItem(id, shopId, {
      nama_item,
      kategori,
      stok_saat_ini,
      stok_maksimum,
      stok_minimum,
      satuan,
      foto_inven: fotoUrl
    });

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
    const { id } = req.params;
    const shopId = await getShopIdByUser(req.user);

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
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    const shopId = await getShopIdByUser(req.user);

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

exports.reduceStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    const shopId = await getShopIdByUser(req.user);

    const updatedItem = await inventarisService.reduceStock(id, shopId, amount);

    return res.status(200).json({
      success: true,
      message: "Stock reduced successfully",
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

