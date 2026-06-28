const supabase = require("../../../core/config/supabase");

exports.getStores = async ({ search = "", page = 1, limit = 10, status = "" } = {}) => {
  try {
    let query = supabase
      .from("shops")
      .select(`
        id_shops,
        nm_toko,
        desk_toko,
        alamat_toko,
        foto_toko,
        foto_ktp,
        spesialisasi,
        tgl_berdiri,
        jam_buka,
        jam_tutup,
        saldo_toko,
        status_verifikasi,
        upload_qris,
        alasan_penangguhan,
        shops_admin (
          id_shops_admin,
          users (
            id_user,
            nama,
            email,
            no_hp
          )
        )
      `, { count: "exact" });

    if (search) {
      query = query.ilike("nm_toko", `%${search}%`);
    }

    if (status) {
      query = query.eq("status_verifikasi", status);
    }

    const offset = (page - 1) * limit;
    const { data: shopsRaw, count: total, error } = await query
      .range(offset, offset + limit - 1)
      .order("nm_toko", { ascending: true });

    if (error) throw error;

    // Get statistics
    const { count: totalShops, error: totalErr } = await supabase
      .from("shops")
      .select("id_shops", { count: "exact", head: true });
    if (totalErr) throw totalErr;

    const { count: activeShops, error: activeErr } = await supabase
      .from("shops")
      .select("id_shops", { count: "exact", head: true })
      .in("status_verifikasi", ["approved", "verified"]);
    if (activeErr) throw activeErr;

    const shops = (shopsRaw || []).map(shop => {
      const ownerUser = shop.shops_admin?.users;
      return {
        id_shops: shop.id_shops,
        nm_toko: shop.nm_toko,
        store_code: `SHP-${String(shop.id_shops).padStart(3, '0')}`,
        alamat_toko: shop.alamat_toko,
        spesialisasi: shop.spesialisasi,
        status_verifikasi: shop.status_verifikasi,
        alasan_penangguhan: shop.alasan_penangguhan,
        foto_toko: shop.foto_toko,
        foto_ktp: shop.foto_ktp,
        upload_qris: shop.upload_qris,
        saldo_toko: shop.saldo_toko,
        owner: ownerUser ? {
          nama: ownerUser.nama,
          email: ownerUser.email,
          no_hp: ownerUser.no_hp
        } : null
      };
    });

    const totalPages = Math.ceil((total || 0) / limit);

    return {
      shops,
      stats: {
        total_toko: totalShops || 0,
        toko_aktif: activeShops || 0
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: total || 0,
        totalPages: totalPages || 1
      }
    };
  } catch (error) {
    console.error("Error in getStores service:", error);
    throw error;
  }
};

exports.getStoreDetail = async (id) => {
  try {
    const { data: shop, error } = await supabase
      .from("shops")
      .select(`
        id_shops,
        nm_toko,
        desk_toko,
        alamat_toko,
        foto_toko,
        foto_ktp,
        spesialisasi,
        tgl_berdiri,
        jam_buka,
        jam_tutup,
        saldo_toko,
        status_verifikasi,
        upload_qris,
        alasan_penangguhan,
        shops_admin (
          id_shops_admin,
          users (
            id_user,
            nama,
            email,
            no_hp
          )
        )
      `)
      .eq("id_shops", id)
      .single();

    if (error) throw error;
    if (!shop) return null;

    // Fetch services
    const { data: services, error: errServices } = await supabase
      .from("services")
      .select("*")
      .eq("id_shops", id);
    if (errServices) throw errServices;

    // Fetch orders
    const { data: orders, error: errOrders } = await supabase
      .from("orders")
      .select("*")
      .eq("id_shops", id)
      .order("tgl_order", { ascending: false });
    if (errOrders) throw errOrders;

    const ownerUser = shop.shops_admin?.users;

    return {
      id_shops: shop.id_shops,
      nm_toko: shop.nm_toko,
      desk_toko: shop.desk_toko,
      alamat_toko: shop.alamat_toko,
      foto_toko: shop.foto_toko,
      foto_ktp: shop.foto_ktp,
      spesialisasi: shop.spesialisasi,
      tgl_berdiri: shop.tgl_berdiri,
      jam_buka: shop.jam_buka,
      jam_tutup: shop.jam_tutup,
      saldo_toko: shop.saldo_toko,
      status_verifikasi: shop.status_verifikasi,
      alasan_penangguhan: shop.alasan_penangguhan,
      upload_qris: shop.upload_qris,
      store_code: `SHP-${String(shop.id_shops).padStart(3, '0')}`,
      owner: ownerUser ? {
        nama: ownerUser.nama,
        email: ownerUser.email,
        no_hp: ownerUser.no_hp
      } : null,
      services: (services || []).map(s => ({
        id_services: s.id_services,
        nama_layanan: s.nama_layanan,
        harga: s.harga,
        estimasi_waktu: s.estimasi_waktu,
        is_active: s.is_active
      })),
      orders: (orders || []).map(o => ({
        id_orders: o.id_orders,
        kode_order: o.kode_order,
        tgl_order: o.tgl_order,
        status_order: o.status_order,
        status_pembayaran: o.status_pembayaran,
        metode_bayar: o.metode_bayar
      }))
    };
  } catch (error) {
    console.error("Error in getStoreDetail service:", error);
    throw error;
  }
};

exports.verifyStore = async (id, { status_verifikasi, alasan_penangguhan }) => {
  try {
    const updatePayload = { status_verifikasi };

    // Preserve alasan_penangguhan for rejected and suspended statuses
    if (status_verifikasi === "rejected" || status_verifikasi === "suspended") {
      updatePayload.alasan_penangguhan = alasan_penangguhan || null;
    } else if (status_verifikasi === "approved") {
      // Clear suspension reason when re-approving
      updatePayload.alasan_penangguhan = null;
    }

    // Step 1: Update the shop status
    const { data, error } = await supabase
      .from("shops")
      .update(updatePayload)
      .eq("id_shops", id)
      .select()
      .single();

    if (error) throw error;

    // Step 2: Fetch the shops_admin record to get the user ID for role management
    let userId = null;
    let shopsAdminId = null;
    if (data.id_shops_admin) {
      const { data: adminData } = await supabase
        .from("shops_admin")
        .select("id_shops_admin, id_user")
        .eq("id_shops_admin", data.id_shops_admin)
        .maybeSingle();

      if (adminData) {
        userId = adminData.id_user;
        shopsAdminId = adminData.id_shops_admin;
      }
    }

    // Step 3: Handle role lifecycle based on new status
    if (status_verifikasi === "approved" && userId) {
      // Upgrade user role to shops_admin when store is approved
      await supabase
        .from("users")
        .update({ jenis_role: "shops_admin" })
        .eq("id_user", userId);
    }

    if (status_verifikasi === "rejected" && userId) {
      // Reset user role back to customer and clean up shop + shops_admin records
      await supabase
        .from("users")
        .update({ jenis_role: "customer" })
        .eq("id_user", userId);

      // Delete the shop and shops_admin records so customer can re-register
      await supabase.from("shops").delete().eq("id_shops", id);
      if (shopsAdminId) {
        await supabase.from("shops_admin").delete().eq("id_shops_admin", shopsAdminId);
      }
    }

    return data;
  } catch (error) {
    console.error("Error in verifyStore service:", error);
    throw error;
  }
};

