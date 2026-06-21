const { getCart, addToCart, updateCartItem, deleteCartItem } = require("./cart.service");
const supabase = require("../../../core/config/supabase");

// Helper untuk mendapatkan id_customers dari req.user.id
const getCustomerId = async (userId) => {
  const { data, error } = await supabase
    .from("customers")
    .select("id_customers")
    .eq("id_user", userId)
    .single();
  
  if (error || !data) throw new Error("Customer tidak ditemukan");
  return data.id_customers;
};

exports.getCartHandler = async (req, res) => {
  try {
    const id_customers = await getCustomerId(req.user.id);
    const cartData = await getCart(id_customers);

    res.status(200).json({
      success: true,
      data: cartData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data keranjang",
    });
  }
};

exports.addToCartHandler = async (req, res) => {
  try {
    const id_customers = await getCustomerId(req.user.id);
    const { 
      id_shops, 
      id_services, 
      harga_layanan, 
      catatan, 
      merk, 
      jenis_sepatu, 
      warna 
    } = req.body;

    if (!id_shops || !id_services || !harga_layanan) {
      return res.status(400).json({
        success: false,
        message: "id_shops, id_services, dan harga_layanan wajib diisi",
      });
    }

    const files = req.files;
    if (!files || files.length < 1 || files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Upload 1-5 foto kondisi sepatu",
      });
    }

    // Upload semua foto ke Supabase Storage (Bucket: services, Folder: orders/)
    const fotoUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.originalname.split(".").pop() || "jpg";
      const filePath = `orders/cart_${id_customers}_${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("services")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        throw new Error("Gagal mengunggah gambar ke-" + (i + 1) + ": " + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from("services")
        .getPublicUrl(filePath);

      fotoUrls.push(publicUrlData.publicUrl);
    }

    const newItem = await addToCart({
      id_customers,
      id_shops,
      id_services,
      harga_layanan,
      catatan,
      merk,
      jenis_sepatu,
      warna,
      foto_sebelum: JSON.stringify(fotoUrls),
    });

    res.status(201).json({
      success: true,
      message: "Berhasil menambahkan ke keranjang",
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Gagal menambahkan ke keranjang",
    });
  }
};

exports.updateCartItemHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID item keranjang wajib disertakan",
      });
    }

    const { catatan, merk, jenis_sepatu, warna, foto_indices } = req.body;
    const files = req.files;

    let foto_sebelum = undefined;
    if (files && files.length > 0) {
      const indices = foto_indices
        ? foto_indices.split(",").map(Number)
        : files.map((_, i) => i);

      const { data: existingItem, error: fetchError } = await supabase
        .from("cart_item")
        .select("foto_sebelum")
        .eq("id_cart_item", id)
        .single();

      if (fetchError) throw fetchError;

      let existingUrls = [];
      try {
        const parsed = JSON.parse(existingItem?.foto_sebelum || "[]");
        existingUrls = Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        existingUrls = [];
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.originalname.split(".").pop() || "jpg";
        const filePath = `orders/cart_${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("services")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (uploadError) {
          throw new Error("Gagal mengunggah gambar: " + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("services")
          .getPublicUrl(filePath);

        const targetIndex = indices[i];
        if (targetIndex >= 0 && targetIndex < 5) {
          existingUrls[targetIndex] = publicUrlData.publicUrl;
        } else {
          existingUrls.push(publicUrlData.publicUrl);
        }
      }

      foto_sebelum = JSON.stringify(existingUrls);
    }

    const updatedItem = await updateCartItem(id, {
      catatan,
      merk,
      jenis_sepatu,
      warna,
      foto_sebelum,
    });

    res.status(200).json({
      success: true,
      message: "Item keranjang berhasil diperbarui",
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Gagal memperbarui item keranjang",
    });
  }
};

exports.deleteCartItemHandler = async (req, res) => {
  try {
    const { id } = req.params; // id_cart_item

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID item keranjang wajib disertakan",
      });
    }

    await deleteCartItem(id);

    res.status(200).json({
      success: true,
      message: "Item berhasil dihapus dari keranjang",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Gagal menghapus item keranjang",
    });
  }
};
