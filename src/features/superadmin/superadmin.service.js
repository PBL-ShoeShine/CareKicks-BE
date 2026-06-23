const supabase = require("../../core/config/supabase");

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getTrendData(ordersList) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGT', 'SEP', 'OKT', 'NOV', 'DES'];
  const trend = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = months[d.getMonth()];
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    
    const count = (ordersList || []).filter(order => {
      if (!order.tgl_order) return false;
      const orderDate = new Date(order.tgl_order);
      return orderDate.getFullYear() === year && orderDate.getMonth() === monthIndex;
    }).length;

    trend.push({ label, value: count });
  }
  return trend;
}

exports.getDashboardSummary = async () => {
  try {
    // 1. Count customers
    const { count: customersCount, error: errCust } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("jenis_role", "customer");
    if (errCust) throw errCust;

    // 2. Count active shops (approved/verified)
    const { count: shopsCount, error: errShops } = await supabase
      .from("shops")
      .select("*", { count: "exact", head: true })
      .in("status_verifikasi", ["approved", "verified"]);
    if (errShops) throw errShops;

    // 3. Count pending registrations
    const { count: pendingCount, error: errPending } = await supabase
      .from("shops")
      .select("*", { count: "exact", head: true })
      .eq("status_verifikasi", "pending");
    if (errPending) throw errPending;

    // 4. Sum revenue from detail_orders
    const { data: detailData, error: errDetail } = await supabase
      .from("detail_orders")
      .select("total_harga");
    if (errDetail) throw errDetail;

    const revenueSum = (detailData || []).reduce((acc, curr) => acc + Number(curr.total_harga || 0), 0);

    // 5. Monthly trend
    const { data: ordersList, error: errOrders } = await supabase
      .from("orders")
      .select("tgl_order");
    if (errOrders) throw errOrders;

    const orderTrend = getTrendData(ordersList);

    // 6. Recent activities (10 recent orders joined with shops and services)
    const { data: recentOrders, error: errRecent } = await supabase
      .from("orders")
      .select(`
        id_orders,
        tgl_order,
        status_order,
        shops (
          nm_toko
        ),
        detail_orders (
          services (
            nama_layanan
          )
        )
      `)
      .order("tgl_order", { ascending: false })
      .limit(10);
    if (errRecent) throw errRecent;

    const recentActivities = (recentOrders || []).map(order => {
      const dateObj = new Date(order.tgl_order);
      const formattedDate = isNaN(dateObj.getTime()) ? "-" : dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      return {
        id: order.id_orders,
        store: order.shops?.nm_toko || "-",
        date: formattedDate,
        service: order.detail_orders?.[0]?.services?.nama_layanan || "-",
        status: order.status_order || "pending"
      };
    });

    return {
      stats: {
        customers: {
          title: "Manajemen Pembeli",
          value: String(customersCount || 0),
          subtitle: "Total pembeli terdaftar"
        },
        activeShops: {
          title: "Jumlah Toko Aktif",
          value: String(shopsCount || 0),
          subtitle: "Toko terverifikasi"
        },
        pendingRegistrations: {
          title: "Pendaftaran Masuk",
          value: String(pendingCount || 0),
          subtitle: "Menunggu verifikasi"
        },
        revenue: {
          title: "Total Pendapatan",
          value: formatRupiah(revenueSum),
          subtitle: "Akumulasi dari detail order"
        }
      },
      orderTrend,
      recentActivities
    };
  } catch (error) {
    console.error("Error in getDashboardSummary service:", error);
    throw error;
  }
};
