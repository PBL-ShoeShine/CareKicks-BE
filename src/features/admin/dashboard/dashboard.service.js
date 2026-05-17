const supabase = require("../../../core/config/supabase");

const ACTIVE_STATUSES = ["pending", "diproses", "pickup", "washing"];
const QUEUE_STATUSES = ["pending", "diproses", "washing"];

exports.getDashboardData = async (idUser, options = {}) => {
  const { status, search } = options;

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

  if (!shopData || !shopData.shops || shopData.shops.length === 0) {
    throw new Error("Toko tidak ditemukan untuk user ini");
  }

  const shop = shopData.shops[0];
  const idShops = shop.id_shops;

  // =========================
  // AMBIL SEMUA ORDER TOKO
  // =========================
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("id_orders, status_order")
    .eq("id_shops", idShops);

  if (ordersError) {
    throw ordersError;
  }

  const activeOrders = (ordersData || []).filter((order) =>
    ACTIVE_STATUSES.includes(order.status_order?.toLowerCase()),
  ).length;

  const queueCount = (ordersData || []).filter((order) =>
    QUEUE_STATUSES.includes(order.status_order?.toLowerCase()),
  ).length;

  // =========================
  // DEEP CLEANING AKTIF
  // =========================
  const { data: deepCleaningData, error: deepCleaningError } = await supabase
    .from("detail_orders")
    .select(
      `
      id_detail_orders,
      services (
        nama_layanan
      ),
      orders!inner (
        id_shops,
        status_order
      )
    `,
    )
    .eq("orders.id_shops", idShops);

  if (deepCleaningError) {
    throw deepCleaningError;
  }

  const deepCleaning = (deepCleaningData || []).filter((item) => {
    const statusOrder = item.orders?.status_order?.toLowerCase();
    const namaLayanan = item.services?.nama_layanan?.toLowerCase();

    return (
      ACTIVE_STATUSES.includes(statusOrder) && namaLayanan?.includes("deep")
    );
  }).length;

  // =========================
  // AKTIVITAS TERKINI
  // =========================
  let query = supabase
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
        kode_order,
        status_order,
        tgl_order,
        id_shops,

        customers (
          nama
        )
      )
    `,
    )
    .eq("orders.id_shops", idShops);

  if (status && status !== "all") {
    query = query.eq("orders.status_order", status.toLowerCase());
  }

  if (search) {
    query = query.or(`merk.ilike.%${search}%,jenis_sepatu.ilike.%${search}%`);
  }

  query = query.order("id_detail_orders", { ascending: false });

  const { data: activities, error: activityError } = await query;

  if (activityError) {
    throw activityError;
  }

  const filteredActivities = (activities || []).filter((item) =>
    ACTIVE_STATUSES.includes(item.orders?.status_order?.toLowerCase()),
  );

  return {
    shop: {
      id_shops: shop.id_shops,
      nama_toko: shop.nm_toko,
      saldo_toko: Number(shop.saldo_toko || 0),
    },

    summary: {
      pesanan_aktif: activeOrders,
      antrean_cuci: queueCount,
      deep_cleaning: deepCleaning,
    },

    aktivitas_terkini: filteredActivities.map((item) => ({
      id_detail_orders: item.id_detail_orders,
      id_orders: item.orders?.id_orders,
      kode_order: item.orders?.kode_order,
      nama_sepatu: `${item.merk || "-"} ${item.jenis_sepatu || "-"}`,
      warna: item.warna,
      layanan: item.services?.nama_layanan,
      customer: item.orders?.customers?.nama,
      status_order: item.orders?.status_order?.toLowerCase(),
      review: item.review,
      total_harga: Number(item.total_harga || 0),
      foto_sebelum: item.foto_sebelum,
      foto_sesudah: item.foto_sesudah,
      tanggal_order: item.orders?.tgl_order,
    })),
  };
};
