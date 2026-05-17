const supabase = require("../../../core/config/supabase");

const ORDER_STATUSES = ["pending", "diproses", "selesai"];
const QUEUE_STATUSES = ["pending", "diproses"];
const ACTIVITY_STATUSES = ["pending", "diproses", "selesai"];

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

  const shop = Array.isArray(shopData.shops)
    ? shopData.shops[0]
    : shopData.shops;
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

  // Jumlah Pesanan: pending + diproses + selesai
  const totalOrders = (ordersData || []).filter((order) =>
    ORDER_STATUSES.includes(order.status_order?.toLowerCase()),
  ).length;

  // Antrean Cucian: pending + diproses
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

  // Deep Cleaning aktif: pending + diproses
  const deepCleaning = (deepCleaningData || []).filter((item) => {
    const statusOrder = item.orders?.status_order?.toLowerCase();
    const namaLayanan = item.services?.nama_layanan?.toLowerCase();

    return (
      QUEUE_STATUSES.includes(statusOrder) && namaLayanan?.includes("deep")
    );
  }).length;

  // =========================
  // AKTIVITAS TERKINI / HISTORY
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

  if (search && search.trim() !== "") {
    const keyword = search.trim();
    query = query.or(`merk.ilike.%${keyword}%,jenis_sepatu.ilike.%${keyword}%`);
  }

  query = query.order("id_detail_orders", { ascending: false });

  const { data: activities, error: activityError } = await query;

  if (activityError) {
    throw activityError;
  }

  const filteredActivities = (activities || []).filter((item) => {
    const orderStatus = item.orders?.status_order?.toLowerCase();
    return ACTIVITY_STATUSES.includes(orderStatus);
  });

  return {
    shop: {
      id_shops: shop.id_shops,
      nama_toko: shop.nm_toko,
      saldo_toko: Number(shop.saldo_toko || 0),
    },

    summary: {
      pesanan_aktif: totalOrders,
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
