const supabase = require("../../../core/config/supabase");

const ACTIVE_SHOP_STATUSES = ["aktif", "active", "approved", "verified", "terverifikasi"];
const PENDING_SHOP_STATUSES = ["pending", "menunggu", "tertunda"];

const monthLabels = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`;
  }

  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}Jt`;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getCount = async (table, buildQuery) => {
  let query = supabase.from(table).select("*", { count: "exact", head: true });

  if (buildQuery) {
    query = buildQuery(query);
  }

  const { count, error } = await query;

  if (error) throw error;

  return count || 0;
};

exports.getDashboardData = async () => {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    customerCount,
    activeShopCount,
    pendingRegistrationCount,
    revenueResult,
    monthlyOrdersResult,
    activitiesResult,
  ] = await Promise.all([
    getCount("customers"),
    getCount("shops", (query) => query.in("status_verifikasi", ACTIVE_SHOP_STATUSES)),
    getCount("shops", (query) => query.in("status_verifikasi", PENDING_SHOP_STATUSES)),
    supabase.from("detail_orders").select("total_harga"),
    supabase.from("orders").select("tgl_order").gte("tgl_order", startMonth.toISOString()),
    supabase
      .from("orders")
      .select(
        `
        id_orders,
        tgl_order,
        status_order,
        shops (
          nm_toko
        ),
        detail_orders (
          id_detail_orders,
          services (
            nama_layanan
          )
        )
      `,
      )
      .order("tgl_order", { ascending: false })
      .limit(4),
  ]);

  if (revenueResult.error) throw revenueResult.error;
  if (monthlyOrdersResult.error) throw monthlyOrdersResult.error;
  if (activitiesResult.error) throw activitiesResult.error;

  const totalRevenue = (revenueResult.data || []).reduce(
    (sum, row) => sum + Number(row.total_harga || 0),
    0,
  );

  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthLabels[date.getMonth()],
      value: 0,
    };
  });

  const monthlyMap = new Map(monthKeys.map((month) => [month.key, month]));

  (monthlyOrdersResult.data || []).forEach((order) => {
    if (!order.tgl_order) return;

    const date = new Date(order.tgl_order);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = monthlyMap.get(key);

    if (month) {
      month.value += 1;
    }
  });

  const recentActivities = (activitiesResult.data || []).map((order) => {
    const shop = Array.isArray(order.shops) ? order.shops[0] : order.shops;
    const firstDetail = Array.isArray(order.detail_orders)
      ? order.detail_orders[0]
      : null;
    const service = Array.isArray(firstDetail?.services)
      ? firstDetail.services[0]
      : firstDetail?.services;

    return {
      id: order.id_orders,
      store: shop?.nm_toko || "-",
      date: formatDate(order.tgl_order),
      service: service?.nama_layanan || "-",
      status: order.status_order || "-",
    };
  });

  return {
    stats: {
      customers: {
        title: "Manajemen Pembeli",
        value: new Intl.NumberFormat("id-ID").format(customerCount),
        subtitle: "Total pembeli terdaftar",
      },
      activeShops: {
        title: "Jumlah Toko Aktif",
        value: new Intl.NumberFormat("id-ID").format(activeShopCount),
        subtitle: "Toko terverifikasi",
      },
      pendingRegistrations: {
        title: "Pendaftaran Masuk",
        value: new Intl.NumberFormat("id-ID").format(pendingRegistrationCount),
        subtitle: "Menunggu verifikasi",
      },
      revenue: {
        title: "Total Pendapatan",
        value: formatCurrency(totalRevenue),
        subtitle: "Akumulasi dari detail order",
      },
    },
    orderTrend: monthKeys.map(({ label, value }) => ({ label, value })),
    recentActivities,
  };
};
