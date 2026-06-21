const supabase = require("../../../core/config/supabase");

const getCart = async (id_customers) => {
  const { data, error } = await supabase
    .from("cart")
    .select(`
      id_cart,
      status_keranjang,
      shops:id_shops ( id_shops, nm_toko, foto_toko, lat_toko, long_toko ),
      cart_item (
        id_cart_item,
        id_services,
        harga_layanan,
        catatan,
        merk,
        jenis_sepatu,
        warna,
        foto_sebelum,
        services:id_services ( nama_layanan, foto_layanan )
      )
    `)
    .eq("id_customers", id_customers)
    .eq("status_keranjang", "aktif");

  if (error) throw error;

  // Format data untuk memudahkan FE merender
  const formattedData = data.map((cart) => {
    const subtotal = cart.cart_item.reduce(
      (acc, item) => acc + Number(item.harga_layanan || 0),
      0
    );

    const items = cart.cart_item.map((item) => {
      // foto_sebelum disimpan sebagai JSON array string, parse ke array
      let fotoList = item.foto_sebelum;
      if (typeof fotoList === "string") {
        try {
          fotoList = JSON.parse(fotoList);
        } catch {
          fotoList = [fotoList];
        }
      }
      return {
        ...item,
        foto_sebelum: Array.isArray(fotoList) ? fotoList : [fotoList],
      };
    });

    return {
      id_cart: cart.id_cart,
      shop: cart.shops,
      items,
      subtotal_toko: subtotal,
    };
  });

  return formattedData;
};

const addToCart = async ({ id_customers, id_shops, id_services, harga_layanan, catatan, merk, jenis_sepatu, warna, foto_sebelum }) => {
  // 1. Cek apakah ada cart aktif untuk customer & shop ini
  let { data: cart, error: cartError } = await supabase
    .from("cart")
    .select("id_cart")
    .eq("id_customers", id_customers)
    .eq("id_shops", id_shops)
    .eq("status_keranjang", "aktif")
    .maybeSingle();

  if (cartError) throw cartError;

  let idCart;
  if (!cart) {
    // Buat cart baru jika belum ada
    const { data: newCart, error: newCartError } = await supabase
      .from("cart")
      .insert([{ id_customers, id_shops, status_keranjang: "aktif" }])
      .select("id_cart")
      .single();

    if (newCartError) throw newCartError;
    idCart = newCart.id_cart;
  } else {
    idCart = cart.id_cart;
  }

  // 2. Tambahkan item ke cart_item
  const { data: newItem, error: itemError } = await supabase
    .from("cart_item")
    .insert([
      {
        id_cart: idCart,
        id_services,
        harga_layanan,
        catatan,
        merk,
        jenis_sepatu,
        warna,
        foto_sebelum,
      },
    ])
    .select()
    .single();

  if (itemError) throw itemError;

  return newItem;
};

const deleteCartItem = async (id_cart_item) => {
  // Ambil id_cart dari item yang mau dihapus
  const { data: item, error: itemError } = await supabase
    .from("cart_item")
    .select("id_cart")
    .eq("id_cart_item", id_cart_item)
    .single();

  if (itemError) throw itemError;
  if (!item) throw new Error("Item tidak ditemukan");

  // Hapus item
  const { error: deleteError } = await supabase
    .from("cart_item")
    .delete()
    .eq("id_cart_item", id_cart_item);

  if (deleteError) throw deleteError;

  // Cek sisa item di cart tersebut
  const { count, error: countError } = await supabase
    .from("cart_item")
    .select("*", { count: "exact", head: true })
    .eq("id_cart", item.id_cart);

  if (countError) throw countError;

  // Jika keranjang sudah kosong, hapus cart utamanya juga (atau set inaktif)
  if (count === 0) {
    await supabase.from("cart").delete().eq("id_cart", item.id_cart);
  }

  return { message: "Item berhasil dihapus" };
};

const updateCartItem = async (id_cart_item, { catatan, merk, jenis_sepatu, warna, foto_sebelum }) => {
  const updateData = {};
  if (catatan !== undefined) updateData.catatan = catatan;
  if (merk !== undefined) updateData.merk = merk;
  if (jenis_sepatu !== undefined) updateData.jenis_sepatu = jenis_sepatu;
  if (warna !== undefined) updateData.warna = warna;
  if (foto_sebelum !== undefined) updateData.foto_sebelum = foto_sebelum;

  if (Object.keys(updateData).length === 0) {
    throw new Error("Tidak ada data yang diupdate");
  }

  const { data, error } = await supabase
    .from("cart_item")
    .update(updateData)
    .eq("id_cart_item", id_cart_item)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
};
