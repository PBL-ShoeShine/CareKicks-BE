const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");

const ORDER_STATUSES = ["pending", "diproses", "selesai"];
const QUEUE_STATUSES = ["pending", "diproses"];
const ACTIVITY_STATUSES = ["pending", "diproses", "selesai"];

exports.getDashboardData = async (authUser, options = {}) => {
  const { status, search, limit } = options;

  const access = await shopAccess.getShopForUser(authUser);
  const shop = access.shop || { id_shops: access.id_shops };
  const idShops = access.id_shops;

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
  const normalizedStatus = status?.toLowerCase();
  let query = supabase
    .from("orders")
    .select(
      `
      id_orders,
      kode_order,
      status_order,
      tgl_order,
      id_shops,

      customers (
        nama
      ),

      detail_orders (
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
        )
      )
    `,
    )
    .eq("id_shops", idShops)
    .in("status_order", ACTIVITY_STATUSES);

  if (normalizedStatus && normalizedStatus !== "all") {
    query = query.eq("status_order", normalizedStatus);
  }

  query = query.order("tgl_order", { ascending: false });

  const { data: activities, error: activityError } = await query;

  if (activityError) {
    throw activityError;
  }

  const keyword = search?.trim().toLowerCase();
  const activityRows = (activities || []).flatMap((order) => {
    const details = Array.isArray(order.detail_orders)
      ? order.detail_orders
      : [];

    if (details.length === 0) {
      if (keyword) return [];

      return [
        {
          id_detail_orders: null,
          id_orders: order.id_orders,
          kode_order: order.kode_order,
          nama_sepatu: "Sepatu",
          warna: null,
          layanan: "-",
          customer: order.customers?.nama,
          status_order: order.status_order?.toLowerCase(),
          review: null,
          total_harga: 0,
          foto_sebelum: null,
          foto_sesudah: null,
          tanggal_order: order.tgl_order,
        },
      ];
    }

    return details
      .filter((detail) => {
        if (!keyword) return true;

        return [detail.merk, detail.jenis_sepatu].some((value) =>
          value?.toLowerCase().includes(keyword),
        );
      })
      .map((detail) => ({
        id_detail_orders: detail.id_detail_orders,
        id_orders: order.id_orders,
        kode_order: order.kode_order,
        nama_sepatu: `${detail.merk || "-"} ${detail.jenis_sepatu || "-"}`,
        warna: detail.warna,
        layanan: detail.services?.nama_layanan || "-",
        customer: order.customers?.nama,
        status_order: order.status_order?.toLowerCase(),
        review: detail.review,
        total_harga: Number(detail.total_harga || 0),
        foto_sebelum: detail.foto_sebelum,
        foto_sesudah: detail.foto_sesudah,
        tanggal_order: order.tgl_order,
      }));
  });

  const aktivitasTerkini = limit ? activityRows.slice(0, limit) : activityRows;

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

    aktivitas_terkini: aktivitasTerkini,
  };
};
