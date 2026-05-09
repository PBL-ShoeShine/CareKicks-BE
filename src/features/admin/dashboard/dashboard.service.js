const supabase = require("../../../core/config/supabase");

exports.getDashboardData = async (idUser) => {
  // =========================
  // GET SHOP
  // =========================
  const { data: shopData, error: shopError } = await supabase
    .from("shops_admin")
    .select(
      `
      id_shops_admin,
      shops (
        id_shops,
        nm_toko,
        saldo_toko
      )
    `,
    )
    .eq("id_user", idUser)
    .single();

  if (shopError) {
    throw shopError;
  }

  const shop = shopData.shops[0];
  const idShops = shop.id_shops;

  // =========================
  // PESANAN AKTIF
  // =========================
  const { count: activeOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("id_shops", idShops)
    .in("status_order", ["pending", "diproses", "pickup", "washing"]);

  // =========================
  // ANTRIAN CUCI
  // =========================
  const { count: queueCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("id_shops", idShops)
    .in("status_order", ["pending", "diproses", "washing"]);

  // =========================
  // DEEP CLEANING
  // =========================
  const { data: deepCleaningData } = await supabase
    .from("detail_orders")
    .select(
      `
      id_detail_orders,
      services (
        nama_layanan
      ),
      orders!inner (
        id_shops
      )
    `,
    )
    .eq("orders.id_shops", idShops);

  const deepCleaning =
    deepCleaningData?.filter((item) =>
      item.services?.nama_layanan?.toLowerCase().includes("deep"),
    ).length || 0;

  // =========================
  // AKTIVITAS TERKINI
  // =========================
  const { data: activities, error: activityError } = await supabase
    .from("detail_orders")
    .select(
      `
      id_detail_orders,
      merk,
      jenis_sepatu,
      warna,
      review,
      foto_sebelum,
      foto_sesudah,
      total_harga,

      services (
        nama_layanan
      ),

      orders!inner (
        id_orders,
        status_order,
        tgl_order,
        id_shops,

        customers (
          nama
        )
      )
    `,
    )
    .eq("orders.id_shops", idShops)
    .order("id_detail_orders", { ascending: false })
    .limit(5);

  if (activityError) {
    throw activityError;
  }

  return {
    shop: {
      id_shops: shop.id_shops,
      nama_toko: shop.nm_toko,
      saldo_toko: shop.saldo_toko,
    },

    summary: {
      pesanan_aktif: activeOrders || 0,
      antrean_cuci: queueCount || 0,
      deep_cleaning: deepCleaning,
    },

    aktivitas_terkini: activities.map((item) => ({
      id_detail_orders: item.id_detail_orders,
      nama_sepatu: `${item.merk} ${item.jenis_sepatu}`,
      warna: item.warna,
      layanan: item.services?.nama_layanan,
      customer: item.orders?.customers?.nama,
      status_order: item.orders?.status_order,
      review: item.review,
      total_harga: item.total_harga,
      foto_sebelum: item.foto_sebelum,
      foto_sesudah: item.foto_sesudah,
      tanggal_order: item.orders?.tgl_order,
    })),
  };
};
