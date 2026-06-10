const supabase = require('../../../core/config/supabase');

exports.getPaymentMethods = async (idShops) => {
  const { data, error } = await supabase
    .from('account')
    .select('*')
    .eq('id_shops', idShops)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

exports.addPaymentMethod = async (payload) => {
  const { data, error } = await supabase
    .from('account')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

exports.updatePaymentMethod = async (idAccount, idShops, payload) => {
  // Hanya update jika id_shops cocok (keamanan data)
  const { data, error } = await supabase
    .from('account')
    .update(payload)
    .eq('id_account', idAccount)
    .eq('id_shops', idShops)
    .select()
    .single();

  if (error) throw error;
  return data;
};

exports.deletePaymentMethod = async (idAccount, idShops) => {
  const { error } = await supabase
    .from('account')
    .delete()
    .eq('id_account', idAccount)
    .eq('id_shops', idShops);

  if (error) throw error;
  return true;
};