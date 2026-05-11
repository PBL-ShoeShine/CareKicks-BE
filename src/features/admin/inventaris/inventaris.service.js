const supabase = require("../../../core/config/supabase");

const INVENTORY_SELECT = "id_inventory, id_shops, nama_item, kategori, stok_saat_ini, stok_maksimum, stok_minimum, satuan, created_at, updated_at";

exports.getInventoryItems = async (shopId, search = "", category = "") => {
  try {
    let query = supabase
      .from("inventory")
      .select(INVENTORY_SELECT)
      .eq("id_shops", shopId)
      .order("nama_item", { ascending: true });

    if (search) {
      query = query.ilike("nama_item", `%${search}%`);
    }

    if (category && category !== "Semua") {
      query = query.eq("kategori", category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error in getInventoryItems:", error);
    throw error;
  }
};

exports.getInventorySummary = async (shopId) => {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select("id_inventory, stok_saat_ini, stok_minimum")
      .eq("id_shops", shopId);

    if (error) throw error;

    const totalJenis = data.length;
    const butuhRestock = data.filter(item => Number(item.stok_saat_ini) <= Number(item.stok_minimum)).length;

    return {
      total_jenis: totalJenis,
      butuh_restock: butuhRestock
    };
  } catch (error) {
    console.error("Error in getInventorySummary:", error);
    throw error;
  }
};

exports.createInventoryItem = async (shopId, itemData) => {
  try {
    const { nama_item, kategori, stok_saat_ini, stok_maksimum, stok_minimum, satuan } = itemData;

    const { data, error } = await supabase
      .from("inventory")
      .insert({
        id_shops: shopId,
        nama_item,
        kategori,
        stok_saat_ini: Number(stok_saat_ini) || 0,
        stok_maksimum: Number(stok_maksimum) || 0,
        stok_minimum: Number(stok_minimum) || 0,
        satuan
      })
      .select(INVENTORY_SELECT)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error in createInventoryItem:", error);
    throw error;
  }
};

exports.updateInventoryItem = async (id, shopId, itemData) => {
  try {
    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from("inventory")
      .select("id_inventory")
      .eq("id_inventory", id)
      .eq("id_shops", shopId)
      .single();

    if (checkError || !existing) {
      throw new Error("Inventory item not found or unauthorized");
    }

    const { nama_item, kategori, stok_saat_ini, stok_maksimum, stok_minimum, satuan } = itemData;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (nama_item !== undefined) updateData.nama_item = nama_item;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (stok_saat_ini !== undefined) updateData.stok_saat_ini = Number(stok_saat_ini);
    if (stok_maksimum !== undefined) updateData.stok_maksimum = Number(stok_maksimum);
    if (stok_minimum !== undefined) updateData.stok_minimum = Number(stok_minimum);
    if (satuan !== undefined) updateData.satuan = satuan;

    const { data, error } = await supabase
      .from("inventory")
      .update(updateData)
      .eq("id_inventory", id)
      .eq("id_shops", shopId)
      .select(INVENTORY_SELECT)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error in updateInventoryItem:", error);
    throw error;
  }
};

exports.deleteInventoryItem = async (id, shopId) => {
  try {
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("id_inventory", id)
      .eq("id_shops", shopId);

    if (error) throw error;

    return { success: true, message: "Inventory item deleted successfully" };
  } catch (error) {
    console.error("Error in deleteInventoryItem:", error);
    throw error;
  }
};

exports.addStock = async (id, shopId, amount) => {
  try {
    // Get current stock
    const { data: existing, error: fetchError } = await supabase
      .from("inventory")
      .select("stok_saat_ini")
      .eq("id_inventory", id)
      .eq("id_shops", shopId)
      .single();

    if (fetchError || !existing) {
      throw new Error("Inventory item not found or unauthorized");
    }

    const newStock = Number(existing.stok_saat_ini) + Number(amount);

    const { data, error } = await supabase
      .from("inventory")
      .update({ 
        stok_saat_ini: newStock,
        updated_at: new Date().toISOString()
      })
      .eq("id_inventory", id)
      .eq("id_shops", shopId)
      .select(INVENTORY_SELECT)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error in addStock:", error);
    throw error;
  }
};
