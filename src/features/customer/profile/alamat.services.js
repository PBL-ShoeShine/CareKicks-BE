const supabase = require('../../../core/config/supabase');

class AlamatService {
  async getAlamat(id_user) {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('id_user', id_user)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new Error('Gagal mengambil daftar alamat: ' + error.message);
    return data || [];
  }

  async addAlamat(id_user, payload) {
    const {
      recipient_name, phone_number, full_address,
      address_label, is_default, latitude, longitude,
    } = payload;

    if (!recipient_name || !full_address) {
      throw new Error('Nama penerima dan alamat lengkap wajib diisi.');
    }

    if (is_default) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('id_user', id_user);
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert({
        id_user,
        recipient_name: recipient_name.trim(),
        phone_number:   phone_number?.trim() || null,
        full_address:   full_address.trim(),
        address_label:  address_label?.trim() || null,
        is_default:     is_default ?? false,
        latitude:       latitude  ?? null,
        longitude:      longitude ?? null,
      })
      .select()
      .single();

    if (error) throw new Error('Gagal menambahkan alamat: ' + error.message);

    if (is_default) {
      await this._syncToCustomers(id_user, full_address, latitude, longitude);
    }

    return data;
  }

  async updateAlamat(id_address, id_user, payload) {
    const {
      recipient_name, phone_number, full_address,
      address_label, is_default, latitude, longitude,
    } = payload;

    const { data: existing } = await supabase
      .from('customer_addresses')
      .select('id_address')
      .eq('id_address', id_address)
      .eq('id_user', id_user)
      .single();

    if (!existing) throw new Error('Alamat tidak ditemukan.');

    if (is_default) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('id_user', id_user);
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .update({
        recipient_name: recipient_name?.trim(),
        phone_number:   phone_number?.trim() || null,
        full_address:   full_address?.trim(),
        address_label:  address_label?.trim() || null,
        is_default:     is_default ?? false,
        latitude:       latitude  ?? null,
        longitude:      longitude ?? null,
      })
      .eq('id_address', id_address)
      .select()
      .single();

    if (error) throw new Error('Gagal memperbarui alamat: ' + error.message);

    if (is_default) {
      await this._syncToCustomers(id_user, full_address, latitude, longitude);
    }

    return data;
  }

  async setDefault(id_address, id_user) {
    const { data: existing } = await supabase
      .from('customer_addresses')
      .select('id_address, full_address, latitude, longitude')
      .eq('id_address', id_address)
      .eq('id_user', id_user)
      .single();

    if (!existing) throw new Error('Alamat tidak ditemukan.');

    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('id_user', id_user);

    const { error } = await supabase
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('id_address', id_address);

    if (error) throw new Error('Gagal mengatur alamat default: ' + error.message);

    await this._syncToCustomers(
      id_user,
      existing.full_address,
      existing.latitude,
      existing.longitude,
    );

    return true;
  }

  async deleteAlamat(id_address, id_user) {
    const { data: existing } = await supabase
      .from('customer_addresses')
      .select('id_address, is_default')
      .eq('id_address', id_address)
      .eq('id_user', id_user)
      .single();

    if (!existing) throw new Error('Alamat tidak ditemukan.');

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id_address', id_address);

    if (error) throw new Error('Gagal menghapus alamat: ' + error.message);

    if (existing.is_default) {
      const { data: remaining } = await supabase
        .from('customer_addresses')
        .select('id_address, full_address, latitude, longitude')
        .eq('id_user', id_user)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (remaining) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: true })
          .eq('id_address', remaining.id_address);

        await this._syncToCustomers(
          id_user,
          remaining.full_address,
          remaining.latitude,
          remaining.longitude,
        );
      } else {
        await this._syncToCustomers(id_user, null, null, null);
      }
    }

    return true;
  }

  // ✅ LOGIKA SINKRONISASI BARU (Auto-Healer)
  async _syncToCustomers(id_user, alamat, latitude, longitude) {
    try {
      // 1. Ambil data asli dari tabel users (nama dan no_hp pemilik akun)
      const { data: userData } = await supabase
        .from('users')
        .select('nama, no_hp')
        .eq('id_user', id_user)
        .single();

      const namaAkun = userData?.nama || 'Pelanggan';
      const noHpAkun = userData?.no_hp || null;

      // 2. Cek apakah user sudah ada di tabel customers
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id_user, nama') 
        .eq('id_user', id_user)
        .maybeSingle();

      if (existingCustomer) {
        // 3a. Jika sudah ada, UPDATE alamat.
        // Sekaligus 'menyembuhkan' kolom nama yang mungkin terlanjur NULL akibat error lama
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            alamat: alamat ?? null,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            nama: existingCustomer.nama ? existingCustomer.nama : namaAkun, // Tambalan penyembuh NULL
          })
          .eq('id_user', id_user);

        if (updateError) console.error('[AlamatService] Gagal update customers:', updateError.message);
      } else {
        // 3b. Jika belum ada (user benar-benar baru), lakukan INSERT dengan nama asli
        const { error: insertError } = await supabase
          .from('customers')
          .insert([{
            id_user: id_user,
            nama: namaAkun,
            nomor_hp: noHpAkun,
            alamat: alamat ?? null,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
          }]);

        if (insertError) console.error('[AlamatService] Gagal insert ke customers:', insertError.message);
      }
    } catch (err) {
      console.error('[AlamatService] Terjadi kesalahan saat sinkronisasi:', err.message);
    }
  }
}

module.exports = new AlamatService();