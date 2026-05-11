const supabase = require("../../../core/config/supabase");

const SERVICE_SELECT =
  "id_services, nama_layanan, harga, estimasi_waktu, deskripsi, foto_layanan, is_active, id_shops";

exports.uploadServiceImage = async (file) => {
  if (!file) return null;

  try {
    // validasi mime type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error("Only JPG, PNG, and WEBP images are allowed");
    }

    // validasi ukuran file (maks 5MB)
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();

    const fileExtension = file.originalname.split(".").pop();

    const fileName = `service_${timestamp}_${randomStr}.${fileExtension}`;

    // upload ke supabase storage
    const { error } = await supabase.storage
      .from("services")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // ambil public url
    const { data: publicData } = supabase.storage
      .from("services")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (error) {
    console.error("Error uploading service image:", error);
    throw error;
  }
};

exports.deleteServiceImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    const fileName = imageUrl.split("/").pop();

    const { error } = await supabase.storage
      .from("services")
      .remove([fileName]);

    if (error) {
      console.error("Error deleting service image:", error);
    }
  } catch (error) {
    console.error("Error deleting service image:", error);
  }
};

exports.getServices = async (shopId, searchQuery = "", category = "") => {
  try {
    let query = supabase
      .from("services")
      .select(SERVICE_SELECT)
      .eq("id_shops", shopId);

    if (category && category !== "Semua") {
      query = query.ilike("estimasi_waktu", `%${category}%`);
    }

    if (searchQuery) {
      query = query.ilike("nama_layanan", `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error getting services:", error);
    throw error;
  }
};

exports.createService = async (shopId, serviceData) => {
  const { nama_layanan, harga, estimasi_waktu, deskripsi, foto_layanan } =
    serviceData;

  try {
    const { data, error } = await supabase
      .from("services")
      .insert({
        id_shops: shopId,
        nama_layanan,
        harga: Number(harga),
        estimasi_waktu,
        deskripsi,
        foto_layanan,
        is_active: true,
      })
      .select(SERVICE_SELECT)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

exports.updateServiceStatus = async (serviceId, shopId, isActive) => {
  try {
    const { data: existingService, error: fetchError } = await supabase
      .from("services")
      .select("id_services")
      .eq("id_services", serviceId)
      .eq("id_shops", shopId)
      .single();

    if (fetchError || !existingService) {
      throw new Error("Service not found or unauthorized");
    }

    const { data, error } = await supabase
      .from("services")
      .update({
        is_active: isActive,
      })
      .eq("id_services", serviceId)
      .eq("id_shops", shopId)
      .select(SERVICE_SELECT)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error updating service status:", error);
    throw error;
  }
};

exports.deleteService = async (serviceId, shopId) => {
  try {
    const { data: existingService, error: fetchError } = await supabase
      .from("services")
      .select("id_services, foto_layanan")
      .eq("id_services", serviceId)
      .eq("id_shops", shopId)
      .single();

    if (fetchError || !existingService) {
      throw new Error("Service not found or unauthorized");
    }

    // hapus gambar lama
    if (existingService.foto_layanan) {
      await exports.deleteServiceImage(existingService.foto_layanan);
    }

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id_services", serviceId)
      .eq("id_shops", shopId);

    if (error) throw error;

    return {
      success: true,
      message: "Service deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

exports.updateService = async (serviceId, shopId, serviceData) => {
  const { nama_layanan, harga, estimasi_waktu, deskripsi, foto_layanan } =
    serviceData;

  try {
    const { data: existingService, error: fetchError } = await supabase
      .from("services")
      .select("id_services")
      .eq("id_services", serviceId)
      .eq("id_shops", shopId)
      .single();

    if (fetchError || !existingService) {
      throw new Error("Service not found or unauthorized");
    }

    const updateData = {};

    if (nama_layanan !== undefined) updateData.nama_layanan = nama_layanan;

    if (harga !== undefined) updateData.harga = Number(harga);

    if (estimasi_waktu !== undefined)
      updateData.estimasi_waktu = estimasi_waktu;

    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;

    if (foto_layanan !== undefined) updateData.foto_layanan = foto_layanan;

    const { data, error } = await supabase
      .from("services")
      .update(updateData)
      .eq("id_services", serviceId)
      .eq("id_shops", shopId)
      .select(SERVICE_SELECT)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};
