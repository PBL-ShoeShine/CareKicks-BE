const supabase = require("../../../core/config/supabase");

const getDetailOrder = async (orderId, customerId) => {
  // Ambil data order (Ubah .single() menjadi query array biasa agar mencegah crash)
  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      shops (
        id_shops,
        nm_toko,
        alamat_toko,
        lat_toko,
        long_toko
      ),
      staff:users!id_staff (
        nama
      )
    `,
    )
    .eq("id_orders", orderId)
    .eq("id_customer", customerId);

  if (orderError) throw new Error(orderError.message);

  // Jika orders kosong, lempar error yang akan ditangkap sebagai 404 oleh controller
  if (!orders || orders.length === 0)
    throw new Error("Pesanan tidak ditemukan");

  // Karena aman dan ada datanya, ambil indeks ke-0
  const order = orders[0];

  // Ambil item detail order
  const { data: items, error: itemsError } = await supabase
    .from("detail_orders")
    .select(
      `
      *,
      services (
        id_services,
        nama_layanan,
        harga
      )
    `,
    )
    .eq("id_orders", orderId);

  if (itemsError) throw new Error(itemsError.message);

  // Ambil timeline dari order_status_history
  const { data: timeline, error: timelineError } = await supabase
    .from("order_status_history")
    .select(
      `
      id_history,
      status,
      keterangan,
      changed_by_role,
      created_at,
      staff (
        id_staff,
        staff_profile (
          nama
        )
      )
    `,
    )
    .eq("id_orders", orderId)
    .order("created_at", { ascending: true });

  if (timelineError) throw new Error(timelineError.message);

  // Normalisasi: ambil nama dari staff → staff_profile → nama
  const assignedStaffName = order.staff?.nama ?? null;

  const findStaffInGroup = (statusGroup) => {
    for (const entry of (timeline || [])) {
      if (statusGroup.includes(entry.status)) {
        const name = entry.staff?.staff_profile?.nama;
        if (name) return name;
      }
    }
    return null;
  };

  const timelineNormalized = (timeline || []).map((item) => {
    let namaStaff = item.staff?.staff_profile?.nama ?? null;

    if (!namaStaff) {
      // Layer 1: Workflow stage pair fallback (sedang_dijemput <-> sudah_dijemput, washing <-> selesai_cuci, sedang_diantar <-> selesai)
      if (["sedang_dijemput", "sudah_dijemput"].includes(item.status)) {
        namaStaff = findStaffInGroup(["sedang_dijemput", "sudah_dijemput"]);
      } else if (["washing", "selesai_cuci"].includes(item.status)) {
        namaStaff = findStaffInGroup(["washing", "selesai_cuci"]);
      } else if (["sedang_diantar", "selesai"].includes(item.status)) {
        namaStaff = findStaffInGroup(["sedang_diantar", "selesai"]);
      }

      // Layer 2: Order assigned staff fallback for "sedang" statuses
      if (!namaStaff && ["sedang_dijemput", "washing", "sedang_diantar"].includes(item.status)) {
        namaStaff = assignedStaffName;
      }
    }

    return {
      id_history: item.id_history,
      status: item.status,
      keterangan: item.keterangan,
      changed_by_role: item.changed_by_role,
      created_at: item.created_at,
      nama_staff: namaStaff,
    };
  });

  // Susun data untuk dikirim ke frontend
  return {
    order,
    items,
    timeline: timelineNormalized,
    payment: {
      status_pembayaran: order.status_pembayaran ?? null,
      metode_pembayaran: order.metode_bayar ?? null,
      bukti_pembayaran: order.upload_bkt_byr ?? null,
    },
  };
};

module.exports = { getDetailOrder };
